let async = require('async');
let request = require('request');
let config = require('./config/config');
let escape = require('./escape');
let fs = require('fs');
let requestWithDefaults;

let Logger;
let requestOptions = {
    json: true,
    followRedirect: true
};

function getToken(options, callback) {
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

    //Logger.trace('Token request options', requestOptions);

    requestWithDefaults(requestOptions, (err, resp, body) => {
        if (err || resp.statusCode != 200) {
            callback({
                err: err,
                detail: 'Error retrieving Salesforce API token'
            });
            return;
        }

        callback(null, body.access_token);
    });
}

// Credit: https://stackoverflow.com/a/46181
function validEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function doLookup(entities, options, cb) {
    let results = [];

    getToken(options, (err, accessToken) => {
        if (err) {
            Logger.error('Error getting token', {error: err});
            cb(err);
            return
        }

        async.each(entities, (entity, nextEntity) => {
            if (entity.isEmail && !validEmail(entity.value)) {
                Logger.trace('Skipping email because it fails validation', entity.value);
                nextEntity();
                return;
            }

            let id = entity.value;
            requestOptions = {};
            requestOptions.url = options.host + '/services/data/v20.0/search';
            requestOptions.qs = {
                q: 'Find {"' + escape(id) + '"}'
            };
            requestOptions.headers = {
                Authorization: `Bearer ${accessToken}`
            };

            //Logger.trace('Request options to be sent', {requestOptions: requestOptions});

            requestWithDefaults(requestOptions, (err, resp, body) => {
                if (err || resp.statusCode != 200) {
                    Logger.error({err: err, statusCode: resp.statusCode, body: body});
                    callback({
                        err: err,
                        detail: 'Failed to search salesforce',
                        body: body
                    });
                    return;
                }

                //Logger.trace('Response from server', {body: body});

                if (body.length == 0) {
                    results.push({entity: entity, data: null});
                    nextEntity();
                } else {
                    async.each(body, (searchResult, nextSearchResult) => {
                        if (searchResult.attributes.type === 'Contact' ||
                            searchResult.attributes.type === 'Lead' ||
                            searchResult.attributes.type === 'Opportunity') {

                            let link = options.host + searchResult.attributes.url;
                            let requestOptions = {
                                url: link,
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            };

                            //Logger.trace({requestOptions: requestOptions});

                            requestWithDefaults(requestOptions, (err, resp, body) => {
                                if (err || resp.statusCode != 200) {
                                    nextSearchResult({
                                        err: err,
                                        detail: 'Failed to search salesforce',
                                        body: body
                                    });
                                    return;
                                }

                                //Logger.trace({body: body});

                                body.host = options.host;

                                results.push({
                                    entity: entity,
                                    data: {
                                        details: body
                                    }
                                });

                                nextSearchResult();
                            });
                        } else {
                            nextSearchResult();
                        }
                    }, err => {
                        nextEntity(err);
                    });
                }
            });
        }, err => {
            Logger.trace({results: results});
            cb(err, results);
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

function validateOption(errors, options, optionName, errMessage) {
    if (!options[optionName] || typeof options[optionName].value !== 'string' ||
        (typeof options[optionName].value === 'string' && options[optionName].value.length === 0)) {
        errors.push({
            key: optionName,
            message: errMessage
        });
    }
}

function validateCanLogin(options, callback) {

    let opts = {};
    for (let k in options) {
        opts[k] = options[k].value;
    }

    getToken(opts, (err) => {
        if (err) {
            callback('could not authorize with Salesforce: ' + JSON.stringify(err));
        } else {
            Logger.debug('Succesfully validated authentication credentials');
            callback(null);
        }
    });
}

function validateOptions(options, callback) {
    Logger.trace('Options to validate', options);

    let errors = [];

    validateOption(errors, options, 'host', 'You must provide a valid host for the Salesforce instance.');
    validateOption(errors, options, 'clientId', 'You must provide a valid client id for the Salesforce instance.');
    validateOption(errors, options, 'clientSecret', 'You must provide a valid client secret for the Salesforce instance.');
    validateOption(errors, options, 'username', 'You must provide a valid username for the Salesforce instance.');
    validateOption(errors, options, 'password', 'You must provide a valid password + security token for the Salesforce instance.');

    if (errors.length === 0) {
        validateCanLogin(options, (err) => {
            if (err) {
                errors.push(err);
            }

            callback(null, errors);
        });
    } else {
        callback(null, errors);
    }
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};
