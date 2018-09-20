const crypto = require('crypto');
const _ = require('lodash');
const escape = require('./escape');

/**
 * Defines the contact fields we will query for and display in the template
 *
 * path {String} The query path for the field
 * display {String} The display value in the template for this field
 * hidden {boolean} if true, the field won't be sent to the template but will still be queried (defaults to false)
 * id {String} Path to the Id attribute for this field.  If present, a `type` property is also expected
 * type {String} The Type of object (Contact, User, Account, Opportunity, Lead, Task etc.)
 * format {String} "date" is the only option but this affects how the template tries to format the field
 * summary {boolean} If true, this field will be used as a tag in the summary block (only applicable to contacts and leads)
 *
 * If "id" and "type" are present then we will link to the given resource
 * @type {*[]}
 */
const CONTACT_FIELDS = [
  {
    path: 'Id',
    hidden: true
  },
  {
    path: 'Name',
    id: 'Id',
    type: 'User',
    summary: true
  },
  {
    path: 'Title',
    summary: true
  },
  {
    path: 'Phone'
  },
  {
    path: 'MobilePhone'
  },
  {
    path: 'Email'
  },
  {
    path: 'Owner.Name',
    display: 'Contact Owner',
    id: 'Owner.Id',
    type: 'User',
    summary: true
  },
  {
    path: 'Owner.Id',
    hidden: true
  }
];

const OPPORTUNITY_FIELDS = [
  {
    path: 'Opportunity.Name',
    display: 'Name',
    id: 'Opportunity.Id',
    type: 'Opportunity'
  },
  {
    path: 'Opportunity.Id',
    hidden: true
  },
  {
    path: 'Opportunity.Description',
    display: 'Description'
  },
  {
    path: 'Opportunity.CreatedDate',
    display: 'Created',
    format: 'date'
  },
  {
    path: 'Opportunity.LastModifiedDate',
    display: 'Last Modified',
    format: 'date'
  },
  {
    path: 'Opportunity.Amount',
    display: 'Amount'
  },
  {
    path: 'Opportunity.Type',
    display: 'Type'
  },
  {
    path: 'Opportunity.StageName',
    display: 'Stage'
  },
  {
    path: 'Opportunity.Owner.Name',
    display: 'Opportunity Owner',
    id: 'Opportunity.Owner.Id',
    type: 'User'
  },
  {
    path: 'Opportunity.Owner.Id',
    hidden: true
  },
  {
    path: 'Opportunity.Campaign.Name',
    display: 'Campaign Name',
    id: 'Opportunity.Campaign.Id',
    type: 'Campaign'
  },
  {
    path: 'Opportunity.Campaign.Id',
    hidden: true
  }
];

const ACCOUNT_FIELDS = [
  {
    path: 'Account.Name',
    display: 'Name',
    id: 'Account.Id',
    type: 'Account'
  },
  {
    path: 'Account.Id',
    hidden: true
  },
  {
    path: 'Account.CreatedDate',
    display: 'Created',
    format: 'date'
  },
  {
    path: 'Account.LastModifiedDate',
    display: 'Last Modified',
    format: 'date'
  },
  {
    path: 'Account.Description',
    display: 'Description'
  },
  {
    path: 'Account.Type',
    display: 'Type'
  },
  {
    path: 'Account.Owner.Name',
    display: 'Account Owner',
    id: 'Account.Owner.Id',
    type: 'User'
  },
  {
    path: 'Account.Owner.Id',
    hidden: true
  }
];

const CAMPAIGN_FIELDS = [
  {
    path: 'Campaign.Name',
    display: 'Campaign',
    id: 'Campaign.Id',
    type: 'Campaign'
  },
  {
    path: 'Campaign.Id',
    hidden: true
  },
  {
    path: 'Campaign.IsActive',
    display: 'Active'
  },
  {
    path: 'Campaign.Description',
    display: 'Description'
  },
  {
    path: 'Campaign.Status',
    display: 'Status'
  }
];

