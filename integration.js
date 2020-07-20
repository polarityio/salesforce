const fs = require('fs');
const request = require('request');
const async = require('async');
const config = require('./config/config');
const Salesforce = require('./salesforce');
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

let salesforce;
let Logger;

/**
 * Adds stricter email validation
 * Credit: https://stackoverflow.com/a/46181
 * @param email
 * @returns {boolean} True if the email is valid for lookup in salesforce
 */
function isValidEmail(email) {
  return emailRegex.test(String(email).toLowerCase());
}

function doLookup(entities, options, cb) {
  let blocklistDomains = [];
  if (options.blocklist.length > 0) {
    blocklistDomains = options.blocklist.split(',');
  }

  entities = entities.reduce((accum, entity) => {
    if (isValidEmail(entity.value)) {
      if (blocklistDomains.length > 0) {
        let result = blocklistDomains.find((domain) => {
          return entity.value.endsWith(domain.trim());
        });

        if (!result) {
          accum.push(entity);
        }
      } else {
        accum.push(entity);
      }
    }
    return accum;
  }, []);

  Logger.debug({ entities: entities }, 'Entities');

  if (entities.length === 0) {
    // No valid emails (either invalid or were blocklisted)
    cb(null, []);
    return;
  }

  salesforce.getSummaryByEmail(entities, options, (err, results) => {
    Logger.debug({ results: results }, 'Results');
    cb(err, results);
  });
}

function _getDetails(id, isContact, options, cb) {
  async.parallel(
    {
      accounts: function(done) {
        if (isContact === true) {
          salesforce.getRelatedAccounts(id, options, (err, results) => {
            done(err, results);
          });
        } else {
          done(null);
        }
      },
      tasks: function(done) {
        salesforce.getTasks(id, options, (err, results) => {
          done(err, results);
        });
      },
      opportunities: function(done) {
        if (isContact === true) {
          salesforce.getOpportunities(id, options, (err, results) => {
            done(err, results);
          });
        } else {
          done(null);
        }
      },
      campaigns: function(done) {
        if (isContact === true) {
          salesforce.getCampaignsByContact(id, options, (err, results) => {
            done(err, results);
          });
        } else {
          salesforce.getCampaignsByLead(id, options, (err, results) => {
            done(err, results);
          });
        }
      }
    },
    cb
  );
}

function onDetails(lookupObject, options, cb) {
  async.waterfall(
    [
      function getContactDetails(done) {
        async.each(
          lookupObject.data.details.contacts,
          (contact, next) => {
            _getDetails(contact.contactId, contact.isContact, options, (err, results) => {
              contact.accounts = results.accounts;
              contact.tasks = results.tasks;
              contact.opportunities = results.opportunities;
              contact.campaigns = results.campaigns;
              next(err);
            });
          },
          done
        );
      },
      function getLeadDetails(done) {
        async.each(
          lookupObject.data.details.leads,
          (lead, next) => {
            _getDetails(lead.leadId, lead.isLead, options, (err, results) => {
              lead.tasks = results.tasks;
              lead.campaigns = results.campaigns;
              next(err);
            });
          },
          done
        );
      }
    ],
    function(err) {
      Logger.debug({ lookupObject: lookupObject }, 'onDetails');
      cb(err, lookupObject.data);
    }
  );
}

function onMessage(payload, options, cb) {
  Logger.debug({ payload: payload, options: options }, 'Received onMessage');
  switch (payload.action) {
    case 'GET_SIMILAR_OPP':
      salesforce.getSimilarOpportunities(payload.term, payload.opportunityId, options, cb);
      break;
    default:
      cb('Unexpected message type', {});
  }
}

function startup(logger) {
  Logger = logger;
  let requestOptions = {};

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
  let requestWithDefaults = request.defaults(requestOptions);

  salesforce = new Salesforce(requestWithDefaults, logger);
}

function validateOption(errors, options, optionName, errMessage) {
  if (
    !options[optionName] ||
    typeof options[optionName].value !== 'string' ||
    (typeof options[optionName].value === 'string' && options[optionName].value.length === 0)
  ) {
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

  salesforce.validateCredentials(opts, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function validateOptions(options, callback) {
  Logger.trace('Options to validate', options);

  let errors = [];

  validateOption(
    errors,
    options,
    'url',
    'You must provide a valid URL for the Salesforce instance.'
  );
  validateOption(
    errors,
    options,
    'consumerKey',
    'You must provide a valid Consumer Key for the Salesforce instance.'
  );
  validateOption(
    errors,
    options,
    'consumerSecret',
    'You must provide a valid Consumer Secret for the Salesforce instance.'
  );
  validateOption(
    errors,
    options,
    'username',
    'You must provide a valid username for the Salesforce instance.'
  );
  validateOption(
    errors,
    options,
    'password',
    'You must provide a valid password + security token for the Salesforce instance.'
  );

  if (errors.length === 0) {
    validateCanLogin(options, (err) => {
      if (err) {
        errors.push({
          key: 'consumerKey',
          message: err
        });

        errors.push({
          key: 'consumerSecret',
          message: err
        });

        errors.push({
          key: 'username',
          message: err
        });

        errors.push({
          key: 'password',
          message: err
        });
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
  onDetails: onDetails,
  onMessage: onMessage,
  validateOptions: validateOptions
};
