"use strict";
// L4-eval-box.ts
// L4 with mutation (set!) and env-box model
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var L3_ast_1 = require("./L3-ast");
var L3_ast_2 = require("./L3-ast");
var L3_value_1 = require("./L3-value");
var L4_ast_box_1 = require("./L4-ast-box");
var L4_ast_box_2 = require("./L4-ast-box");
var L4_env_box_1 = require("./L4-env-box");
var L4_value_box_1 = require("./L4-value-box");
var error_1 = require("./error");
var list_1 = require("./list");
// ========================================================
// Eval functions
var forceValue = function (val) {
    return L4_value_box_1.isThunk(val) ?
        forceValue(exports.evalExps(val.exp, val.env)) :
        val;
};
var L4applicativeEval = function (exp, env) {
    return error_1.isError(exp) ? exp :
        L3_ast_2.isNumExp(exp) ? exp.val :
            L3_ast_2.isBoolExp(exp) ? exp.val :
                L3_ast_2.isStrExp(exp) ? exp.val :
                    L3_ast_2.isPrimOp(exp) ? exp :
                        L3_ast_2.isVarRef(exp) ? L4_env_box_1.applyEnv(env, exp.var) :
                            L4_ast_box_1.isLitExp4(exp) ? exp.val :
                                L4_ast_box_1.isIfExp4(exp) ? evalIf4(exp, env) :
                                    L4_ast_box_1.isProcExp4(exp) ? evalProc4(exp, env) :
                                        L4_ast_box_1.isLetExp4(exp) ? evalLet4(exp, env) :
                                            L4_ast_box_1.isLetrecExp4(exp) ? evalLetrec4(exp, env) :
                                                L4_ast_box_1.isSetExp4(exp) ? evalSet(exp, env) :
                                                    L4_ast_box_1.isAppExp4(exp) ? L4applyProcedure(L4applicativeEval(exp.rator, env), ramda_1.map(function (rand) { return L4applicativeEval(rand, env); }, exp.rands)) :
                                                        Error("Bad L4 AST " + exp);
};
var L4normalEval = function (exp, env) {
    return L4_ast_box_1.isAppExp4(exp) ? L4evalAppExp_normal(exp, env) :
        L4applicativeEval(exp, env);
};
var L4evalAppExp_normal = function (exp, env) {
    var proc = forceValue(L4applicativeEval(exp.rator, env));
    var args = ramda_1.map(function (rand) { return L4_value_box_1.makeThunk(rand, env); }, exp.rands);
    return error_1.isError(proc) ? proc :
        !error_1.hasNoError(args) ? Error("Bad argument: " + error_1.getErrorMessages(args)) :
            L3_ast_2.isPrimOp(proc) ? exports.applyPrimitive(proc, ramda_1.map(args, forceValue)) :
                L4_value_box_1.isClosure4(proc) ? L4applyClosure_normal(proc, args) :
                    Error("Bad procedure " + JSON.stringify(proc));
};
var L4applyClosure_normal = function (proc, args) {
    var vars = ramda_1.map(function (v) { return v.var; }, proc.params);
    var newEnv = L4_env_box_1.makeExtEnv(vars, args, proc.env);
    return L4_value_box_1.makeThunk(proc.body, newEnv);
};
exports.isTrueValue = function (x) {
    return error_1.isError(x) ? x :
        !(x === false);
};
var evalIf4 = function (exp, env) {
    var test = L4applicativeEval(exp.test, env);
    return error_1.isError(test) ? test :
        exports.isTrueValue(test) ? L4applicativeEval(exp.then, env) :
            L4applicativeEval(exp.alt, env);
};
var evalProc4 = function (exp, env) {
    return L4_value_box_1.makeClosure4(exp.args, exp.body, env);
};
// @Pre: none of the args is an Error (checked in applyProcedure)
// KEY: This procedure does NOT have an env parameter.
//      Instead we use the env of the closure.
var L4applyProcedure = function (proc, args) {
    return error_1.isError(proc) ? proc :
        !error_1.hasNoError(args) ? Error("Bad argument: " + error_1.getErrorMessages(args)) :
            L3_ast_2.isPrimOp(proc) ? exports.applyPrimitive(proc, ramda_1.map(args, forceValue)) :
                L4_value_box_1.isClosure4(proc) ? applyClosure4(proc, args) :
                    Error("Bad procedure " + JSON.stringify(proc));
};
var applyClosure4 = function (proc, args) {
    var vars = ramda_1.map(function (v) { return v.var; }, proc.params);
    return exports.evalExps(proc.body, L4_env_box_1.makeExtEnv(vars, args, proc.env));
};
// Evaluate a sequence of expressions (in a program)
exports.evalExps = function (exps, env) {
    return L3_ast_1.isEmpty(exps) ? Error("Empty program") :
        L4_ast_box_1.isDefineExp4(list_1.first(exps)) ? evalDefineExps4(exps) :
            // isEmpty(rest(exps)) ? L4normalEval(first(exps), env) :
            exps.length == 1 ? L4normalEval(list_1.first(exps), env) :
                error_1.isError(L4normalEval(list_1.first(exps), env)) ? Error("error") :
                    exports.evalExps(list_1.rest(exps), env);
};
// L4-BOX @@
// define always updates theGlobalEnv
// We also only expect defineExps at the top level.
var evalDefineExps4 = function (exps) {
    var def = list_1.first(exps);
    var rhs = L4applicativeEval(def.val, L4_env_box_1.theGlobalEnv);
    if (error_1.isError(rhs))
        return rhs;
    else {
        L4_env_box_1.globalEnvAddBinding(def.var.var, rhs);
        return exports.evalExps(list_1.rest(exps), L4_env_box_1.theGlobalEnv);
    }
};
// LET: Direct evaluation rule without syntax expansion
// compute the values, extend the env, eval the body.
var evalLet4 = function (exp, env) {
    var vals = ramda_1.map(function (v) { return L4applicativeEval(v, env); }, ramda_1.map(function (b) { return b.val; }, exp.bindings));
    var vars = ramda_1.map(function (b) { return b.var.var; }, exp.bindings);
    if (error_1.hasNoError(vals)) {
        return exports.evalExps(exp.body, L4_env_box_1.makeExtEnv(vars, vals, env));
    }
    else {
        return Error(error_1.getErrorMessages(vals));
    }
};
// LETREC: Direct evaluation rule without syntax expansion
// 1. extend the env with vars initialized to void (temporary value)
// 2. compute the vals in the new extended env
// 3. update the bindings of the vars to the computed vals
// 4. compute body in extended env
var evalLetrec4 = function (exp, env) {
    var vars = ramda_1.map(function (b) { return b.var.var; }, exp.bindings);
    var vals = ramda_1.map(function (b) { return b.val; }, exp.bindings);
    var extEnv = L4_env_box_1.makeExtEnv(vars, ramda_1.repeat(undefined, vars.length), env);
    // @@ Compute the vals in the extended env
    var cvals = ramda_1.map(function (v) { return L4applicativeEval(v, extEnv); }, vals);
    if (error_1.hasNoError(cvals)) {
        // Bind vars in extEnv to the new values
        ramda_1.zipWith(function (bdg, cval) { return L4_env_box_1.setFBinding(bdg, cval); }, extEnv.frame.fbindings, cvals);
        return exports.evalExps(exp.body, extEnv);
    }
    else {
        return Error(error_1.getErrorMessages(cvals));
    }
};
// L4-eval-box: Handling of mutation with set!
var evalSet = function (exp, env) {
    var v = exp.var.var;
    var val = L4applicativeEval(exp.val, env);
    if (error_1.isError(val))
        return val;
    else {
        var bdg = L4_env_box_1.applyEnvBdg(env, v);
        if (error_1.isError(bdg)) {
            return Error("Var not found " + v);
        }
        else {
            L4_env_box_1.setFBinding(bdg, val);
            return undefined;
        }
    }
};
// ========================================================
// Primitives
// @Pre: none of the args is an Error (checked in applyProcedure)
exports.applyPrimitive = function (proc, args) {
    return proc.op === "+" ? (list_1.allT(L3_ast_1.isNumber, args) ? ramda_1.reduce(function (x, y) { return x + y; }, 0, args) : Error("+ expects numbers only")) :
        proc.op === "-" ? minusPrim(args) :
            proc.op === "*" ? (list_1.allT(L3_ast_1.isNumber, args) ? ramda_1.reduce(function (x, y) { return x * y; }, 1, args) : Error("* expects numbers only")) :
                proc.op === "/" ? divPrim(args) :
                    proc.op === ">" ? args[0] > args[1] :
                        proc.op === "<" ? args[0] < args[1] :
                            proc.op === "=" ? args[0] === args[1] :
                                proc.op === "not" ? !args[0] :
                                    proc.op === "eq?" ? eqPrim(args) :
                                        proc.op === "string=?" ? args[0] === args[1] :
                                            proc.op === "cons" ? consPrim(args[0], args[1]) :
                                                proc.op === "car" ? carPrim(args[0]) :
                                                    proc.op === "cdr" ? cdrPrim(args[0]) :
                                                        proc.op === "list?" ? isListPrim(args[0]) :
                                                            proc.op === "number?" ? typeof (args[0]) === 'number' :
                                                                proc.op === "boolean?" ? typeof (args[0]) === 'boolean' :
                                                                    proc.op === "symbol?" ? L3_value_1.isSymbolSExp(args[0]) :
                                                                        proc.op === "string?" ? L3_ast_1.isString(args[0]) :
                                                                            Error("Bad primitive op " + proc.op);
};
var minusPrim = function (args) {
    // TODO complete
    var x = args[0], y = args[1];
    if (L3_ast_1.isNumber(x) && L3_ast_1.isNumber(y)) {
        return x - y;
    }
    else {
        return Error("Type error: - expects numbers " + args);
    }
};
var divPrim = function (args) {
    // TODO complete
    var x = args[0], y = args[1];
    if (L3_ast_1.isNumber(x) && L3_ast_1.isNumber(y)) {
        return x / y;
    }
    else {
        return Error("Type error: / expects numbers " + args);
    }
};
var eqPrim = function (args) {
    var x = args[0], y = args[1];
    if (L3_value_1.isSymbolSExp(x) && L3_value_1.isSymbolSExp(y)) {
        return x.val === y.val;
    }
    else if (L3_value_1.isEmptySExp(x) && L3_value_1.isEmptySExp(y)) {
        return true;
    }
    else if (L3_ast_1.isNumber(x) && L3_ast_1.isNumber(y)) {
        return x === y;
    }
    else if (L3_ast_1.isString(x) && L3_ast_1.isString(y)) {
        return x === y;
    }
    else if (L3_ast_1.isBoolean(x) && L3_ast_1.isBoolean(y)) {
        return x === y;
    }
    else {
        return false;
    }
};
var carPrim = function (v) {
    return L4_value_box_1.isCompoundSExp4(v) ? list_1.first(v.val) :
        Error("Car: param is not compound " + v);
};
var cdrPrim = function (v) {
    return L4_value_box_1.isCompoundSExp4(v) ?
        ((v.val.length > 1) ? L4_value_box_1.makeCompoundSExp4(list_1.rest(v.val)) : L3_value_1.makeEmptySExp()) :
        Error("Cdr: param is not compound " + v);
};
var consPrim = function (v, lv) {
    return L3_value_1.isEmptySExp(lv) ? L4_value_box_1.makeCompoundSExp4([v]) :
        L4_value_box_1.isCompoundSExp4(lv) ? L4_value_box_1.makeCompoundSExp4([v].concat(lv.val)) :
            Error("Cons: 2nd param is not empty or compound " + lv);
};
var isListPrim = function (v) {
    return L3_value_1.isEmptySExp(v) || L4_value_box_1.isCompoundSExp4(v);
};
// Main program
exports.evalL4program = function (program) {
    return exports.evalExps(program.exps, L4_env_box_1.theGlobalEnv);
};
exports.evalParse4 = function (s) {
    var ast = L4_ast_box_2.parseL4(s);
    if (L4_ast_box_1.isProgram4(ast)) {
        return forceValue(exports.evalL4program(ast));
    }
    else if (L4_ast_box_1.isExp4(ast)) {
        return forceValue(exports.evalExps([ast], L4_env_box_1.theGlobalEnv));
    }
    else {
        return ast;
    }
};
//# sourceMappingURL=L4-eval-box.js.map