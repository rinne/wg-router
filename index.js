'use strict';

async function run(av) {
	const resolve4 = require('node:dns').promises.resolve4;
	const ipaddr = require('ipaddr.js');
	const isFqdn = require('./isfqdn');
	const setAllowedIPs = require('./setallowedips');
	const getAllowedIPs = require('./getallowedips');
	const setCmp = require('./setcmp');
	const { routeAdd, routeDel } = require('./route');
	if (av.length < 4) {
		throw new Error(`Usage: ${process.argv[1]} <wg-interface> <wg-peer-public-key> <allowed-address-or-host> ...`);
	}
	av = av.slice(2);
	const iface = av.shift();
	const peer = av.shift();
	const allowed = av;
	let hosts = new Map();
	let current = new Set();
	try {
		current = await getAllowedIPs(iface, peer);
		console.log('initial:', current);
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
	try {
		for (let h of allowed) {
			(async function(h) {
				let s = new Set();
				hosts.set(h, s);
				if (ipaddr.IPv4.isValid(h)) {
					console.log(`adding ${h} as static address`);
					s.add(h + '/32');
					return;
				}
				if (ipaddr.IPv4.isValidCIDR(h)) {
					console.log(`adding ${h} as static net`);
					s.add(h);
					return;
				}
				if (! isFqdn(h)) {
					console.log(`ignored ${h} because it's not an IPv4 address, IPv4 CIDR, nor FQDN`);
					return;
				}
				console.log(`adding ${h} as watched domain`);
				await new Promise(resolve => setTimeout(resolve, 100 + Math.floor(Math.random() * 900)));
				while (true) {
					let a;
					try {
						console.log(`checking ${h}`);
						let addr = new Set((await resolve4(h))
										   .map((x) => (ipaddr.IPv4.isValid(x) ? (x + '/32') : x))
										   .filter((x) => (ipaddr.IPv4.isValidCIDR(x))));
						for (let a of s) {
							if (! addr.has(a)) {
								console.log(`remove ${a} from ${h}`);
								s.delete(a);
							}
						}
						for (let a of addr) {
							if (! s.has(a)) {
								console.log(`add ${a} to ${h}`);
								s.add(a);
							}
						}
					} catch (e) {
						console.warn(e);
						a = [];
					}
					await new Promise(resolve => setTimeout(resolve, 55000 + Math.floor(Math.random() * 10000)));
				}
			})(h);
		}
		let c = new Set();
		let first = true;
		while (true) {
			await new Promise(resolve => setTimeout(resolve, first ? 5000 : (25000 + Math.floor(Math.random() * 10000))));
			let n = new Set(([].concat(...(Array.from(hosts.values()).map((x)=>Array.from(x))))));
			let add = new Set();
			for (let a of n) {
				if (! c.has(a)) {
					add.add(a);
				}
			}
			let remove = new Set();
			for (let a of c) {
				if (! n.has(a)) {
					remove.add(a);
				}
			}
			console.log('remove:', Array.from(remove.values()).join(', '));
			console.log('add:', Array.from(add.values()).join(', '));
			c = n;
			console.log(c);
			try {
				let nc = await getAllowedIPs(iface, peer);
				current = nc;
			} catch (e) {
				throw new Error('Unable to get current IP list from interface');
			}
			if (setCmp(current, c)) {
				console.log('Interface allowed IPs are in sync');
			} else {
				console.log('Updating interface allowed IPs');
				await setAllowedIPs(iface, peer, c);
				for (let ip of c) {
					await routeAdd(ip, iface);
				}
				for (let ip of current) {
					if (! c.has(ip)) {
						await routeDel(ip, iface);
					}
				}
			}
			first = false;
		}
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}

module.exports = run;
