'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const ipaddr = require('ipaddr.js');

const execFileAsync = promisify(execFile);

async function setAllowedIPs(iface, peer, ips) {
	if (! (typeof(iface) === 'string') && ((typeof(iface) === 'string') || (peer === undefined) || (peer === null))) {
		throw new Error('Invalid interface and/or peer');
	}
	if (ips instanceof Set) {
		ips = Array.from(ips);
	}
	if (! Array.isArray(ips)) {
		throw new Error('Invalid IPs');
	}
	const errIdx = ips.findIndex((x) => (! (ipaddr.IPv4.isValid(x) || ipaddr.IPv4.isValidCIDR(x))));
	if (errIdx >= 0) {
		throw new Error(`Invalid IP ${ips[errIdx]}`);
	}
	let stdout;
	try {
		({ stdout } = await execFileAsync('wg', ['set', iface, 'peer', peer, 'allowed-ips', ips.join(',') ]));
	} catch (err) {
		throw new Error(`Failed to update allowed IPs for interface "${iface}": ${err.message}`);
	}
	return true;
}

module.exports = setAllowedIPs;
