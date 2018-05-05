polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    contacts: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');

        return [
            { type: 'Phone', value: details.Phone },
            { type: 'Mobile', value: details.MobilePhone },
            { type: 'Fax', value: details.Fax },
            { type: 'Email', value: details.Email },
            { type: 'Mailing Address', value: details.MailingStreet },
        ].filter(entry => entry.value);
    }),
    isContact: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').attributes.type === "Contact";
    }),
    isLead: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').attributes.type === "Lead";
    }),
    isOpportunity: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').attributes.type === "Opportunity";
    })
});
