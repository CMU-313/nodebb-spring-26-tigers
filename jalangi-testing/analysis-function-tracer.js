// JALANGI DO NOT INSTRUMENT

// Custom Jalangi2 analysis: Function call tracer for NodeBB
// Tracks all function entries/exits with call counts and call graph edges.

(function (sandbox) {
    var callCounts = {};
    var callStack = [];
    var callEdges = {};
    var totalCalls = 0;

    function MyAnalysis() {
        this.functionEnter = function (iid, f, dis, args) {
            var name = f.name || '(anonymous)';
            var loc = J$.iidToLocation(J$.sid, iid);
            callCounts[name] = (callCounts[name] || 0) + 1;
            totalCalls++;

            if (callStack.length > 0) {
                var caller = callStack[callStack.length - 1];
                var edge = caller + ' -> ' + name;
                callEdges[edge] = (callEdges[edge] || 0) + 1;
            }
            callStack.push(name);
        };

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            callStack.pop();
            return { returnVal: returnVal, wrappedExceptionVal: wrappedExceptionVal, isBacktrack: false };
        };

        this.endExecution = function () {
            console.log('\n========================================');
            console.log('  FUNCTION CALL TRACER RESULTS');
            console.log('========================================');
            console.log('Total function calls: ' + totalCalls);
            console.log('\n--- Call Counts ---');
            var sorted = Object.keys(callCounts).sort(function (a, b) {
                return callCounts[b] - callCounts[a];
            });
            sorted.forEach(function (name) {
                console.log('  ' + name + ': ' + callCounts[name] + ' call(s)');
            });

            console.log('\n--- Call Graph Edges ---');
            var edgeSorted = Object.keys(callEdges).sort(function (a, b) {
                return callEdges[b] - callEdges[a];
            });
            edgeSorted.forEach(function (edge) {
                console.log('  ' + edge + ' (' + callEdges[edge] + 'x)');
            });
            console.log('========================================\n');
        };
    }

    sandbox.analysis = new MyAnalysis();
})(J$);