const TASK_FIELDS = [
  {
    path: 'Id',
    hidden: true
  },
  {
    path: 'CreatedDate',
    display: 'Created',
    format: 'date'
  },
  {
    path: 'ActivityDate',
    display: 'Due Date',
    format: 'date'
  },
  {
    path: 'Subject',
    id: 'Id',
    type: 'Task'
  },
  {
    path: 'Priority'
  },
  {
    path: 'Status'
  },
  {
    path: 'Description'
  },
  {
    path: 'Owner.Name',
    display: 'Task Owner',
    id: 'Owner.Id',
    type: 'User'
  },
  {
    path: 'Owner.Id',
    hidden: true
  }
];

const LEAD_FIELDS = [
  {
    path: 'Id',
    hidden: true
  },
  {
    path: 'Name',
    id: 'Id',
    type: 'Lead',
    summary: true
  },
  {
    path: 'Title',
    summary: true
  },
  {
    path: 'Phone'
  },
  {
    path: 'MobilePhone'
  },
  {
    path: 'Email'
  },
  {
    path: 'Company',
    summary: true
  },
  {
    path: 'LeadSource',
    display: 'Lead Source',
    summary: true
  },
  {
    path: 'Status',
    summary: true
  },
  {
    path: 'Owner.Name',
    display: 'Lead Owner',
    id: 'Owner.Id',
    type: 'User',
    summary: true
  },
  {
    path: 'Owner.Id',
    hidden: true
  }
];

class Salesforce {
  constructor(request, logger) {
    this.accessTokenCache = new Map();
    this.log = logger;
    this.summaryReturningQueryPartial = this._getSummaryReturningQueryPartial();
    this.selectRelatedAccountsQuery =
      'SELECT ' +
      ACCOUNT_FIELDS.map((field) => field.path).join(',') +
      ' FROM AccountContactRelation WHERE contactid=';
    this.selectTasksQuery =
      'SELECT ' + TASK_FIELDS.map((field) => field.path).join(',') + ' FROM Task WHERE WhoId=';
    this.selectOpportunityQuery =
      'SELECT ' +
      OPPORTUNITY_FIELDS.map((field) => field.path).join(',') +
      ' FROM OpportunityContactRole WHERE ContactId=';
    this.selectCampaignQuery =
      'SELECT ' + CAMPAIGN_FIELDS.map((field) => field.path).join(',') + ' FROM CampaignMember ';
    this.request = request;
  }

  _getSummaryReturningQueryPartial() {
    const contactFields = CONTACT_FIELDS.map((fieldObj) => fieldObj.path).join(',');
    const leadFields = LEAD_FIELDS.map((fieldObj) => fieldObj.path).join(',');
    return `IN EMAIL FIELDS RETURNING Contact (${contactFields}), Lead(${leadFields})`;
  }

  getSummaryByEmail(emailEntityObjects, options, cb) {
    let self = this;
    let emailEntityObjectLookup = new Map();
    let missedEmails = new Set();

    emailEntityObjects.forEach((emailEntityObject) => {
      emailEntityObjectLookup.set(emailEntityObject.value.toLowerCase(), emailEntityObject);
      missedEmails.add(emailEntityObject);
    });

    this._executeRequest(
      options,
      self._getSearchRequestOptions(self._buildSummaryQuery(emailEntityObjects), options),
      this._handleRequestError('Retrieving Contacts/Lead Info', cb, (response, body) => {
        if (!Array.isArray(body.searchRecords)) {
          cb(null, []);
          return;
        }

        let resultsByEmail = new Map();
        let result;
        let parsedFields;
        body.searchRecords.forEach((record) => {
          let entityObject = emailEntityObjectLookup.get(record.Email.toLowerCase());
          missedEmails.delete(record.Email.toLowerCase());
          switch (_.get(record, 'attributes.type').toLowerCase()) {
            case 'contact':
              parsedFields = self._processRecord(record, CONTACT_FIELDS, options);
              result = {
                name: record.Name,
                isContact: true,
                contactId: record.Id,
                fields: parsedFields
              };
              break;
            case 'lead':
              parsedFields = self._processRecord(record, LEAD_FIELDS, options);
              result = {
                name: record.Name,
                isLead: true,
                leadId: record.Id,
                fields: parsedFields
              };
          }

          let previousResult = resultsByEmail.get(record.Email.toLowerCase());
          if (previousResult) {
            if (result.isContact) {
              previousResult.data.details.contacts.push(result);
            } else {
              previousResult.data.details.leads.push(result);
            }
          } else {
            resultsByEmail.set(record.Email.toLowerCase(), {
              entity: entityObject,
              data: {
                summary: [],
                details: {
                  contacts: result.isContact ? [result] : [],
                  leads: result.isLead ? [result] : []
                }
              }
            });
          }
        });

        cb(null, Array.from(resultsByEmail.values()));
      })
    );
  }

