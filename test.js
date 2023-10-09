/*
TODO: Tests are being removed until the dependencies can be replaced with ones that do not have security vulnerabilities
  "devDependencies": {
    "bunyan": "^1.8.12",
    "chai": "~3.5",
    "mocha": "~3.2",
    "mountebank": "^1.14.0",
  },

let assert = require('chai').assert;
let integration = require('./integration');
let escape = require('./escape');
let config = require('./config/config');
let bunyan = require('bunyan');
config.request.rejectUnauthorized = false;

let baseOptions;

describe('salesforce polarity integration', () => {
    before(() => {
        let logger = bunyan.createLogger({ name: 'Mocha Test' });
        integration.startup(logger);

        baseOptions = {
            host: 'https://localhost:5555',
            clientId: 'asdf',
            clientSecret: 'asdf',
            username: 'asdf',
            password: 'asdf'
        };
    });

    xit('should display matching leads', () => {

    });

    describe('should display matching contacts', () => {
        describe('email lookup', () => {

        });

        it('should look up a single contact', (done) => {
            integration.doLookup([{ value: 'John Doe' }], baseOptions, (err, result) => {
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
            integration.doLookup([{ value: 'John Doe' }, { value: 'Jane Moe' }], baseOptions, (err, result) => {
                if (err) {
                    done(err);
                }

                assert.equal("John Doe", result[0].data.details.Name);
                assert.equal("Jane Moe", result[1].data.details.Name);
                done();
            });
        });

        it('should handle multiple results for a contact match', (done) => {
            integration.doLookup([{ value: 'John' }], baseOptions, (err, result) => {
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
            baseOptions.password = 'fdsa';
            integration.doLookup([{ value: 'John Doe' }], baseOptions, (err, result) => {
                assert.ok(err);
                done();
            });
        });

        it('should handle search errors', (done) => {
            integration.doLookup([{ value: 'value that doesnt exist' }], baseOptions, (err, result) => {
                assert.ok(err);
                done();
            });
        });

        it('should handle errors on result lookup', (done) => {
            integration.doLookup([{ value: 'bad entity' }], baseOptions, (err, result) => {
                assert.ok(err);
                done();
            });
        });
    });

    describe('integration options', () => {
        let options;

        before(() => {
            options = {
                host: { value: 'https://localhost:5555' },
                clientId: { value: 'asdf' },
                clientSecret: { value: 'asdf' },
                username: { value: 'asdf' },
                password: { value: 'asdf' }
            };
        });

        describe('validate options', () => {
            it('should accept valid options', (done) => {
                integration.validateOptions(options, (_, errors) => {
                    console.error(errors);
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
                    let opts = JSON.parse(JSON.stringify(options));
                    delete opts[option.key];
                    integration.validateOptions(opts, (_, errors) => {
                        assert.equal(1, errors.length);
                        assert.include(errors[0].message, option.name ? option.name : option.key);
                        done();
                    });
                });
            });
        });

        describe('check credentials work', () => {
            it('should pass good credentials', (done) => {
                integration.validateOptions(options, (_, errors) => {
                    assert.equal(0, errors.length);
                    done();
                });
            });

            it('should fail bad credentials', (done) => {
                options.password = { value: 'fdsa' };
                integration.validateOptions(options, (_, errors) => {
                    assert.equal(1, errors.length);
                    done();
                });
            });
        });
    });

    describe('escaped characters', () => {
        it('should escape all necessary characters', () => {
            assert.equal('\\-', escape('-'));
            assert.equal('\\\\&', escape('&'));
            assert.equal('\\\\?', escape('?'));
            assert.equal('\\\\|', escape('|'));
            assert.equal('\\\\!', escape('!'));
            assert.equal('\\\\{', escape('{'));
            assert.equal('\\\\}', escape('}'));
            assert.equal('\\\\[', escape('['));
            assert.equal('\\\\]', escape(']'));
            assert.equal('\\\\(', escape('('));
            assert.equal('\\\\)', escape(')'));
            assert.equal('\\\\^', escape('^'));
            assert.equal('\\\\~', escape('~'));
            assert.equal('\\\\*', escape('*'));
            assert.equal('\\\\:', escape(':'));
            assert.equal('\\\\', escape('\\'));
            assert.equal('\\"', escape('"'));
            assert.equal("\\'", escape("'"));
            assert.equal('\\+', escape('+'));
        });
    });

    xit('should display matching opportunities', () => {

    });
});
*/