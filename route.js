'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const ipaddr = require('ipaddr.js');

// ip route add 1.2.3.4/32 via 10.0.0.1 dev eth3
// ip route del 1.2.3.4/32 dev eth3

async function _route(cmd, addr, iface) {
	if (! (typeof(iface) === 'string')) {
		console.log(new Error(`Failed to ${cmd} route ${addr} to "${iface}": Not a valid interface`));
		return false;
	}
	if (! (ipaddr.IPv4.isValid(addr) || ipaddr.IPv4.isValidCIDR(addr))) {
		console.log(new Error(`Failed to ${cmd} route ${addr} to "${iface}": Not a valid address or CIDR`));
		return false;
	}
	let stdout;
	try {
	    ({ stdout } = await execFileAsync('ip', ['route', cmd, addr, 'dev', iface ]));
	} catch (err) {
		console.log(new Error(`Failed to ${cmd} route ${addr} to "${iface}": ${err.message}`));
		return false;
	}
	return true;
}

async function routeAdd(addr, iface) {
	return _route('add', addr, iface);
}

async function routeDel(addr, iface) {
	return _route('del', addr, iface);
}

module.exports = { routeAdd, routeDel };
