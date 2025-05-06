'use strict';

function isFqdn(s) {
	return (s &&
			(typeof(s) === 'string') &&
			(s.length <= 255) &&
			/^[a-z0-9][a-z0-9_-]{0,62}(\.[a-z0-9][a-z0-9_-]{0,62})+$/.test(s));
}

module.exports = isFqdn;
