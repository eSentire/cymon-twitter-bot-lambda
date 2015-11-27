module.exports = {
    'production': {
        "s3": {
            "bucket": "my-config-bucket",
            "path": "twitterbot/DO-NOT-DELETE-lambda_state_prod.json"
        },
        "twitter": {
            "auth": {
                "consumer_secret": "consumer_secret",
                "consumer_key": "consumer_key",
                "access_token": "access_token",
                "access_token_secret": "access_token_secret"
            },
            "handle": "cymonbot"
        },
        "default_state": {
            "since_id": 0
        }
    },
    'dev': {
        "s3": {
            "bucket": "my-config-bucket",
            "path": "twitterbot/lambda_state_dev.json"
        },
        "twitter": {
            "auth": {
                "consumer_secret": "consumer_secret",
                "consumer_key": "consumer_key",
                "access_token": "access_token",
                "access_token_secret": "access_token_secret"
            },
            "handle": "mydevbot"
        },
        "default_state": {
            "since_id": 0
        }
    },
    'rules': {
        'hashtags': [
            {
                'patterns': [/127\.0\.0\.\d{1,3}/],
                'tags': ["#nicetry", "#malwaremustdie"]
            }
        ]
    }
};