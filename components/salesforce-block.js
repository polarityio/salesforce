polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    contacts: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');

        return [
            { type: 'Phone', value: details.Phone },
            { type: 'Mobile', value: details.MobilePhone },
            { type: 'Fax', value: details.Fax },
            { type: 'Mailing Address', value: details.MailingStreet },
        ].filter(entry => entry.value);
    }),
    email: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').Email
    }),
    isContact: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').attributes.type === "Contact";
    }),
    isLead: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').attributes.type === "Lead";
    }),
    isOpportunity: Ember.computed('block.data.details', function () {
        return this.get('block.data.details').attributes.type === "Opportunity";
    }),

    hasEmail: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Email
    }),
    hasTitle: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Title;
    }),
    hasContact: Ember.computed('block.data.details', function () {
        return this.get('contacts').length > 0;
    }),
    hasDepartment: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Department;
    }),
    hasCompany: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Company;
    }),
    hasStatus: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Status;
    }),
    hasSource: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Source;
    }),
    hasDescription: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Description;
    }),
    hasStage: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').Stage;
    }),
    hasNextStep: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').NextStep;
    }),
    hasExpectedRevenue: Ember.computed('block.data.details', function () {
        return !!this.get('block.data.details').ExpectedRevenue;
    })
});
