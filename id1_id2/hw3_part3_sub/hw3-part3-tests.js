"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var L3_eval_1 = require("./L3-eval");
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (define loop (lambda (x) (loop x)))\n    ((lambda ((f lazy)) 1) (loop 0)))"), 1);
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~L3-tests.ts~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var ramda_1 = require("ramda");
var L3_ast_1 = require("./L3-ast");
var L3_ast_2 = require("./L3-ast");
var L3_ast_3 = require("./L3-ast");
var L3_eval_2 = require("./L3-eval");
var L3_value_1 = require("./L3-value");
var list_1 = require("./list");
// ========================================================
// TESTS Parser
// Atomic
assert(L3_ast_3.isNumExp(L3_ast_1.parseL3("1")));
assert(L3_ast_3.isBoolExp(L3_ast_1.parseL3("#t")));
assert(L3_ast_3.isVarRef(L3_ast_1.parseL3("x")));
assert(L3_ast_3.isStrExp(L3_ast_1.parseL3('"a"')));
assert(L3_ast_3.isPrimOp(L3_ast_1.parseL3(">")));
assert(L3_ast_3.isPrimOp(L3_ast_1.parseL3("=")));
assert(L3_ast_3.isPrimOp(L3_ast_1.parseL3("string=?")));
assert(L3_ast_3.isPrimOp(L3_ast_1.parseL3("eq?")));
assert(L3_ast_3.isPrimOp(L3_ast_1.parseL3("cons")));
// Program
assert(L3_ast_3.isProgram(L3_ast_1.parseL3("(L3 (define x 1) (> (+ x 1) (* x x)))")));
// Define
assert(L3_ast_3.isDefineExp(L3_ast_1.parseL3("(define x 1)")));
{
    var def = L3_ast_1.parseL3("(define x 1)");
    if (L3_ast_3.isDefineExp(def)) {
        assert(L3_ast_3.isVarDecl(def.var));
        assert(L3_ast_3.isNumExp(def.val));
    }
}
// Application
assert(L3_ast_3.isAppExp(L3_ast_1.parseL3("(> x 1)")));
assert(L3_ast_3.isAppExp(L3_ast_1.parseL3("(> (+ x x) (* x x))")));
// L2 - If, Proc
assert(L3_ast_3.isIfExp(L3_ast_1.parseL3("(if #t 1 2)")));
assert(L3_ast_3.isIfExp(L3_ast_1.parseL3("(if (< x 2) x 2)")));
assert(L3_ast_3.isProcExp(L3_ast_1.parseL3("(lambda () 1)")));
assert(L3_ast_3.isProcExp(L3_ast_1.parseL3("(lambda (x) x x)")));
// L3 - Literal, Let
assert(L3_ast_3.isLetExp(L3_ast_1.parseL3("(let ((a 1) (b #t)) (if b a (+ a 1)))")));
assert(L3_ast_3.isLitExp(L3_ast_1.parseL3("'a")));
assert(L3_ast_3.isLitExp(L3_ast_1.parseL3("'()")));
assert(L3_ast_3.isLitExp(L3_ast_1.parseL3("'(1)")));
/*
console.log(parseL3("'a"));
console.log(parseL3("'\"b\""));
console.log(parseL3("'(s \"a\")"));
console.log(parseL3("'()"));
*/
// ========================================================
// Test L3 interpreter
// ========================================================
// TESTS
// Test each data type literals
assert.deepEqual(L3_eval_1.evalParse("1"), 1);
assert.deepEqual(L3_eval_1.evalParse("#t"), true);
assert.deepEqual(L3_eval_1.evalParse("#f"), false);
assert.deepEqual(L3_eval_1.evalParse("'a"), L3_value_1.makeSymbolSExp("a"));
assert.deepEqual(L3_eval_1.evalParse('"a"'), "a");
assert.deepEqual(L3_eval_1.evalParse("'()"), L3_value_1.makeEmptySExp());
assert.deepEqual(L3_eval_1.evalParse("'(1 2)"), L3_value_1.makeCompoundSExp([1, 2]));
assert.deepEqual(L3_eval_1.evalParse("'(1 (2))"), L3_value_1.makeCompoundSExp([1, L3_value_1.makeCompoundSExp([2])]));
// Test primitives
/*
;; <prim-op>  ::= + | - | * | / | < | > | = | not |  eq? | string=?
;;                  | cons | car | cdr | list? | number?
;;                  | boolean? | symbol? | string?      ##### L3
*/
assert.deepEqual(L3_eval_1.evalParse("(+ 1 2)"), 3);
assert.deepEqual(L3_eval_1.evalParse("(- 2 1)"), 1);
assert.deepEqual(L3_eval_1.evalParse("(* 2 3)"), 6);
assert.deepEqual(L3_eval_1.evalParse("(/ 4 2)"), 2);
assert.deepEqual(L3_eval_1.evalParse("(< 4 2)"), false);
assert.deepEqual(L3_eval_1.evalParse("(> 4 2)"), true);
assert.deepEqual(L3_eval_1.evalParse("(= 4 2)"), false);
assert.deepEqual(L3_eval_1.evalParse("(not #t)"), false);
assert.deepEqual(L3_eval_1.evalParse("(eq? 'a 'a)"), true);
assert.deepEqual(L3_eval_1.evalParse('(string=? "a" "a")'), true);
assert.deepEqual(L3_eval_1.evalParse("(cons 1 '())"), L3_value_1.makeCompoundSExp([1]));
assert.deepEqual(L3_eval_1.evalParse("(cons 1 '(2))"), L3_value_1.makeCompoundSExp([1, 2]));
assert.deepEqual(L3_eval_1.evalParse("(car '(1 2))"), 1);
assert.deepEqual(L3_eval_1.evalParse("(cdr '(1 2))"), L3_value_1.makeCompoundSExp([2]));
assert.deepEqual(L3_eval_1.evalParse("(cdr '(1))"), L3_value_1.makeEmptySExp());
assert.deepEqual(L3_eval_1.evalParse("(list? '(1))"), true);
assert.deepEqual(L3_eval_1.evalParse("(list? '())"), true);
assert.deepEqual(L3_eval_1.evalParse("(number? 1)"), true);
assert.deepEqual(L3_eval_1.evalParse("(number? #t)"), false);
assert.deepEqual(L3_eval_1.evalParse("(boolean? #t)"), true);
assert.deepEqual(L3_eval_1.evalParse("(boolean? 0)"), false);
assert.deepEqual(L3_eval_1.evalParse("(symbol? 'a)"), true);
assert.deepEqual(L3_eval_1.evalParse('(symbol? "a")'), false);
assert.deepEqual(L3_eval_1.evalParse("(string? 'a)"), false);
assert.deepEqual(L3_eval_1.evalParse('(string? "a")'), true);
// Test define
assert.deepEqual(L3_eval_1.evalParse("(L3 (define x 1) (+ x x))"), 2);
assert.deepEqual(L3_eval_1.evalParse("(L3 (define x 1) (define y (+ x x)) (* y y))"), 4);
// Test if
assert.deepEqual(L3_eval_1.evalParse('(if (string? "a") 1 2)'), 1);
assert.deepEqual(L3_eval_1.evalParse('(if (not (string? "a")) 1 2)'), 2);
// Test proc
assert.deepEqual(L3_eval_1.evalParse("(lambda (x) x)"), L3_value_1.makeClosure([L3_ast_2.makeVarDecl("x")], [L3_ast_2.makeVarRef("x")]));
// Test substitute
var es1 = ramda_1.map(L3_ast_1.parseL3, ["((lambda (x) (* x x)) x)"]);
if (list_1.allT(L3_ast_3.isCExp, es1))
    assert.deepEqual(L3_eval_2.substitute(es1, ["x"], [L3_ast_1.makeNumExp(3)]), ramda_1.map(L3_ast_1.parseL3, ["((lambda (x) (* x x)) 3)"]));
