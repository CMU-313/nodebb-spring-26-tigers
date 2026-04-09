// Target script exercising common NodeBB code patterns for Jalangi2 analysis.
// Deliberately includes some anti-patterns (NaN propagation, undefined offsets,
// extra arguments) to demonstrate Jalangi2's dynamic lint detection capabilities.

var DEFAULT_BATCH_SIZE = 100;

function isNumber(value) {
    return !isNaN(parseInt(value, 10)) && isFinite(value);
}

function slugify(str) {
    if (!str) {
        return '';
    }
    return String(str)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .trim();
}

function validateEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }
    var atIndex = email.indexOf('@');
    var dotIndex = email.lastIndexOf('.');
    return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
}

function processBatch(items, batchSize) {
    batchSize = batchSize || DEFAULT_BATCH_SIZE;
    var results = [];
    var start = 0;
    while (start < items.length) {
        var batch = items.slice(start, start + batchSize);
        results.push(batch);
        start += batchSize;
    }
    return results;
}

function mergeSettings(defaults, overrides) {
    var result = {};
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            result[key] = defaults[key];
        }
    }
    for (var key in overrides) {
        if (overrides.hasOwnProperty(key)) {
            result[key] = overrides[key];
        }
    }
    return result;
}

// --- Pattern: NaN propagation (detected by CheckNaN) ---
function parseUserAge(input) {
    var age = parseInt(input);
    return age + 1;
}

// --- Pattern: Functions called with extra args (detected by FunCalledWithMoreArguments) ---
function greetUser(name) {
    return 'Hello, ' + name + '!';
}

// --- Pattern: Accessing undefined property offsets ---
function getNestedValue(obj, path) {
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
        current = current[parts[i]];
    }
    return current;
}

// --- Run the patterns ---
console.log('=== NodeBB Pattern Tests ===');

console.log('\n--- Slugify ---');
console.log(slugify('Hello World!'));
console.log(slugify('  Multiple   Spaces  '));
console.log(slugify(null));
console.log(slugify('Special Ch@r$!'));

console.log('\n--- Email Validation ---');
console.log(validateEmail('user@example.com'));
console.log(validateEmail('invalid-email'));
console.log(validateEmail(''));
console.log(validateEmail(42));

console.log('\n--- Batch Processing ---');
var items = [];
for (var i = 0; i < 250; i++) {
    items.push('item_' + i);
}
var batches = processBatch(items, 80);
console.log('Total items: ' + items.length + ', Batches: ' + batches.length);

console.log('\n--- Settings Merge ---');
var defaults = { theme: 'harmony', postsPerPage: 20, anonymous: false };
var overrides = { postsPerPage: 50, anonymous: true };
var merged = mergeSettings(defaults, overrides);
console.log(JSON.stringify(merged));

console.log('\n--- NaN Propagation (anti-pattern) ---');
var age1 = parseUserAge('25');
var age2 = parseUserAge('not-a-number');
var age3 = parseUserAge(undefined);
console.log('Valid age: ' + age1);
console.log('NaN from string: ' + age2);
console.log('NaN from undefined: ' + age3);

console.log('\n--- Extra Arguments (anti-pattern) ---');
console.log(greetUser('Alice', 'extra-arg-1', 'extra-arg-2'));
console.log(greetUser('Bob'));

console.log('\n--- Nested Property Access ---');
var config = { db: { host: 'localhost', port: 6379 } };
console.log(getNestedValue(config, 'db.host'));
console.log(getNestedValue(config, 'db.port'));
try {
    console.log(getNestedValue(config, 'db.missing.deep'));
} catch (e) {
    console.log('Caught expected error: ' + e.message);
}

console.log('\n--- isNumber checks ---');
console.log(isNumber(42));
console.log(isNumber('100'));
console.log(isNumber('abc'));
console.log(isNumber(NaN));

console.log('\n=== Done ===');