  getRelatedAccounts(contactId, options, cb) {
    let self = this;
    let results = [];
    let query = this.selectRelatedAccountsQuery + "'" + contactId + "'";

    this._executeRequest(
      options,
      self._getQueryRequestOptions(query, options),
      self._handleRequestError('Retrieving Related Accounts', cb, (response, body) => {
        body.records.forEach((record) => {
          results.push(self._processRecord(record, ACCOUNT_FIELDS, options));
        });
        cb(null, results);
      })
    );
  }

  getTasks(whoId, options, cb) {
    let self = this;
    let results = [];
    let query = this.selectTasksQuery + "'" + whoId + "' ORDER BY CreatedDate DESC";

    this._executeRequest(
      options,
      self._getQueryRequestOptions(query, options),
      self._handleRequestError('Retrieving Tasks', cb, (response, body) => {
        body.records.forEach((record) => {
          results.push(self._processRecord(record, TASK_FIELDS, options));
        });
        cb(null, results);
      })
    );
  }

  getOpportunities(contactId, options, cb) {
    let self = this;
    let results = [];
    let query = this.selectOpportunityQuery + "'" + contactId + "' ORDER BY CreatedDate DESC";

    this._executeRequest(
      options,
      self._getQueryRequestOptions(query, options),
      self._handleRequestError('Retrieving Opportunities', cb, (response, body) => {
        body.records.forEach((record) => {
          results.push(self._processRecord(record, OPPORTUNITY_FIELDS, options));
        });
        cb(null, results);
      })
    );
  }

  getCampaignsByLead(leadId, options, cb) {
    let query =
      this.selectCampaignQuery + " WHERE LeadId='" + leadId + "' ORDER BY CreatedDate DESC";
    this._getCampaigns(query, options, cb);
  }

  getCampaignsByContact(contactId, options, cb) {
    let query =
      this.selectCampaignQuery + " WHERE ContactId='" + contactId + "' ORDER BY CreatedDate DESC";
    this._getCampaigns(query, options, cb);
  }

  validateCredentials(options, cb) {
    this._generateAccessToken(options, (error, token) => {
      if (error) {
        let requestError = error.err;
        let statusCode = _.get(error, 'response.statusCode');
        let errorDescription = _.get(error, 'body.error_description');

        if (requestError) {
          cb('Could not connect to Salesforce: ' + JSON.stringify(requestError));
        } else {
          cb(
            'Could not connect to Salesforce: ' +
              (errorDescription ? errorDescription : 'Unexpected Error ') +
              ' [HTTPCode: ' +
              statusCode +
              ']'
          );
        }
      } else {
        cb(null, true);
      }
    });
  }

  _getCampaigns(query, options, cb) {
    let self = this;
    let results = [];

    this._executeRequest(
      options,
      self._getQueryRequestOptions(query, options),
      self._handleRequestError('Retrieving Campaigns', cb, (response, body) => {
        body.records.forEach((record) => {
          results.push(self._processRecord(record, CAMPAIGN_FIELDS, options));
        });
        cb(null, results);
      })
    );
  }

  _getQueryRequestOptions(query, options) {
    return {
      url: options.url + '/services/data/v43.0/query',
      json: true,
      followRedirect: true,
      qs: {
        q: query
      }
    };
  }

  _getSearchRequestOptions(query, options) {
    return {
      url: options.url + '/services/data/v43.0/search',
      json: true,
      followRedirect: true,
      qs: {
        q: query
      }
    };
  }

