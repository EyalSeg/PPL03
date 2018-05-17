"use strict";
// L3-eval.ts
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var L3_ast_1 = require("./L3-ast");
var L3_ast_2 = require("./L3-ast");
var L3_ast_3 = require("./L3-ast");
var L3_ast_4 = require("./L3-ast");
var L3_env_1 = require("./L3-env");
var L3_value_1 = require("./L3-value");
var error_1 = require("./error");
var list_1 = require("./list");
var L3_normal_1 = require("./L3-normal");
// ========================================================
// Eval functions
var L3applicativeEval = function (exp, env) {
    return error_1.isError(exp) ? exp :
        L3_ast_2.isNumExp(exp) ? exp.val :
            L3_ast_2.isBoolExp(exp) ? exp.val :
                L3_ast_2.isStrExp(exp) ? exp.val :
                    L3_ast_2.isPrimOp(exp) ? exp :
                        L3_ast_2.isVarRef(exp) ? L3_env_1.applyEnv(env, exp.var) :
                            L3_ast_2.isLitExp(exp) ? exp.val :
                                L3_ast_2.isIfExp(exp) ? evalIf(exp, env) :
                                    L3_ast_2.isProcExp(exp) ? evalProc(exp, env) :
                                        L3_ast_2.isAppExp(exp) ? evalAppExp_allowLazy(exp, env) :
                                            Error("Bad L3 AST " + exp);
};
var evalAppExp_allowLazy = function (exp, env) {
    if (error_1.isError(exp))
        return exp;
    //!hasNoError(args) ? Error(`Bad argument: ${getErrorMessages(args)}`) :
    var operator = L3applicativeEval(exp.rator, env);
    if (L3_ast_2.isPrimOp(operator)) {
        return L3applyProcedure(operator, ramda_1.map(function (rand) { return L3applicativeEval(rand, env); }, exp.rands), env);
    }
    if (L3_value_1.isClosure(operator)) {
        var closure = L3applicativeEval(exp.rator, env);
        var dec_and_rands = ramda_1.zip(operator.params, exp.rands);
        var evaluated_args = dec_and_rands.map(function (tuple) {
            return tuple[0].isLazy ?
                //valueToLitExp(tuple[1]) : 
                tuple[1] :
                valueToLitExp(L3applicativeEval(tuple[1], env));
        });
        var vars = ramda_1.map(function (v) { return v.var; }, operator.params);
        var body = exports.renameExps(closure.body);
        //let substituted = substitute(body, vars, evaluated_args)
        return L3_normal_1.evalExps(exports.substitute(body, vars, evaluated_args), env);
        //return L3normalApplyProc()
        // if (substituted.length != 1)
        //     console.log("CRITICAL ERROR!!!~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        // return L3normalEval(substituted[0], env)
        //let litArgs = map(valueToLitExp, args);
        //return normalEvalExps(substitute(body, vars, evaluated_args), env)
    }
    return Error("Bad procedure " + JSON.stringify(exp));
};
// const L3Eval_AllowLazy = (exp: CExp | Error, env: Env): Value | Thunk | Error => {
//     // TODO: if lazy return thunk
//     if (isAppExp(exp)){
//         if (isProcExp(exp.rator))
//             return L3applyProcedure(L3applicativeEval(exp.rator, env),
//             map((rand) => L3applicativeEval(rand, env),
//                 exp.rands),
//             env)
//     }
//     return L3applicativeEval(exp, env)
// }
exports.isTrueValue = function (x) {
    return error_1.isError(x) ? x :
        !(x === false);
};
var evalIf = function (exp, env) {
    var test = L3applicativeEval(exp.test, env);
    return error_1.isError(test) ? test :
        exports.isTrueValue(test) ? L3applicativeEval(exp.then, env) :
            L3applicativeEval(exp.alt, env);
};
var evalProc = function (exp, env) {
    return L3_value_1.makeClosure(exp.args, exp.body);
};
var L3applyProcedure = function (proc, args, env) {
    return error_1.isError(proc) ? proc :
        !error_1.hasNoError(args) ? Error("Bad argument: " + error_1.getErrorMessages(args)) :
            L3_ast_2.isPrimOp(proc) ? exports.applyPrimitive(proc, args) :
                L3_value_1.isClosure(proc) ? applyClosure(proc, args, env) :
                    Error("Bad procedure " + JSON.stringify(proc));
};
var valueToLitExp = function (v) {
    return L3_ast_1.isNumber(v) ? L3_ast_3.makeNumExp(v) :
        L3_ast_1.isBoolean(v) ? L3_ast_3.makeBoolExp(v) :
            L3_ast_1.isString(v) ? L3_ast_3.makeStrExp(v) :
                L3_ast_2.isPrimOp(v) ? v :
                    L3_value_1.isClosure(v) ? L3_ast_3.makeProcExp(v.params, v.body) :
                        L3_ast_3.makeLitExp(v);
};
// @Pre: none of the args is an Error (checked in applyProcedure)
var applyClosure = function (proc, args, env) {
    var vars = ramda_1.map(function (v) { return v.var; }, proc.params);
    var body = exports.renameExps(proc.body);
    var litArgs = ramda_1.map(valueToLitExp, args);
    return exports.evalExps(exports.substitute(body, vars, litArgs), env);
};
// @ some of the args are evaluated and some are not
var applyClosure_lazy = function (proc, args, env) {
    var vars = ramda_1.map(function (v) { return v.var; }, proc.params);
    var body = exports.renameExps(proc.body);
    var litArgs = ramda_1.map(valueToLitExp, args);
    return exports.evalExps(exports.substitute(body, vars, litArgs), env);
};
// For applicative eval - the type of exps should be ValueExp[] | VarRef[];
// where ValueExp is an expression which directly encodes a value:
// export type ValueExp = LitExp | NumExp | BoolExp | StrExp | PrimOp;
// In order to support normal eval as well - we generalize the types to CExp.
// @Pre: vars and exps have the same length
exports.substitute = function (body, vars, exps) {
    var subVarRef = function (e) {
        var pos = vars.indexOf(e.var);
        return ((pos > -1) ? exps[pos] : e);
    };
    var subProcExp = function (e) {
        var argNames = ramda_1.map(function (x) { return x.var; }, e.args);
        var subst = ramda_1.zip(vars, exps);
        var freeSubst = ramda_1.filter(function (ve) { return argNames.indexOf(list_1.first(ve)) === -1; }, subst);
        return L3_ast_3.makeProcExp(e.args, exports.substitute(e.body, ramda_1.map(list_1.first, freeSubst), ramda_1.map(list_1.second, freeSubst)));
    };
    var sub = function (e) {
        return L3_ast_2.isNumExp(e) ? e :
            L3_ast_2.isBoolExp(e) ? e :
                L3_ast_2.isPrimOp(e) ? e :
                    L3_ast_2.isLitExp(e) ? e :
                        L3_ast_2.isStrExp(e) ? e :
                            L3_ast_2.isVarRef(e) ? subVarRef(e) :
                                L3_ast_2.isIfExp(e) ? L3_ast_3.makeIfExp(sub(e.test), sub(e.then), sub(e.alt)) :
                                    L3_ast_2.isProcExp(e) ? subProcExp(e) :
                                        L3_ast_2.isAppExp(e) ? L3_ast_3.makeAppExp(sub(e.rator), ramda_1.map(sub, e.rands)) :
                                            e;
    };
    return ramda_1.map(sub, body);
};
/*
    Purpose: create a generator of new symbols of the form v__n
    with n incremented at each call.
*/
exports.makeVarGen = function () {
    var count = 0;
    return function (v) {
        count++;
        return v + "__" + count;
    };
};
/*
Purpose: Consistently rename bound variables in 'exps' to fresh names.
         Start numbering at 1 for all new var names.
*/
exports.renameExps = function (exps) {
    var varGen = exports.makeVarGen();
    var replace = function (e) {
        return L3_ast_2.isIfExp(e) ? L3_ast_3.makeIfExp(replace(e.test), replace(e.then), replace(e.alt)) :
            L3_ast_2.isAppExp(e) ? L3_ast_3.makeAppExp(replace(e.rator), ramda_1.map(replace, e.rands)) :
                L3_ast_2.isProcExp(e) ? replaceProc(e) :
                    e;
    };
    // Rename the params and substitute old params with renamed ones.
    //  First recursively rename all ProcExps inside the body.
    var replaceProc = function (e) {
        var oldArgs = ramda_1.map(function (arg) { return arg.var; }, e.args);
        var newArgs = ramda_1.map(varGen, oldArgs);
        var newBody = ramda_1.map(replace, e.body);
        return L3_ast_3.makeProcExp(ramda_1.map(L3_ast_3.makeVarDecl, newArgs), exports.substitute(newBody, oldArgs, ramda_1.map(L3_ast_3.makeVarRef, newArgs)));
    };
    return ramda_1.map(replace, exps);
};
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
    return L3_value_1.isCompoundSExp(v) ? list_1.first(v.val) :
        Error("Car: param is not compound " + v);
};
var cdrPrim = function (v) {
    return L3_value_1.isCompoundSExp(v) ?
        ((v.val.length > 1) ? L3_value_1.makeCompoundSExp(list_1.rest(v.val)) : L3_value_1.makeEmptySExp()) :
        Error("Cdr: param is not compound " + v);
};
var consPrim = function (v, lv) {
    return L3_value_1.isEmptySExp(lv) ? L3_value_1.makeCompoundSExp([v]) :
        L3_value_1.isCompoundSExp(lv) ? L3_value_1.makeCompoundSExp([v].concat(lv.val)) :
            Error("Cons: 2nd param is not empty or compound " + lv);
};
var isListPrim = function (v) {
    return L3_value_1.isEmptySExp(v) || L3_value_1.isCompoundSExp(v);
};
// Evaluate a sequence of expressions (in a program)
exports.evalExps = function (exps, env) {
    return L3_ast_1.isEmpty(exps) ? Error("Empty program") :
        L3_ast_2.isDefineExp(list_1.first(exps)) ? evalDefineExps(exps, env) :
            L3_ast_1.isEmpty(list_1.rest(exps)) ? L3applicativeEval(list_1.first(exps), env) :
                error_1.isError(L3applicativeEval(list_1.first(exps), env)) ? Error("error") :
                    exports.evalExps(list_1.rest(exps), env);
};
// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.
var evalDefineExps = function (exps, env) {
    var def = list_1.first(exps);
    var rhs = L3applicativeEval(def.val, env);
    if (error_1.isError(rhs))
        return rhs;
    else {
        var newEnv = L3_env_1.makeEnv(def.var.var, rhs, env);
        return exports.evalExps(list_1.rest(exps), newEnv);
    }
};
// Main program
exports.evalL3program = function (program) {
    return exports.evalExps(program.exps, L3_env_1.makeEmptyEnv());
};
exports.evalParse = function (s) {
    var ast = L3_ast_4.parseL3(s);
    if (L3_ast_2.isProgram(ast)) {
        return exports.evalL3program(ast);
    }
    else if (L3_ast_2.isExp(ast)) {
        return exports.evalExps([ast], L3_env_1.makeEmptyEnv());
    }
    else {
        return ast;
    }
};
//# sourceMappingURL=L3-eval.js.map