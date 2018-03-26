polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    tags: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');

        return [details.Name, details.Title, details.MobilePhone].filter(entry => entry);
    })
});
