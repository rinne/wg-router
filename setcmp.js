'use strict';

function setCmp(s1, s2) {
	if (! ((s1 instanceof Set) && (s2 instanceof Set))) {
		throw new Error('Only Set objects can be compared');
	}
	for (let x of s1) {
		if (! s2.has(x)) {
			return false;
		}
	}
	for (let x of s2) {
		if (! s1.has(x)) {
			return false;
		}
	}
	return true;
}

module.exports = setCmp;
