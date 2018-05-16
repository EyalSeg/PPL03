"use strict";
// ========================================================
// Value type definition for L3
Object.defineProperty(exports, "__esModule", { value: true });
var L3_ast_1 = require("./L3-ast");
exports.isFunctional = function (x) { return L3_ast_1.isPrimOp(x) || exports.isClosure(x); };
;
exports.makeClosure = function (params, body) {
    return ({ tag: "Closure", params: params, body: body });
};
exports.isClosure = function (x) { return x.tag === "Closure"; };
;
;
;
exports.isSExp = function (x) {
    return typeof (x) === 'string' || typeof (x) === 'boolean' || typeof (x) === 'number' ||
        exports.isSymbolSExp(x) || exports.isCompoundSExp(x) || exports.isEmptySExp(x) || L3_ast_1.isPrimOp(x) || exports.isClosure(x);
};
exports.makeCompoundSExp = function (val) {
    return ({ tag: "CompoundSexp", val: val });
};
exports.isCompoundSExp = function (x) { return x.tag === "CompoundSexp"; };
exports.makeEmptySExp = function () { return ({ tag: "EmptySExp" }); };
exports.isEmptySExp = function (x) { return x.tag === "EmptySExp"; };
exports.makeSymbolSExp = function (val) {
    return ({ tag: "SymbolSExp", val: val });
};
exports.isSymbolSExp = function (x) { return x.tag === "SymbolSExp"; };
//# sourceMappingURL=L3-value.js.map