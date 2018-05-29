polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    contacts: Ember.computed('details', function () {
        var details = this.get('details');

        return [
            { type: 'Phone', value: details.Phone },
            { type: 'Mobile', value: details.MobilePhone },
            { type: 'Fax', value: details.Fax },
            { type: 'Mailing Address', value: details.MailingStreet },
        ].filter(entry => entry.value);
    }),
    email: Ember.computed('details', function () {
        return this.get('details').Email
    }),
    isContact: Ember.computed('details', function () {
        return this.get('details').attributes.type === "Contact";
    }),
    isLead: Ember.computed('details', function () {
        return this.get('details').attributes.type === "Lead";
    }),
    isOpportunity: Ember.computed('details', function () {
        return this.get('details').attributes.type === "Opportunity";
    }),

    hasEmail: Ember.computed('details', function () {
        return !!this.get('details').Email
    }),
    hasTitle: Ember.computed('details', function () {
        return !!this.get('details').Title;
    }),
    hasContact: Ember.computed('details', function () {
        return this.get('contacts').length > 0;
    }),
    hasDepartment: Ember.computed('details', function () {
        return !!this.get('details').Department;
    }),
    hasCompany: Ember.computed('details', function () {
        return !!this.get('details').Company;
    }),
    hasStatus: Ember.computed('details', function () {
        return !!this.get('details').Status;
    }),
    hasSource: Ember.computed('details', function () {
        return !!this.get('details').Source;
    }),
    hasDescription: Ember.computed('details', function () {
        return !!this.get('details').Description;
    }),
    hasStage: Ember.computed('details', function () {
        return !!this.get('details').Stage;
    }),
    hasNextStep: Ember.computed('details', function () {
        return !!this.get('details').NextStep;
    }),
    hasExpectedRevenue: Ember.computed('details', function () {
        return !!this.get('details').ExpectedRevenue;
    })
});
