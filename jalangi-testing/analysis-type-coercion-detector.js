// JALANGI DO NOT INSTRUMENT

// Custom Jalangi2 analysis: Implicit type coercion detector for NodeBB
// Flags potentially dangerous implicit conversions that are common bug sources.

(function (sandbox) {
    var iidToLocation = sandbox.iidToLocation;
    var warnings = [];

    function typeOf(v) {
        if (v === null) return 'null';
        if (v === undefined) return 'undefined';
        if (v !== v) return 'NaN';
        return typeof v;
    }

    function MyAnalysis() {
        this.binary = function (iid, op, left, right, result) {
            var lt = typeOf(left);
            var rt = typeOf(right);

            if (op === '+' && lt !== rt && (lt === 'string' || rt === 'string')) {
                if (lt !== 'string' && lt !== 'number' || rt !== 'string' && rt !== 'number') {
                    warnings.push({
                        iid: sandbox.getGlobalIID(iid),
                        msg: 'String concatenation with ' + lt + ' + ' + rt +
                             ' (left=' + String(left).substring(0, 30) +
                             ', right=' + String(right).substring(0, 30) + ')',
                        type: 'string-coercion'
                    });
                }
            }

            if ((op === '==' || op === '!=') && lt !== rt) {
                warnings.push({
                    iid: sandbox.getGlobalIID(iid),
                    msg: 'Loose equality (' + op + ') comparing ' + lt + ' and ' + rt +
                         ' (left=' + String(left).substring(0, 30) +
                         ', right=' + String(right).substring(0, 30) + ')',
                    type: 'loose-equality'
                });
            }

            if (result !== result) {
                warnings.push({
                    iid: sandbox.getGlobalIID(iid),
                    msg: 'NaN result from ' + op + ' on ' + lt + ' and ' + rt,
                    type: 'nan-result'
                });
            }
        };

        this.endExecution = function () {
            console.log('\n========================================');
            console.log('  TYPE COERCION DETECTOR RESULTS');
            console.log('========================================');
            console.log('Total warnings: ' + warnings.length);
            if (warnings.length === 0) {
                console.log('  No type coercion issues detected.');
            }
            var grouped = {};
            warnings.forEach(function (w) {
                grouped[w.type] = grouped[w.type] || [];
                grouped[w.type].push(w);
            });
            Object.keys(grouped).forEach(function (type) {
                console.log('\n--- ' + type + ' (' + grouped[type].length + ' occurrences) ---');
                grouped[type].forEach(function (w) {
                    console.log('  ' + iidToLocation(w.iid) + ': ' + w.msg);
                });
            });
            console.log('========================================\n');
        };
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
