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
            integration.doLookup([{ value: 'John Doe' }], {}, (err, result) => {
                if (err) {
                    done(err);
                }

                assert.equal(1, result.length);
                assert.equal("John Doe", result[0].Name);
                done();
            });
        });

        it('should look up multiple contacts', (done) => {
            integration.doLookup([{ value: 'John Doe' }, { value: 'Jane Moe' }], {}, (err, result) => {
                if (err) {
                    done(err);
                }

                assert.equal("John Doe", result[0].Name);
                assert.equal("Jane Moe", result[1].Name);
                done();
            });
        });
    });

    xit('should display matching opportunities', () => {

    });
});
