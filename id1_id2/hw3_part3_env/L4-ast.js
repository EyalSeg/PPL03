"use strict";
// ===========================================================
// AST type models for L4
// L4 extends L3 with:
// letrec and set!
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var L3_ast_1 = require("./L3-ast");
var L3_ast_2 = require("./L3-ast");
var L3_ast_3 = require("./L3-ast");
var L3_ast_4 = require("./L3-ast");
var L3_value_1 = require("./L3-value");
var L4_value_box_1 = require("./L4-value-box");
var error_1 = require("./error");
var list_1 = require("./list");
;
;
;
;
;
;
;
;
;
;
// Type value constructors for disjoint types
exports.makeProgram4 = function (exps) { return ({ tag: "Program4", exps: exps }); };
exports.makeDefineExp4 = function (v, val) {
    return ({ tag: "DefineExp4", var: v, val: val });
};
exports.makeAppExp4 = function (rator, rands) {
    return ({ tag: "AppExp4", rator: rator, rands: rands });
};
// L2
exports.makeIfExp4 = function (test, then, alt) {
    return ({ tag: "IfExp4", test: test, then: then, alt: alt });
};
exports.makeProcExp4 = function (args, body) {
    return ({ tag: "ProcExp4", args: args, body: body });
};
exports.makeBinding4 = function (v, val) {
    return ({ tag: "Binding4", var: v, val: val });
};
// L3
exports.makeLetExp4 = function (bindings, body) {
    return ({ tag: "LetExp4", bindings: bindings, body: body });
};
exports.makeLitExp4 = function (val) {
    return ({ tag: "LitExp4", val: val });
};
// L4
exports.makeLetrecExp4 = function (bindings, body) {
    return ({ tag: "LetrecExp4", bindings: bindings, body: body });
};
exports.makeSetExp4 = function (v, val) {
    return ({ tag: "SetExp4", var: v, val: val });
};
// Type predicates for disjoint types
exports.isProgram4 = function (x) { return x.tag === "Program4"; };
exports.isDefineExp4 = function (x) { return x.tag === "DefineExp4"; };
exports.isAppExp4 = function (x) { return x.tag === "AppExp4"; };
// L2
exports.isIfExp4 = function (x) { return x.tag === "IfExp4"; };
exports.isProcExp4 = function (x) { return x.tag === "ProcExp4"; };
exports.isBinding4 = function (x) { return x.tag === "Binding4"; };
exports.isLetExp4 = function (x) { return x.tag === "LetExp4"; };
exports.isLitExp4 = function (x) { return x.tag === "LitExp4"; };
exports.isLetrecExp4 = function (x) { return x.tag === "LetrecExp4"; };
exports.isSetExp4 = function (x) { return x.tag === "SetExp4"; };
// Type predicates for type unions
exports.isExp4 = function (x) { return exports.isDefineExp4(x) || exports.isCExp4(x); };
exports.isCompoundExp4 = function (x) {
    return exports.isAppExp4(x) || exports.isIfExp4(x) || exports.isProcExp4(x) || exports.isLitExp4(x) || exports.isLetExp4(x) || exports.isLetrecExp4(x) || exports.isSetExp4(x);
};
exports.isCExp4 = function (x) {
    return L3_ast_1.isAtomicExp(x) || exports.isCompoundExp4(x);
};
// ========================================================
// Parsing
var p = require("s-expression");
exports.parseL4 = function (x) {
    return exports.parseL4Sexp(p(x));
};
exports.parseL4Sexp = function (sexp) {
    return L3_ast_2.isEmpty(sexp) ? Error("Parse: Unexpected empty") :
        L3_ast_2.isArray(sexp) ? parseL4Compound(sexp) :
            L3_ast_2.isString(sexp) ? L3_ast_4.parseL3Atomic(sexp) :
                L3_ast_2.isSexpString(sexp) ? L3_ast_4.parseL3Atomic(sexp) :
                    Error("Parse: Unexpected type " + sexp);
};
var parseL4Compound = function (sexps) {
    return L3_ast_2.isEmpty(sexps) ? Error("Unexpected empty sexp") :
        (list_1.first(sexps) === "L4") ? parseProgram4(ramda_1.map(exports.parseL4Sexp, list_1.rest(sexps))) :
            (list_1.first(sexps) === "define") ? parseDefine4(list_1.rest(sexps)) :
                exports.parseL4CExp(sexps);
};
var parseProgram4 = function (es) {
    return L3_ast_2.isEmpty(es) ? Error("Empty program") :
        list_1.allT(exports.isExp4, es) ? exports.makeProgram4(es) :
            error_1.hasNoError(es) ? Error("Program cannot be embedded in another program - " + es) :
                Error(error_1.getErrorMessages(es));
};
var parseDefine4 = function (es) {
    return (es.length !== 2) ? Error("define should be (define var val) - " + es) :
        !L3_ast_2.isString(es[0]) ? Error("Expected (define <var> <CExp>) - " + es[0]) :
            error_1.safeF(function (val) { return exports.makeDefineExp4(L3_ast_3.makeVarDecl(es[0]), val); })(exports.parseL4CExp(es[1]));
};
exports.parseL4CExp = function (sexp) {
    return L3_ast_2.isArray(sexp) ? parseL4CompoundCExp(sexp) :
        L3_ast_2.isString(sexp) ? L3_ast_4.parseL3Atomic(sexp) :
            L3_ast_2.isSexpString(sexp) ? L3_ast_4.parseL3Atomic(sexp) :
                Error("Unexpected type" + sexp);
};
var parseL4CompoundCExp = function (sexps) {
    return L3_ast_2.isEmpty(sexps) ? Error("Unexpected empty") :
        list_1.first(sexps) === "if" ? parseIfExp4(sexps) :
            list_1.first(sexps) === "lambda" ? parseProcExp4(sexps) :
                list_1.first(sexps) === "let" ? parseLetExp4(sexps) :
                    list_1.first(sexps) === "letrec" ? parseLetrecExp4(sexps) :
                        list_1.first(sexps) === "set!" ? parseSetExp4(sexps) :
                            list_1.first(sexps) === "quote" ? exports.parseLitExp4(sexps) :
                                parseAppExp4(sexps);
};
var parseAppExp4 = function (sexps) {
    return error_1.safeFL(function (cexps) { return exports.makeAppExp4(list_1.first(cexps), list_1.rest(cexps)); })(ramda_1.map(exports.parseL4CExp, sexps));
};
var parseIfExp4 = function (sexps) {
    return error_1.safeFL(function (cexps) { return exports.makeIfExp4(cexps[0], cexps[1], cexps[2]); })(ramda_1.map(exports.parseL4CExp, list_1.rest(sexps)));
};
var parseProcExp4 = function (sexps) {
    return error_1.safeFL(function (body) { return exports.makeProcExp4(ramda_1.map(L3_ast_3.makeVarDecl, sexps[1]), body); })(ramda_1.map(exports.parseL4CExp, list_1.rest(list_1.rest(sexps))));
};
// LetExp ::= (let (<binding>*) <cexp>+)
var parseLetExp4 = function (sexps) {
    return sexps.length < 3 ? Error("Expected (let (<binding>*) <cexp>+) - " + sexps) :
        safeMakeLetExp4(parseBindings4(sexps[1]), ramda_1.map(exports.parseL4CExp, sexps.slice(2)));
};
var safeMakeLetExp4 = function (bindings, body) {
    return error_1.isError(bindings) ? bindings :
        error_1.hasNoError(body) ? exports.makeLetExp4(bindings, body) :
            Error(error_1.getErrorMessages(body));
};
var parseBindings4 = function (pairs) {
    return safeMakeBindings4(L3_ast_4.parseDecls(ramda_1.map(list_1.first, pairs)), ramda_1.map(exports.parseL4CExp, ramda_1.map(list_1.second, pairs)));
};
var safeMakeBindings4 = function (decls, vals) {
    return error_1.isError(decls) ? decls :
        error_1.hasNoError(vals) ? ramda_1.zipWith(exports.makeBinding4, decls, vals) :
            Error(error_1.getErrorMessages(vals));
};
// LetrecExp ::= (letrec (<binding>*) <cexp>+)
var parseLetrecExp4 = function (sexps) {
    return sexps.length < 3 ? Error("Expected (letrec (<binding>*) <cexp>+) - " + sexps) :
        safeMakeLetrecExp4(parseBindings4(sexps[1]), ramda_1.map(exports.parseL4CExp, sexps.slice(2)));
};
var safeMakeLetrecExp4 = function (bindings, body) {
    return error_1.isError(bindings) ? bindings :
        error_1.hasNoError(body) ? exports.makeLetrecExp4(bindings, body) :
            Error(error_1.getErrorMessages(body));
};
var parseSetExp4 = function (es) {
    return (es.length !== 2) ? Error("set! should be (set! var val) - " + es) :
        !L3_ast_2.isString(es[0]) ? Error("Expected (set! <var> <CExp>) - " + es[0]) :
            error_1.safeF(function (val) { return exports.makeSetExp4(L3_ast_3.makeVarRef(es[0]), val); })(exports.parseL4CExp(es[1]));
};
exports.parseLitExp4 = function (sexps) {
    return error_1.safeF(exports.makeLitExp4)(exports.parseSExp4(list_1.second(sexps)));
};
// x is the output of p (sexp parser)
exports.parseSExp4 = function (x) {
    return x === "#t" ? true :
        x === "#f" ? false :
            L3_ast_2.isNumericString(x) ? +x :
                L3_ast_2.isSexpString(x) ? x.toString() :
                    L3_ast_2.isString(x) ? L3_value_1.makeSymbolSExp(x) :
                        x.length === 0 ? L3_value_1.makeEmptySExp() :
                            L3_ast_2.isArray(x) ? L4_value_box_1.makeCompoundSExp4(ramda_1.map(exports.parseSExp4, x)) :
                                Error("Bad literal expression: " + x);
};
//# sourceMappingURL=L4-ast.js.map