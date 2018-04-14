let async = require('async');
let request = require('request');
let config = require('./config/config');
let requestWithDefaults;

let Logger;
let requestOptions = {
    json: true
};

function doLookup(entities, options, callback) {
    Logger.trace({ options: options });

    let results = [];
    let requestOptions = {};
    requestOptions.url = options.host + '/services/oauth2/token';
    requestOptions.method = 'POST';
    requestOptions.form = {
        grant_type: 'password',
        client_id: options.clientId,
        client_secret: options.clientSecret,
        username: options.username,
        password: options.password
    };

    Logger.trace({ requestOptions: requestOptions });

    requestWithDefaults(requestOptions, (err, resp, body) => {
        if (err || resp.statusCode != 200) {
            Logger.error({ err: err, statusCode: resp.statusCode, body: body, options: requestOptions });
            callback({ err: err, body: body });
            return;
        }

        Logger.trace({ body: body });

        let accessToken = body.access_token;

        async.each(entities, (entity, callback) => {
            let id = entity.value;
            requestOptions = {};
            requestOptions.url = options.host + '/services/data/v20.0/search'
            requestOptions.qs = {
                q: 'Find {"' + id.replace(/\-/g, '\\-') + '"}' // Salesforce API blows up on unescaped dashes
            };
            requestOptions.headers = {
                Authorization: `Bearer ${accessToken}`
            };

            Logger.trace({ requestOptions: requestOptions });

            requestWithDefaults(requestOptions, (err, resp, body) => {
                if (err || resp.statusCode != 200) {
                    Logger.error({ err: err, statusCode: resp.statusCode, body: body, options: requestOptions });
                    callback({ err: err, body: body });
                    return;
                }

                Logger.trace({ body: body });

                if (body.length == 0) {
                    results.push({ entity: entity, data: null });
                    callback();
                } else {
                    async.each(body, (searchResult, callback) => {
                        let link = options.host + searchResult.attributes.url;
                        requestOptions = {};
                        requestOptions.url = link;
                        requestOptions.headers = {
                            Authorization: `Bearer ${accessToken}`
                        };

                        Logger.trace({ requestOptions: requestOptions });

                        requestWithDefaults(requestOptions, (err, resp, body) => {
                            if (err) {
                                callback(err);
                                return;
                            }

                            Logger.trace({ body: body });

                            body.host = options.host;

                            results.push({ entity: entity, data: { details: body } });
                            callback();
                        });
                    }, err => {
                        callback(err);
                    });
                }
            });
        }, err => {
            Logger.trace({ results: results });
            callback(err, results);
        });
    });
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

    requestWithDefaults = request.defaults(requestOptions);
}

function validateOptions(options, callback) {
    Logger.trace({ options: options });
    callback(null, null);
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};
