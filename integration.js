let async = require('async');
let request = require('request');
let config = require('./config/config');

let Logger;
let requestOptions = {
    json: true
};

function getRequestOptions() {
    return JSON.parse(JSON.stringify(requestOptions));
}

function doLookup(entities, options, callback) {
    let results = [];

    async.each(entities, (entity, callback) => {
        let id = entity.value;
        let requestOptions = getRequestOptions();
        requestOptions.url = 'https://localhost:5555/services/data/v20.0/search'
        requestOptions.qs = {
            q: 'Find {' + id + '}'
        };
        requestOptions.headers = {
            Authorization: 'Bearer access_token_contents'
        };

        request(requestOptions, (err, resp, body) => {
            if (err) {
                callback(err);
                return;
            }

            let link = 'https://localhost:5555' + body[0].attributes.url;
            requestOptions = getRequestOptions();
            requestOptions.url = link;
            requestOptions.headers = {
                Authorization: 'Bearer access_token_contents'
            };

            request(requestOptions, (err, resp, body) => {
                if (err) {
                    callback(err);
                    return;
                }

                results.push(body);
                callback();
            });
        });
    }, err => {
        callback(err, results);
    });

    // callback(null, [{ Name: 'John Doe' }]);
}

function startup(logger) {
    Logger = logger;

    if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
        requestOptions.cert = fs.readFileSync(config.request.cert);
    }

    if (typeof config.request.key === 'string' && config.request.key.length > 0) {
        requestOptions.key = fs.readFileSync(config.request.key);
    }

    if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
        requestOptions.passphrase = config.request.passphrase;
    }

    if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
        requestOptions.ca = fs.readFileSync(config.request.ca);
    }

    if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
        requestOptions.proxy = config.request.proxy;
    }

    if (typeof config.request.rejectUnauthorized === 'boolean') {
        requestOptions.rejectUnauthorized = config.request.rejectUnauthorized;
    }
}

function validateOptions(options, callback) {
    callback(null, null);
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};
