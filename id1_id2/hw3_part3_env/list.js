"use strict";
// List operations similar to car/cdr/cadr in Scheme
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
exports.first = function (x) { return x[0]; };
exports.second = function (x) { return x[1]; };
exports.rest = function (x) { return x.slice(1); };
// A useful type predicate for homegeneous lists
exports.allT = function (isT, x) { return ramda_1.all(isT, x); };
//# sourceMappingURL=list.js.map