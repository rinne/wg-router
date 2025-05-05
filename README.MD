# wg-router

## About

This is a small utility to maintain allowed IPs and routes on a Wireguard interface.

Normally Wireguard peer is set with a static set of AllowedIPs and
traffic from those addresses is then accepted from that peer and
traffic to those addresses is routed via that peer. This is normally
sufficient, but if outbound VPN needs to be used towards hosts that
have dynamic IP addresses, the case becomes more complex. This tool is
tackling that particular scenario.

## Usage

```
$ wg-router <wg-interface> <wg-peer-pubkey> <static-address-or-hostname> ...
```

Example:

```
$ wg-router wg0 KkdEnGhheX0vvkMYhxrcADwpErApjfQhevuYYpTl6tWQ= 10.2.2.2 www.somewhere.com api-server.wherever.com
```

## Explanation

Once started, this utility will take over all AllowedIPs if a given
Wireguard interface. If you (like me) have usually the VPN address of
the peer as default in AllowedIPs so that you can ping it just to
check that it works, remember to add that address also as a parameter
for `wg-router`.

Setting AllowedIPs runtime doesn't automatically set routes, so
`wg-router` does its best to adjust routes to match AllowedIPs. There
will be some errors reported on setting routes. Usually you don't need
to worry about these.

## Author

Timo J. Rinne <tri@iki.fi>

## License

GPLv3 or later
