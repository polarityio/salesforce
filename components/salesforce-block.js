polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  actions: {
    getSimilarOpportunities(opportunity, contactIndex) {
      let self = this;

      self.set(`block.data.details.contacts.${contactIndex}.loadingSimilarOpportunities`, true);
      const payload = {
        action: 'GET_SIMILAR_OPP',
        term: opportunity.find((property) => property.path === 'Opportunity.Name').value
      };

      // This is a utility method that will send the payload to the server where it will trigger the integration's `onMessage` method
      this.sendIntegrationMessage(payload)
        .then(function(response) {
          // We set the message property to the result of response.reply
          self.set(`block.data.details.contacts.${contactIndex}.similarOpportunities`, response);
        })
        .catch(function(err) {
          // If there is an error we convert the error into a string and append it to the string ERROR!
          self.set(
            `block.data.details.contacts.${contactIndex}.similarOpportunitiesError`,
            'ERROR! ' + JSON.stringify(err)
          );
        })
        .finally(function() {
          self.set(
            `block.data.details.contacts.${contactIndex}.loadingSimilarOpportunities`,
            false
          );
        });
    }
  }
});
