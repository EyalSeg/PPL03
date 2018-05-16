"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var L3_eval_1 = require("./L3-eval");
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (define loop (lambda (x) (loop x)))\n    ((lambda ((f lazy)) 1) (loop 0)))"), 1);
//# sourceMappingURL=hw3-part3-tests.js.map