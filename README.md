# Cymon Twitter Bot

This is the twitter robot for Cymon.

## Configuration

1. Edit the ```settings.js``` file with your twitter API keys and the S3 bucket you want to use.
2. Edit ```Gruntfile.js``` with your Lambda function ARN number, if you want to use [Grunt](http://gruntjs.com/) for deployments (see [grunt-aws-lambda](https://github.com/Tim-B/grunt-aws-lambda)).


## Testing Locally

Install requirements:

```bash
npm install
```

>Important! Make sure the ```env``` variable is set to ```'dev'``` before testing locally.

Run module:

```bash
grunt lambda_invoke
```

Example output:

```bash
Running "lambda_invoke:default" (lambda_invoke) task

[NEW TWEET] @cymontest I don't have any reports for 127.0.0.1 #nicetry #malwaremustdie
[NEW TWEET] @cymontest I don't have any reports for 10.0.0.1
[NEW TWEET] @cymontest I have 6 events for https://cymon.io/27.77.90.171

Success!  Message:
------------------
Replied to 3 tweets (out of 4)

Done, without errors.
```

## Deploy

Using grunt:

```bash
grunt deploy
```

>Make sure the lambda execution role has S3 getItem/putItem permissions to the configuration bucket you defined in the settings file.

## Text Modification Rules

The settings file contains user-defined rules to modify the robot responses.

Rule example:

```javascript
var settings = {
    ...
    },
    'rules': {
        'hashtags': [
            ...
            {
                'patterns': [/127\.0\.0\.\d{1,3}/],
                'tags': ["#nicetry", "#malwaremustdie"]
            },
            ...
        ]
    }
};
```

### Read More

* [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
