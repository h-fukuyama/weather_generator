#!/usr/bin/env node
/*jslint nodejs:true */

var hashkeys = require("hashkeys");

// a less than b:     Return -1
// a equals b:        Return 0
// a greather than b: Return 1
//
// If a and b have different types, compare their types.
// The following array is sorted from least to greatest:
//
// [Array, Boolean, Number, Object, String]

function cmp(a, b) {
	var
		aType = a.constructor,
		bType = b.constructor;

	if (aType < bType) {
		return -1;
	}
	else if (aType > bType) {
		return 1;
	}
	else if (aType == Object) {
		var
			aKeys = hashkeys.keys(a),
			bKeys = hashkeys.keys(b),
			aValues = hashkeys.values(a),
			bValues = hashkeys.values(b);

		if (aKeys < bKeys) {
			return -1;
		}
		else if (aKeys > bKeys) {
			return 1;
		}
		else if (aValues < bValues) {
			return -1;
		}
		else if (aValues > bValues) {
			return 1;
		}
		else {
			return 0;
		}
	}
	if (a < b) {
		return -1;
	}
	else if (a > b) {
		return 1;
	}
	else {
		return 0;
	}
}

exports.cmp = cmp;

function lt(a, b) {
	return cmp(a, b) == -1;
}

exports.lt = lt;

function gt(a, b) {
	return cmp(a, b) == 1;
}

exports.gt = gt;

function eq(a, b) {
	return cmp(a, b) == 0;
}

exports.eq = eq;

function neq(a, b) {
	return cmp(a, b) != 0;
}

exports.neq = neq;

function lte(a, b) {
	return cmp(a, b) != 1;
}

exports.lte = lte;

function gte(a, b) {
	return cmp(a, b) != -1;
}

exports.gte = gte;

function test() {
	return (
		cmp(1, 1) == 0 &&
		cmp(1, 2) == -1 &&
		cmp(2, 1) == 1 &&
		cmp(1, "1") == -1 &&
		cmp([1, 2], [1, 2]) == 0 &&
		cmp(true, 1) == -1 &&
		cmp({a:1}, {a:1, b:2, c:3}) == -1 &&
		cmp({a:1}, true) == 1 &&

		lt(1, 2) &&
		!lt(2, 1) &&
		!lt(1, 1) &&
		lt([1], 1) &&
		lt(1, "1") &&

		gt(2, 1) &&
		!gt(1, 2) &&
		!gt(2, 2) &&
		gt(1, [1]) &&
		gt("1", 1) &&

		eq(1, 1) &&
		!eq(1, 2) &&

		neq(1, 2) &&
		!neq(1, 1) &&

		lte(1, 1) &&
		lte(1, 2) &&
		lte(true, "1") &&
		!lte(2, 1) &&

		gte(2, 1) &&
		gte(2, 2) &&
		gte([1,2,3], [1,2]) &&
		gte([1,2,3], [1,2,3])
	);
}

exports.test = test;