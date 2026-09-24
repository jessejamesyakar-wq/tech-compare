import net from 'node:net';
import dns from 'node:dns/promises';

export interface NetworkSecurityValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
  resolvedIp?: string;
}

const ALLOWED_DOMAINS = [
  'samsung.com',
  'www.samsung.com',
  'apple.com',
  'www.apple.com',
  'vatanbilgisayar.com',
  'www.vatanbilgisayar.com',
  'hepsiburada.com',
  'www.hepsiburada.com',
  'trendyol.com',
  'www.trendyol.com'
];

export async function validateNetworkTargetUrl(
  urlString: string
): Promise<NetworkSecurityValidationResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    return {
      valid: false,
      errorCode: 'INVALID_URL_FORMAT',
      errorMessage: `URL string '${urlString}' is not a valid URL.`
    };
  }

  // 1. Enforce HTTPS only
  if (parsedUrl.protocol !== 'https:') {
    return {
      valid: false,
      errorCode: 'NON_HTTPS_PROTOCOL_FORBIDDEN',
      errorMessage: `Protocol '${parsedUrl.protocol}' is forbidden. Authoritative provenance requires HTTPS.`
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 2. SSRF & Hostname / IP Validation (Run FIRST before domain allowlist)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.includes('metadata.google.internal') ||
    hostname === '169.254.169.254'
  ) {
    return {
      valid: false,
      errorCode: 'SSRF_BLOCKED_HOST',
      errorMessage: `Host '${hostname}' is an internal or loopback target and is blocked for SSRF security.`
    };
  }

  // 3. Domain Allowlist Check
  const domainAllowed = ALLOWED_DOMAINS.some(allowed => hostname === allowed || hostname.endsWith(`.${allowed}`));
  if (!domainAllowed) {
    return {
      valid: false,
      errorCode: 'DOMAIN_NOT_IN_ALLOWLIST',
      errorMessage: `Domain '${hostname}' is not in the trusted manufacturer allowlist.`
    };
  }

  // 4. DNS Resolution IP Audit
  try {
    const lookupResult = await dns.lookup(hostname);
    const ip = lookupResult.address;

    if (isPrivateOrReservedIp(ip)) {
      return {
        valid: false,
        errorCode: 'SSRF_PRIVATE_IP_BLOCKED',
        errorMessage: `Resolved IP '${ip}' for host '${hostname}' is a private/internal IP address.`,
        resolvedIp: ip
      };
    }

    return {
      valid: true,
      resolvedIp: ip
    };
  } catch (err: any) {
    return {
      valid: false,
      errorCode: 'DNS_RESOLUTION_FAILED',
      errorMessage: `DNS resolution failed for hostname '${hostname}': ${err.message}`
    };
  }
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud Metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
  } else if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) {
      return true;
    }
  }
  return false;
}
