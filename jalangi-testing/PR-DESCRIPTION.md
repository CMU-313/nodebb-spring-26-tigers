## Jalangi2 Dynamic Analysis Tool - Integration & Evaluation

### Installation Evidence

- **Package**: `jalangi2` v0.2.6 added as a dependency (see `package.json`, `package-lock.json`)
- **Files added**: 15 new files across `jalangi-testing/` directory including custom analyses, target scripts, instrumented output, and a comprehensive test log

### What is Jalangi2?

Jalangi2 is a **dynamic analysis framework** for JavaScript developed at Samsung Research and UC Berkeley. Unlike static analysis tools (ESLint, JSHint), Jalangi2 **instruments code at runtime**, intercepting every operation (function calls, property accesses, binary operations, branches, etc.) and allowing custom analysis callbacks to observe or modify behavior during execution.

### Artifacts

| File | Description |
|------|-------------|
| `package.json` / `package-lock.json` | Jalangi2 NPM installation evidence |
| `jalangi-testing/jalangi2-full-output.txt` | **Complete terminal output** from 13 test runs (721 lines) |
| `jalangi-testing/analysis-function-tracer.js` | Custom analysis: tracks function calls, counts, and call-graph edges |
| `jalangi-testing/analysis-type-coercion-detector.js` | Custom analysis: detects implicit type coercions (NaN, loose equality, string coercion) |
| `jalangi-testing/analysis-property-access-tracker.js` | Custom analysis: monitors property reads/writes and null/undefined base accesses |
| `jalangi-testing/target-nodebb-patterns.js` | Test target with common NodeBB patterns and deliberate anti-patterns |
| `jalangi-testing/target-nodebb-realworld.js` | Realistic NodeBB simulation (users, topics, replies, search, pagination, hooks) |
| `jalangi-testing/instrumented/` | Jalangi2's instrumented output showing code transformation (137 lines → 300 lines) |

### Analyses Run

**Built-in analyses (from Jalangi2's dlint/tutorial suite):**

1. **CheckNaN** — Detected 5 NaN occurrences across `parseUserAge()` and `isNumber()` calls
2. **FunCalledWithMoreArguments** — Detected 1 call where `greetUser(name)` was called with 3 args
3. **BranchCoverage** — Tracked 22 branch points with true/false counts across both test files

**Custom analyses (written for this evaluation):**

4. **Function Call Tracer** — Tracked 36 function calls in the realistic simulation, revealing that `getUserByUid` was the most-called function (9x) and mapped caller→callee edges (e.g., `createTopic → getUserByUid` 6x)
5. **Type Coercion Detector** — Found 4 warnings in the pattern tests (2 NaN arithmetic results, 2 string+NaN concatenations) and 2 warnings in the realistic simulation (string+null concatenation)
6. **Property Access Tracker** — Tracked 251 property reads and 19 writes in the simulation, flagged 1 null/undefined base access and 1 property reading as undefined

### Performance Overhead

| Scenario | Time |
|----------|------|
| Uninstrumented execution | 0.029s |
| With Jalangi2 function tracer | 0.364s |
| **Overhead factor** | **~12.5x** |

### Assessment: Pros and Cons

#### Strengths

1. **Unmatched runtime visibility**: Jalangi2 intercepts *every* JavaScript operation — function calls, property accesses, binary ops, branches. No static tool can match this level of detail for understanding actual runtime behavior.

2. **Highly customizable analysis framework**: The callback API (`functionEnter`, `getField`, `putField`, `binary`, `conditional`, etc.) makes it straightforward to write targeted analyses. Our 3 custom analyses (50-90 lines each) were able to detect real issues in NodeBB-style code.

3. **Catches bugs static tools miss**: NaN propagation, implicit type coercions, and undefined property chains are runtime-only phenomena. Jalangi2 detected all of these in our tests (5 NaN sites, 6 type coercion warnings, 1 null-base property access).

4. **Call graph and coverage data**: The branch coverage and function tracer analyses provide quantitative data about code execution paths that's valuable for understanding test coverage and hotspots.

5. **Good built-in analyses**: The dlint suite (CheckNaN, UndefinedOffset, FunCalledWithMoreArguments, etc.) works out of the box and catches real JavaScript anti-patterns.

#### Weaknesses

1. **No ES6+ support (critical for NodeBB)**: Jalangi2's instrumentation **breaks `const` and `let` declarations** due to how it rewrites variable scoping. Running it directly on NodeBB source files (which use `'use strict'` + `const`/`let` throughout) fails with `ReferenceError: Cannot access 'X' before initialization`. This is a fundamental limitation — **the tool cannot be used on modern JavaScript without transpilation**.

2. **Significant performance overhead (~12.5x)**: Even a simple function tracer adds 12x slowdown. More complex analyses (property tracking) would be worse. This makes it impractical for large-scale or production use.

3. **Requires code execution**: Unlike static tools, Jalangi2 only analyzes code paths that are actually exercised. Dead code, rare error paths, and untested branches are invisible to it. You need good test coverage to get good analysis coverage.

4. **No async/await or Promise support**: Jalangi2 was designed before modern async JavaScript. The `async/await` patterns used heavily in NodeBB's codebase are not properly tracked — async function boundaries, promise chains, and event loop behavior are opaque to the analysis.

5. **Stale/unmaintained**: The last significant update to Jalangi2 was several years ago. No active maintenance means no fixes for modern Node.js compatibility issues.

6. **Code bloat from instrumentation**: Instrumentation expands a 137-line file to 300 lines (2.2x). For large codebases, this means significant memory and parsing overhead.

#### Customization Assessment

**A priori customization needed:**
- Target scripts must be written in ES5 (`var` instead of `const`/`let`) or the codebase must be transpiled with Babel before analysis
- Custom analysis scripts must include the `// JALANGI DO NOT INSTRUMENT` comment
- The `--inlineIID --inlineSource` flags are needed for meaningful location reporting

**Over-time customization:**
- Custom analyses can be refined based on the types of bugs encountered in the project
- The dlint analyses can be chained (`ChainedAnalyses.js`) to run multiple checks in one pass
- Thresholds and filtering can be added to reduce noise in analysis output

### Verdict

Jalangi2 is a **powerful but dated** dynamic analysis framework. Its callback-based architecture for intercepting JavaScript operations is elegant and the analysis capabilities are genuinely useful for finding runtime bugs that static tools miss. However, the **lack of ES6+ support is a dealbreaker for modern Node.js projects like NodeBB** — it requires either transpilation or rewriting target code in ES5, which undermines its practical value. For a project that uses modern JavaScript throughout, static analysis tools (ESLint with appropriate plugins) combined with runtime monitoring (Node.js `--inspect`, async_hooks) would provide better coverage with less friction.
