"use strict";
// Environment for L4 with mutation
// ================================
// An environment represents a partial function from symbols (variable names) to values.
// It supports the operation: apply-env(env,var)
// which either returns the value of var in the environment, or else throws an error.
//
// In L4-env - we saw a first solution supporting the definition of recursive functions with RecEnv / Letrec.
// It provides a solution to support recursion in a good way - but we could not achieve the same behavior as in Scheme
// with define expressions.
// We introduce here a new form of Env which supports mutation and mimics exactly the behavior of Scheme for define and set!.
//
// Box Environment
// ===============
// Represent an environment as a mapping from var to boxes containing values.
// The global environment is the root of all extended environment.
// It contains a frame that is initialized with primitive bindings
// and can be extended with the define operator.
//
// Box-Env is defined inductively by the following cases:
// * <box-env> ::= <global-env> | <extended-box-env>
// * <global-env> ::= (global-env frame) // global-env(frame:Box(Frame))
// * <extended-box-env> ::= (extended-box-env frame enclosing-env)
//      // extended-box-env(frame: Frame, enclosing-env: Box-env)
//
// Frame:
// * <fbinding> ::= (var val) // binding(var:string, val:Box(Value))
// * <frame> ::= (frame (var val)*) // frame(bindings:List(fbinding))
// applyFrame(frame, var) => val
//
// The key operation on env is applyEnv(env, var) which returns the value associated to var in env
// or returns an error if var is not defined in env.
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var error_1 = require("./error");
var makeBox = function (x) { return ([x]); };
var unbox = function (b) { return b[0]; };
var setBox = function (b, v) { b[0] = v; return; };
;
var isFBinding = function (x) { return x.tag === "FBinding"; };
var makeFBinding = function (v, val) {
    return ({ tag: "FBinding", var: v, val: makeBox(val) });
};
var getFBindingVar = function (f) { return f.var; };
exports.getFBindingVal = function (f) { return unbox(f.val); };
exports.setFBinding = function (f, val) { setBox(f.val, val); return; };
;
var makeFrame = function (vars, vals) {
    return ({ tag: "Frame", fbindings: ramda_1.zipWith(makeFBinding, vars, vals) });
};
var extendFrame = function (frame, v, val) {
    return ({ tag: "Frame", fbindings: [makeFBinding(v, val)].concat(frame.fbindings) });
};
var isFrame = function (x) { return x.tag === "Frame"; };
var frameVars = function (frame) { return ramda_1.map(getFBindingVar, frame.fbindings); };
var frameVals = function (frame) { return ramda_1.map(exports.getFBindingVal, frame.fbindings); };
var applyFrame = function (frame, v) {
    var pos = frameVars(frame).indexOf(v);
    return (pos > -1) ? frame.fbindings[pos] : Error("Var not found: " + v);
};
var setVarFrame = function (frame, v, val) {
    var bdg = applyFrame(frame, v);
    return error_1.isError(bdg) ? bdg : exports.setFBinding(bdg, val);
};
exports.isEnv = function (x) { return exports.isExtEnv(x) || exports.isGlobalEnv(x); };
/*
Purpose: lookup the value of var in env and return a mutable binding
Signature: applyEnvBdg(env, var)
Type: [Env * string -> FBinding | Error]
*/
exports.applyEnvBdg = function (env, v) {
    return exports.isGlobalEnv(env) ? applyGlobalEnvBdg(env, v) :
        exports.isExtEnv(env) ? applyExtEnvBdg(env, v) :
            Error("Bad env type " + env);
};
/*
Purpose: lookup the value of var in env.
Signature: applyEnv(env, var)
Type: [Env * string -> Value4 | Error]
*/
exports.applyEnv = function (env, v) {
    var bdg = exports.applyEnvBdg(env, v);
    return error_1.isError(bdg) ? bdg : exports.getFBindingVal(bdg);
};
;
exports.isExtEnv = function (x) { return x.tag === "ExtEnv"; };
exports.makeExtEnv = function (vs, vals, env) {
    return ({ tag: "ExtEnv", frame: makeFrame(vs, vals), env: env });
};
exports.ExtEnvVars = function (env) {
    return ramda_1.map(getFBindingVar, env.frame.fbindings);
};
exports.ExtEnvVals = function (env) {
    return ramda_1.map(exports.getFBindingVal, env.frame.fbindings);
};
var applyExtEnvBdg = function (env, v) {
    var bdg = applyFrame(env.frame, v);
    if (error_1.isError(bdg))
        return exports.applyEnvBdg(env.env, v);
    else
        return bdg;
};
;
exports.isGlobalEnv = function (x) { return x.tag === "GlobalEnv"; };
var makeGlobalEnv = function () { return ({ tag: "GlobalEnv", frame: makeBox(makeFrame([], [])) }); };
// There is a single mutable value in the type Global-env
exports.theGlobalEnv = makeGlobalEnv();
var globalEnvSetFrame = function (ge, f) { return setBox(ge.frame, f); };
exports.globalEnvAddBinding = function (v, val) {
    return globalEnvSetFrame(exports.theGlobalEnv, extendFrame(unbox(exports.theGlobalEnv.frame), v, val));
};
var applyGlobalEnvBdg = function (ge, v) {
    return applyFrame(unbox(ge.frame), v);
};
//# sourceMappingURL=L4-env-box.js.map