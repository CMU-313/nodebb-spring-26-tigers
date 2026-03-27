// JALANGI DO NOT INSTRUMENT

// Custom Jalangi2 analysis: Property access tracker for NodeBB
// Monitors property reads/writes and flags access on null/undefined.

(function (sandbox) {
    var iidToLocation = sandbox.iidToLocation;
    var reads = {};
    var writes = {};
    var nullAccesses = [];
    var undefinedReads = [];
    var totalReads = 0;
    var totalWrites = 0;

    function MyAnalysis() {
        this.getFieldPre = function (iid, base, offset, isComputed, isOpAssign, isMethodCall) {
            if (base === null || base === undefined) {
                nullAccesses.push({
                    iid: sandbox.getGlobalIID(iid),
                    offset: offset,
                    baseType: base === null ? 'null' : 'undefined'
                });
            }
        };

        this.getField = function (iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            totalReads++;
            var key = String(offset);
            reads[key] = (reads[key] || 0) + 1;

            if (val === undefined && base !== null && base !== undefined && !isMethodCall) {
                undefinedReads.push({
                    iid: sandbox.getGlobalIID(iid),
                    offset: offset,
                    baseType: typeof base
                });
            }
        };

        this.putField = function (iid, base, offset, val, isComputed, isOpAssign) {
            totalWrites++;
            var key = String(offset);
            writes[key] = (writes[key] || 0) + 1;
        };

        this.endExecution = function () {
            console.log('\n========================================');
            console.log('  PROPERTY ACCESS TRACKER RESULTS');
            console.log('========================================');
            console.log('Total property reads: ' + totalReads);
            console.log('Total property writes: ' + totalWrites);

            console.log('\n--- Top 15 Most-Read Properties ---');
            var sortedReads = Object.keys(reads).sort(function (a, b) {
                return reads[b] - reads[a];
            }).slice(0, 15);
            sortedReads.forEach(function (key) {
                console.log('  .' + key + ': ' + reads[key] + ' read(s)');
            });

            console.log('\n--- Top 10 Most-Written Properties ---');
            var sortedWrites = Object.keys(writes).sort(function (a, b) {
                return writes[b] - writes[a];
            }).slice(0, 10);
            sortedWrites.forEach(function (key) {
                console.log('  .' + key + ': ' + writes[key] + ' write(s)');
            });

            if (nullAccesses.length > 0) {
                console.log('\n--- NULL/UNDEFINED BASE ACCESSES (ERRORS) ---');
                nullAccesses.forEach(function (a) {
                    console.log('  ' + iidToLocation(a.iid) + ': accessed .' + a.offset + ' on ' + a.baseType);
                });
            }

            if (undefinedReads.length > 0) {
                console.log('\n--- Properties That Read as Undefined ---');
                undefinedReads.slice(0, 20).forEach(function (r) {
                    console.log('  ' + iidToLocation(r.iid) + ': .' + r.offset + ' on ' + r.baseType);
                });
                if (undefinedReads.length > 20) {
                    console.log('  ... and ' + (undefinedReads.length - 20) + ' more');
                }
            }
            console.log('========================================\n');
        };
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
