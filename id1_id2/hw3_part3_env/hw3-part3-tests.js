"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var L4_eval_box_1 = require("./L4-eval-box");
assert.deepEqual(L4_eval_box_1.evalParse4("\n(L4 (define loop (lambda (x) (loop x)))\n    ((lambda ((f lazy)) 1) (loop 0)))"), 1);
assert.deepEqual(L4_eval_box_1.evalParse4("\n    (L4 (if ((lambda ((x lazy)) (= x 10)) 10) #t #f))"), true);
console.log("FINISHED");
//# sourceMappingURL=hw3-part3-tests.js.map