// Replace n with 2 and f with (lambda (x) (* x x)) in e1:
var e1 = "\n  ((if (= n 0)\n       (lambda (x) x)\n       (if (= n 1)\n           f\n           (lambda (x) (f ((nf f (- n 1)) x)))))\n   '(f n))";
var vn = L3_ast_1.parseL3("2");
var vf = L3_ast_1.parseL3("(lambda (x) (* x x))");
// gives e2
var e2 = "\n  ((if (= 2 0)\n       (lambda (x) x)\n       (if (= 2 1)\n           (lambda (x) (* x x))\n           (lambda (x) ((lambda (x) (* x x))\n                        ((nf (lambda (x) (* x x)) (- 2 1)) x)))))\n       '(f n))";
var es2 = ramda_1.map(L3_ast_1.parseL3, [e1, e2]);
// test
if (list_1.allT(L3_ast_3.isCExp, es2) && L3_ast_3.isCExp(vn) && L3_ast_3.isCExp(vf))
    assert.deepEqual(L3_eval_2.substitute([list_1.first(es2)], ["n", "f"], [vn, vf]), [list_1.second(es2)]);
// Note how z becomes bound in the result of the substitution
// To avoid such accidental captures - we must use rename-vars.
var lzxz = L3_ast_1.parseL3("(lambda (z) (x z))");
var lwzw = L3_ast_1.parseL3("(lambda (w) (z w))");
// If you replace x with lwzw inside lzxz you obtain:
var lzlwzwz = L3_ast_1.parseL3("(lambda (z) ((lambda (w) (z w)) z))");
if (L3_ast_3.isCExp(lzxz) && L3_ast_3.isCExp(lwzw))
    assert.deepEqual(L3_eval_2.substitute([lzxz], ["x"], [lwzw]), [lzlwzwz]);
