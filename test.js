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

    describe('error handling', () => {
        it('should handle authentication errors', (done) => {
            integration.doLookup([{ value: 'John Doe' }], { host: 'https://localhost:4444', authHost: 'https://localhost:4444' }, (err, result) => {
                assert.ok(err);
                done();
            });
        });

        it('should handle search errors', (done) => {
            integration.doLookup([{ value: 'value that doesnt exist' }], { host: 'https://localhost:5555', authHost: 'https://localhost:5555' }, (err, result) => {
                assert.ok(err);
                done();
            });
        });

        it('should handle errors on result lookup', (done) => {
            integration.doLookup([{ value: 'bad entity' }], { host: 'https://localhost:5555', authHost: 'https://localhost:5555' }, (err, result) => {
                assert.ok(err);
                done();
            });
        });
    });

    describe('integration options', () => {
        describe('validate options', () => {
            let baseOptions = {
                host: { value: 'asdf' },
                clientId: { value: 'asdf' },
                clientSecret: { value: 'asdf' },
                username: { value: 'asdf' },
                password: { value: 'asdf' },
            };

            it('should accept valid options', (done) => {
                integration.validateOptions(baseOptions, (_, errors) => {
                    assert.equal(0, errors.length);
                    done();
                });
            });

            [{ key: 'host' },
            { key: 'clientId', name: 'client id' },
            { key: 'clientSecret', name: 'client secret' },
            { key: 'username' },
            { key: 'password' }
            ].forEach((option) => {
                it(`should reject invalid ${option.key}s`, (done) => {
                    options = JSON.parse(JSON.stringify(baseOptions));
                    options[option.key] = '';
                    integration.validateOptions(options, (_, errors) => {
                        assert.equal(1, errors.length);
                        assert.include(errors[0].message, option.name ? option.name : option.key);
                        done();
                    });
                });
            });
        });
    });

    xit('should display matching opportunities', () => {

    });
});
