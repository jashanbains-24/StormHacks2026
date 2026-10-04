# Floor 02: Data Storage

Owner scope: everything in this folder.

This floor provides a standalone pixel-art data center with storage racks,
tape media, cache nodes, cooling, power, safety, cable, monitoring, and
maintenance details. Ambient equipment and staff motion respect the shared
reduced-motion preference.

The staff sprites come from the shared Pixel Agents office pack documented in
the repository credits. Floor-specific equipment is original procedural pixel
art drawn on a three-pixel grid to match that pack. No additional borrowed
assets or code are included.

The Stale Price Incident is a three-decision conversation:

1. Add a cache for the repeated sale-item query.
2. Share that cache across the app servers.
3. Keep cached prices for about one minute.

The local-cache retry keeps `floor2.cacheChoice` for the current visit so Floor 1
can reference the load-balancer ripple. A refresh clears that choice and starts
the data floor over. The outage itself stays quiet until Floor 1 is solved.
