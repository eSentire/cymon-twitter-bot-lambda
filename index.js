var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var async = require('async');
var Twit = require('twit');
var request = require('request');
var settings = require('./settings');

//////////////////////////
// Environment mode
//////////////////////////

var env = 'dev';

//////////////////////////

function processHashtagRules(text) {
    for (i = 0; i < settings.rules.hashtags.length; i++) {
        for (c = 0; c < settings.rules.hashtags[i].patterns.length; c++) {
            if (settings.rules.hashtags[i].patterns[c].exec(text)) {
                return settings.rules.hashtags[i].tags.join(" ");
            }
        }
    }
}

var Worker = {};

Worker.s3get = function (bucket, path, callback) {
    s3.getObject({
        Bucket: bucket,
        Key: path
    }, function (error, data) {
        if (!error) {
            callback(null, data.Body);
        }
        else {
            callback(error);
        }
    });
};

Worker.s3put = function (bucket, path, obj, callback) {
    s3.putObject({
        Bucket: bucket,
        Key: path,
        ContentType: 'text/plain',
        Body: JSON.stringify(obj)
    }, function (error, data) {
        if (!error) {
            callback(null);
        }
        else {
            callback(error);
        }
    });
};

Worker.getState = function (callback) {
    Worker.s3get(settings[env].s3.bucket, settings[env].s3.path, function (error, data) {
        if (!error) callback(null, JSON.parse(data));
        else callback(null, settings[env].default_state)
    });
};

Worker.askCymon = function (ip, callback) {
    request("https://cymon.io/api/nexus/v1/ip/" + ip + "/events", null, function (error, response) {
        if (response.statusCode == 200) {
            var data = JSON.parse(response.body);
            callback(null, "I have " + data.count + " events for https://cymon.io/" + ip);
        }
        else callback(null, "I do not have any reports for " + ip);
    });
};

Worker.respondToTweet = function (tweet, callback) {
    var question = tweet.text.toLowerCase().replace("@" + settings[env].twitter.handle, "").trim();
    var rx = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    var ip = rx.exec(question);

    if (ip) {
        Worker.askCymon(ip, function (error, answer) {
            if (error) callback(error);
            else {
                // modify text using defined rules
                var text = "@" + tweet.user.screen_name + " " + answer;
                var mod = processHashtagRules(text);
                if (mod && mod.length > 0) text += " " + mod;
                callback(null, text);
            }
        });
    }
    else callback(null, false);
};

exports.handler = function (event, context) {
    // init twitter
    var Bot = new Twit(settings[env].twitter.auth);

    // get last tweet ID from persistent storage
    Worker.getState(function (error, bot_state) {
        var num_responses_sent = 0;

        var options = {count: 25};
        if (bot_state.since_id !== 0) options.since_id = bot_state.since_id;

        // get all recent mentions since last tweet ID
        Bot.get('statuses/mentions_timeline', options, function (error, tweets, response) {
            if (!error) {
                tweets.reverse();
                async.each(tweets, function (tweet, cb) {
                        Worker.respondToTweet(tweet, function (error, res) {
                            if (!error) {
                                if (res) {
                                    console.log('[NEW TWEET] ' + res);
                                    num_responses_sent++;
                                    // tweet back with response
                                    Bot.post('statuses/update', {status: res, in_reply_to_status_id: tweet.id_str}, cb);
                                    //cb(null, true); //dev
                                }
                                else cb(null);
                            }
                            else {
                                cb(error);
                            }
                        });
                    },
                    function (error) {
                        if (tweets.length) {
                            // update state file
                            bot_state.since_id = tweets[tweets.length - 1].id_str;
                            Worker.s3put(settings[env].s3.bucket, settings[env].s3.path, bot_state, function (error) {
                                if (!error) {
                                    // done
                                    context.succeed('Replied to ' + num_responses_sent + ' tweets (out of ' + tweets.length + ')');
                                }
                                else {
                                    // failed
                                    context.fail("Failed to save bot state: " + error);
                                }
                            });
                        }
                        else {
                            // done
                            context.succeed('No new tweets found.');
                        }
                    });
            }
            else {
                // failed
                context.fail("Twitter API call failed: " + error);
            }
        })
    });

};