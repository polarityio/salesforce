let assert = require('chai').assert;
let integration = require('./integration');
let config = require('./config/config');
let bunyan = require('bunyan');
config.request.rejectUnauthorized = false;

describe('salesforce polarity integration', () => {
    before(() => {
        let logger = bunyan.createLogger({ name: 'Mocha Test' });
        integration.startup(logger);
    });

    xit('should display matching leads', () => {

    });

    describe('should display matching contacts', () => {
        describe('email lookup', () => {

        });

        it('should look up a single contact', (done) => {
            integration.doLookup([{ value: 'John Doe' }], { host: 'https://localhost:5555', authHost: 'https://localhost:5555' }, (err, result) => {
                if (err) {
                    done(err);
                }

                assert.equal(1, result.length);
                assert.isOk(result[0].entity);
                assert.equal("John Doe", result[0].entity.value);
                assert.equal("John Doe", result[0].data.details.Name);
                done();
            });
        });

        it('should look up multiple contacts', (done) => {
            integration.doLookup([{ value: 'John Doe' }, { value: 'Jane Moe' }], { host: 'https://localhost:5555', authHost: 'https://localhost:5555' }, (err, result) => {
                if (err) {
                    done(err);
                }

                assert.equal("John Doe", result[0].data.details.Name);
                assert.equal("Jane Moe", result[1].data.details.Name);
                done();
            });
        });

        it('should handle multiple results for a contact match', (done) => {
            integration.doLookup([{ value: 'John' }], { host: 'https://localhost:5555', authHost: 'https://localhost:5555' }, (err, result) => {
                if (err) {
                    done(err);
                }

                assert.equal("John Doe", result[0].data.details.Name);
                assert.equal("John Johnston", result[1].data.details.Name);
                done();
            });
        });
    });

    xit('should display matching opportunities', () => {

    });
});
