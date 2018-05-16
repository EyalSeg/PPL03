"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
exports.makeEmptyEnv = function () { return ({ tag: "EmptyEnv" }); };
exports.makeEnv = function (v, val, env) {
    return ({ tag: "Env", var: v, val: val, nextEnv: env });
};
var isEmptyEnv = function (x) { return x.tag === "EmptyEnv"; };
var isNonEmptyEnv = function (x) { return x.tag === "Env"; };
var isEnv = function (x) { return isEmptyEnv(x) || isNonEmptyEnv(x); };
exports.applyEnv = function (env, v) {
    return isEmptyEnv(env) ? Error("var not found " + v) :
        env.var === v ? env.val :
            exports.applyEnv(env.nextEnv, v);
};
//# sourceMappingURL=L3-env.js.map