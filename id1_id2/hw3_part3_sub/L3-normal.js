"use strict";
// ========================================================
// L3 normal eval
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var L3_ast_1 = require("./L3-ast");
var L3_ast_2 = require("./L3-ast");
var L3_ast_3 = require("./L3-ast");
var L3_env_1 = require("./L3-env");
var L3_eval_1 = require("./L3-eval");
var L3_value_1 = require("./L3-value");
var error_1 = require("./error");
var list_1 = require("./list");
/*
Purpose: Evaluate an L3 expression with normal-eval algorithm
Signature: L3-normal-eval(exp,env)
Type: CExp * Env => Value
*/
exports.L3normalEval = function (exp, env) {
    return error_1.isError(exp) ? exp :
        L3_ast_2.isBoolExp(exp) ? exp.val :
            L3_ast_2.isNumExp(exp) ? exp.val :
                L3_ast_2.isStrExp(exp) ? exp.val :
                    L3_ast_2.isPrimOp(exp) ? exp :
                        L3_ast_2.isLitExp(exp) ? exp.val :
                            L3_ast_2.isVarRef(exp) ? L3_env_1.applyEnv(env, exp.var) :
                                L3_ast_2.isIfExp(exp) ? evalIf(exp, env) :
                                    L3_ast_2.isProcExp(exp) ? L3_value_1.makeClosure(exp.args, exp.body) :
                                        // This is the difference between applicative-eval and normal-eval
                                        // Substitute the arguments into the body without evaluating them first.
                                        L3_ast_2.isAppExp(exp) ? exports.L3normalApplyProc(exports.L3normalEval(exp.rator, env), exp.rands, env) :
                                            Error("Bad ast: " + exp);
};
var evalIf = function (exp, env) {
    var test = exports.L3normalEval(exp.test, env);
    return error_1.isError(test) ? test :
        L3_eval_1.isTrueValue(test) ? exports.L3normalEval(exp.then, env) :
            exports.L3normalEval(exp.alt, env);
};
/*
===========================================================
Normal Order Application handling

Purpose: Apply a procedure to NON evaluated arguments.
Signature: L3-normalApplyProcedure(proc, args)
Pre-conditions: proc must be a prim-op or a closure value
*/
exports.L3normalApplyProc = function (proc, args, env) {
    if (error_1.isError(proc)) {
        return proc;
    }
    else if (L3_ast_2.isPrimOp(proc)) {
        var argVals = ramda_1.map(function (arg) { return exports.L3normalEval(arg, env); }, args);
        if (error_1.hasNoError(argVals))
            return L3_eval_1.applyPrimitive(proc, argVals);
        else
            return Error(error_1.getErrorMessages(argVals));
    }
    else if (L3_value_1.isClosure(proc)) {
        // Substitute non-evaluated args into the body of the closure
        var vars = ramda_1.map(function (p) { return p.var; }, proc.params);
        var body = L3_eval_1.renameExps(proc.body);
        return L3normalEvalSeq(L3_eval_1.substitute(body, vars, args), env);
    }
    else {
        return Error("Bad proc applied " + proc);
    }
};
/*
Purpose: Evaluate a sequence of expressions
Signature: L3-normal-eval-sequence(exps, env)
Type: [List(CExp) * Env -> Value]
Pre-conditions: exps is not empty
*/
var L3normalEvalSeq = function (exps, env) {
    if (L3_ast_1.isEmpty(list_1.rest(exps)))
        return exports.L3normalEval(list_1.first(exps), env);
    else {
        exports.L3normalEval(list_1.first(exps), env);
        return L3normalEvalSeq(list_1.rest(exps), env);
    }
};
/*
Purpose: evaluate a program made up of a sequence of expressions. (Same as in L1)
When def-exp expressions are executed, thread an updated env to the continuation.
For other expressions (that have no side-effect), execute the expressions sequentially.
Signature: L3normalEvalProgram(program)
Type: [Program -> Value]
*/
var L3normalEvalProgram = function (program) {
    return exports.evalExps(program.exps, L3_env_1.makeEmptyEnv());
};
// Evaluate a sequence of expressions (in a program)
exports.evalExps = function (exps, env) {
    return L3_ast_1.isEmpty(exps) ? Error("Empty program") :
        L3_ast_2.isDefineExp(list_1.first(exps)) ? evalDefineExps(exps, env) :
            L3_ast_1.isEmpty(list_1.rest(exps)) ? exports.L3normalEval(list_1.first(exps), env) :
                error_1.isError(exports.L3normalEval(list_1.first(exps), env)) ? Error("error") :
                    exports.evalExps(list_1.rest(exps), env);
};
// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.
var evalDefineExps = function (exps, env) {
    var def = list_1.first(exps);
    var rhs = exports.L3normalEval(def.val, env);
    if (error_1.isError(rhs))
        return rhs;
    else {
        var newEnv = L3_env_1.makeEnv(def.var.var, rhs, env);
        return exports.evalExps(list_1.rest(exps), newEnv);
    }
};
exports.evalNormalParse = function (s) {
    var ast = L3_ast_3.parseL3(s);
    if (L3_ast_2.isProgram(ast)) {
        return L3normalEvalProgram(ast);
    }
    else if (L3_ast_2.isExp(ast)) {
        return exports.evalExps([ast], L3_env_1.makeEmptyEnv());
    }
    else {
        return ast;
    }
};
console.log("DONE!");
//# sourceMappingURL=L3-normal.js.map