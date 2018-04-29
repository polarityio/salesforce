function escape(str) {
    // reserved charactesr in a find operation
    // ? & | ! { } [ ] ( ) ^ ~ * : \ " ' + -
    // https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_sosl_find.htm?search_text=replace
    return str
        .replace(/\?/g, '\\?')
        .replace(/\&/g, '\\&')
        .replace(/\|/g, '\\|')
        .replace(/\!/g, '\\!')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\^/g, '\\^')
        .replace(/\~/g, '\\~')
        .replace(/\*/g, '\\*')
        .replace(/\:/g, '\\:')
        .replace(/\\/g, '\\\\')
        .replace(/\"/g, '\\"')
        .replace(/\'/g, "\\'")
        .replace(/\+/g, '\\+')
        .replace(/\-/g, '\\-');
}

module.exports = escape;