// ========================================================
// Tests rename
var lxx = L3_ast_1.parseL3("(lambda (x) x)");
var lx1x1 = L3_ast_1.parseL3("(lambda (x__1) x__1)");
if (L3_ast_3.isCExp(lxx) && L3_ast_3.isCExp(lx1x1))
    assert.deepEqual(L3_eval_2.renameExps([lxx]), [lx1x1]);
var l1 = L3_ast_1.parseL3("(((lambda (x) (lambda (z) (x z)))\n(lambda (w) (z w)))\n2)");
var rl1 = L3_ast_1.parseL3("(((lambda (x__1) (lambda (z__2) (x__1 z__2)))\n       (lambda (w__3) (z w__3)))\n      2)");
if (L3_ast_3.isCExp(l1) && L3_ast_3.isCExp(rl1))
    assert.deepEqual(L3_eval_2.renameExps([l1]), [rl1]);
// Test apply proc
assert.deepEqual(L3_eval_1.evalParse("((lambda (x) (* x x)) 2)"), 4);
assert.deepEqual(L3_eval_1.evalParse("(L3 (define square (lambda (x) (* x x))) (square 3))"), 9);
assert.deepEqual(L3_eval_1.evalParse("(L3 (define f (lambda (x) (if (> x 0) x (- 0 x)))) (f -3))"), 3);
// Recursive procedure
assert.deepEqual(L3_eval_1.evalParse("(L3 (define f (lambda (x) (if (= x 0) 1 (* x (f (- x 1)))))) (f 3))"), 6);
// Preserve bound variables in subst
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (define nf\n            (lambda (f n)\n                (if (= n 0)\n                    (lambda (x) x)\n                    (if (= n 1)\n                        f\n                        (lambda (x) (f ((nf f (- n 1)) x)))))))\n    ((nf (lambda (x) (* x x)) 2) 3))"), 81);
// Accidental capture of the z variable if no renaming
assert.deepEqual(L3_eval_1.evalParse("\n(L3\n    (define z (lambda (x) (* x x)))\n    (((lambda (x) (lambda (z) (x z)))\n      (lambda (w) (z w)))\n     2))"), 4);
// Y-combinator
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (((lambda (f) (f f))\n      (lambda (fact)\n        (lambda (n)\n          (if (= n 0)\n              1\n              (* n ((fact fact) (- n 1)))))))\n     6))"), 720);
// L3 higher order functions
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (define map\n            (lambda (f l)\n              (if (eq? l '())\n                  l\n                  (cons (f (car l)) (map f (cdr l))))))\n    (map (lambda (x) (* x x))\n         '(1 2 3)))"), L3_value_1.makeCompoundSExp([1, 4, 9]));
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (define empty? (lambda (x) (eq? x '())))\n    (define filter\n        (lambda (pred l)\n            (if (empty? l)\n                l\n                (if (pred (car l))\n                    (cons (car l) (filter pred (cdr l)))\n                    (filter pred (cdr l))))))\n    (filter (lambda (x) (not (= x 2)))\n            '(1 2 3 2)))"), L3_value_1.makeCompoundSExp([1, 3]));
assert.deepEqual(L3_eval_1.evalParse("\n(L3 (define compose (lambda (f g) (lambda (x) (f (g x)))))\n    ((compose not number?) 2))"), false);
console.log("Finished custom tests.");
//# sourceMappingURL=hw3-part3-tests.js.map