  _processRecord(record, fields, options) {
    let parsedRecord = [];
    fields.forEach((fieldObject) => {
      let value = _.get(record, fieldObject.path);
      let id = _.get(record, fieldObject.id);

      // Some keys might not have a value so we don't set those
      if (value && fieldObject.hidden !== true) {
        parsedRecord.push({
          path: fieldObject.path,
          display: fieldObject.display ? fieldObject.display : fieldObject.path,
          url: id ? this._createUrl(fieldObject.type, id, options) : null,
          value: value,
          format: fieldObject.format ? fieldObject.format : 'text',
          summary: fieldObject.summary ? fieldObject.summary : false
        });
      }
    });

    return parsedRecord;
  }

  _createUrl(type, id, options) {
    return options.url + '/lightning/r/' + type + '/' + id + '/view';
  }

  _executeRequest(options, requestOptions, cb, requestCount) {
    let self = this;

    if (typeof requestCount === 'undefined') {
      requestCount = 0;
    }

    this._getAccessToken(options, (err, accessToken) => {
      if (err) {
        cb(err);
        return;
      }

      requestOptions.headers = {
        Authorization: `Bearer ${accessToken}`
      };

      self.request(requestOptions, (err, response, body) => {
        if (!err && response.statusCode === 401 && requestCount < 2) {
          // accessToken has expired
          self.accessTokenCache.delete(self._getAccessTokenCacheKey(options));

          //repeat this function to get a new access token
          self._executeRequest(options, requestOptions, cb, requestCount ? ++requestCount : 1);
          return;
        }

        cb(err, response, body);
      });
    });
  }

  _handleRequestError(errorMessage, errorCb, cb) {
    let self = this;
    return function(err, response, body) {
      if (err) {
        self.log.error({
          err: err,
          statusCode: response ? response.statusCode : null,
          body: body
        });

        errorCb({
          err: err,
          detail: 'HTTP Error: ' + errorMessage,
          body: body
        });

        return;
      }

      if (response.statusCode !== 200) {
        self.log.error({
          err: err,
          statusCode: response ? response.statusCode : null,
          body: body
        });

        errorCb({
          err: err,
          detail: 'Error: ' + errorMessage,
          body: body
        });

        return;
      }

      cb(response, body);
    };
  }

  _buildSummaryQuery(emailEntities) {
    let emails = [];
    emailEntities.forEach((email) => {
      emails.push('"' + escape(email.value) + '"');
    });
    return 'Find {' + emails.join(' OR ') + '} ' + this.summaryReturningQueryPartial;
  }

  _getAccessToken(options, cb) {
    let cacheKey = this._getAccessTokenCacheKey(options);
    if (this.accessTokenCache.has(cacheKey)) {
      cb(null, this.accessTokenCache.get(cacheKey));
    } else {
      // We have to generate the token
      this._generateAccessToken(options, cb);
    }
  }

  _generateAccessToken(options, cb) {
    let self = this;
    let requestOptions = {
      json: true,
      followRedirect: true
    };
    requestOptions.url = options.url + '/services/oauth2/token';
    requestOptions.method = 'POST';
    requestOptions.form = {
      grant_type: 'password',
      client_id: options.consumerKey,
      client_secret: options.consumerSecret,
      username: options.username,
      password: options.password
    };

    this.request(requestOptions, (err, response, body) => {
      if (err || response.statusCode != 200) {
        cb({
          err: err,
          response: response,
          username: options.username,
          body: body,
          detail: 'Error retrieving Salesforce API token'
        });
        return;
      }

      // Cache the new token
      self.accessTokenCache.set(self._getAccessTokenCacheKey(options), body.access_token);

      cb(null, body.access_token);
    });
  }

  _getAccessTokenCacheKey(options) {
    let key =
      options.url +
      options.consumerKey +
      options.consumerSecret +
      options.username +
      options.password;
    return crypto
      .createHash('sha1')
      .update(key)
      .digest('hex');
  }
}

module.exports = Salesforce;
