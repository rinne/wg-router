'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

async function getAllowedIPs(iface, peer) {
	if (! (typeof(iface) === 'string') && ((typeof(iface) === 'string') || (peer === undefined) || (peer === null))) {
		throw new Error('Invalid interface and/or peer');
	}
	let stdout;
	let found = false;
	try {
		({ stdout } = await execFileAsync('wg', ['show', iface, 'allowed-ips']));
	} catch (err) {
		throw new Error(`Failed to retrieve allowed IPs for interface "${iface}": ${err.message}`);
	}
	let allowedIPs = new Set();
	const out = stdout.trim();
	if (! out) {
		return allowedIPs;
	}
	for (let line of stdout.split("\n")) {
		line = line.trim();
		const parts = line.split(/\s+/);
		if (parts.length < 2) {
			continue;
		}
		const pk = parts.shift().trim();
		const ips = parts.join(' ').trim().split(/[\s,]+/).map(x => x.trim()).filter(x => (!!x));
		if ((pk === peer) || (! peer)) {
			found = true;
			for (let ip of ips) {
				allowedIPs.add(ip);
			}
		}
	}
	if (peer && (! found)) {
		throw new Error(`Peer ${peer} not found`);
	}
	return allowedIPs;
}

module.exports = getAllowedIPs;
