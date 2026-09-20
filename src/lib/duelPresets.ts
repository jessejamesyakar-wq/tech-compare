// Only exact, current catalog identifiers belong here. URL resolution stays strict.
export const DUEL_PRESETS = {
  monitors: { label: 'MSI MAG 255PXF vs Dell G2524H', ids: ['msi-mag-255pxf', 'dell-g2524h'] },
  smartphones: { label: 'iPhone 16 Pro Max vs S24 Ultra', ids: ['apple-iphone-16-pro-max-256-gb', 'samsung-galaxy-s24-ultra'] },
  laptops: { label: 'MacBook Pro vs Legion', ids: ['apple-macbook-pro-16-2-m5-max-18cpu-40gpu', 'lenovo-legion-5-pro-83lt005rtr'] },
  tvs: { label: 'Philips 65OLED810 vs TCL 98C8K', ids: ['philips-65oled810', 'tcl-98c8k'] },
} as const;
