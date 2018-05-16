"use strict";
// ========================================================
// L4-value-box: Value type definition for L4-eval-box
// Changes wrt L4-value:
// 1. refer to L4-env-box in Closure4
// 2. introduce void value type
Object.defineProperty(exports, "__esModule", { value: true });
var L3_ast_1 = require("./L3-ast");
var L3_value_1 = require("./L3-value");
exports.isThunk = function (x) { return x.tag === 'Thunk'; };
exports.makeThunk = function (exp, env) { return { tag: 'Thunk', exp: exp, env: env }; };
exports.isFunctional = function (x) { return L3_ast_1.isPrimOp(x) || exports.isClosure4(x); };
;
exports.makeClosure4 = function (params, body, env) {
    return ({ tag: "Closure4", params: params, body: body, env: env });
};
exports.isClosure4 = function (x) { return x.tag === "Closure4"; };
;
exports.isSExp4 = function (x) {
    return typeof (x) === 'string' || typeof (x) === 'boolean' || typeof (x) === 'number' ||
        L3_value_1.isSymbolSExp(x) || exports.isCompoundSExp4(x) || L3_value_1.isEmptySExp(x) || L3_ast_1.isPrimOp(x) || exports.isClosure4(x);
};
exports.makeCompoundSExp4 = function (val) {
    return ({ tag: "CompoundSexp4", val: val });
};
exports.isCompoundSExp4 = function (x) { return x.tag === "CompoundSexp4"; };
//# sourceMappingURL=L4-value-box.js.map