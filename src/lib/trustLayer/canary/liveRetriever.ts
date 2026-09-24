import https from 'node:https';
import crypto from 'node:crypto';
import { validateNetworkTargetUrl } from './networkSecurityValidator';

export interface LiveRetrievalOptions {
  timeoutMs?: number;
  maxResponseBodyBytes?: number;
  maxRedirects?: number;
}

export interface LiveRetrievalArtifact {
  artifactId: string;
  provenanceType: 'REAL_LIVE_HTTP';
  requestedUrl: string;
  finalUrl: string;
  redirectChain: string[];
  httpStatus: number;
  contentType: string;
  rawContentBytes: Buffer;
  rawContentHash: string;
  rawBodyLength: number;
  canonicalContentText: string;
  canonicalContentHash: string;
  canonicalPageLength: number;
  retrievedAt: string;
  pipelineSignature: string;
}

export interface LiveRetrievalResult {
  valid: boolean;
  artifact?: LiveRetrievalArtifact;
  errorCode?: string;
  errorMessage?: string;
}

const SECRET_PIPELINE_SALT = 'phase8c12_trust_control_plane_salt_live_v1';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const DEFAULT_MAX_REDIRECTS = 3;
const ALLOWED_CONTENT_TYPES = ['text/html', 'application/xhtml+xml', 'application/json', 'text/plain'];

export class ProductionLiveRetriever {
  /**
   * ProductionLiveRetriever strictly performs real network HTTP GET requests over HTTPS.
   * Note: It NEVER accepts contentOverride, statusOverride, or fixture injection.
   */
  public static async retrieveLiveProvenance(
    requestedUrl: string,
    options: LiveRetrievalOptions = {}
  ): Promise<LiveRetrievalResult> {
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const maxBytes = options.maxResponseBodyBytes || DEFAULT_MAX_BYTES;
    const maxRedirects = options.maxRedirects || DEFAULT_MAX_REDIRECTS;

    const redirectChain: string[] = [requestedUrl];
    let currentUrl = requestedUrl;
    let redirectsCount = 0;

    while (redirectsCount <= maxRedirects) {
      // Pre-flight SSRF & Network Security Check
      const secVal = await validateNetworkTargetUrl(currentUrl);
      if (!secVal.valid) {
        return {
          valid: false,
          errorCode: secVal.errorCode || 'SECURITY_VALIDATION_FAILED',
          errorMessage: secVal.errorMessage
        };
      }

      // Execute Real HTTPS GET Fetch
      const fetchRes = await performHttpsGet(currentUrl, timeoutMs, maxBytes);
      if (!fetchRes.valid) {
        return {
          valid: false,
          errorCode: fetchRes.errorCode,
          errorMessage: fetchRes.errorMessage
        };
      }

      const status = fetchRes.httpStatus;

      // Handle Redirects
      if (status >= 300 && status < 400 && fetchRes.headers.location) {
        redirectsCount++;
        if (redirectsCount > maxRedirects) {
          return {
            valid: false,
            errorCode: 'TOO_MANY_REDIRECTS',
            errorMessage: `Target URL exceeded maximum allowed redirects (${maxRedirects}).`
          };
        }
        let nextUrl: string;
        try {
          nextUrl = new URL(fetchRes.headers.location, currentUrl).href;
        } catch {
          return {
            valid: false,
            errorCode: 'INVALID_REDIRECT_URL',
            errorMessage: `Invalid redirect location header: '${fetchRes.headers.location}'.`
          };
        }
        redirectChain.push(nextUrl);
        currentUrl = nextUrl;
        continue;
      }

      // Must be HTTP 2xx
      if (status < 200 || status >= 300) {
        return {
          valid: false,
          errorCode: `HTTP_${status}_NOT_SUCCESSFUL`,
          errorMessage: `Live HTTP GET returned non-2xx status: ${status}`
        };
      }

      // Validate Content-Type
      const rawContentType = fetchRes.headers['content-type'] || '';
      const contentType = rawContentType.split(';')[0].trim().toLowerCase();
      const contentTypeAllowed = ALLOWED_CONTENT_TYPES.some(ct => contentType.includes(ct));

      if (!contentTypeAllowed) {
        return {
          valid: false,
          errorCode: 'UNSUPPORTED_CONTENT_TYPE',
          errorMessage: `Live response content-type '${rawContentType}' is not in allowed list [${ALLOWED_CONTENT_TYPES.join(', ')}].`
        };
      }

      // Valid 2xx response bytes captured!
      const rawBytes = fetchRes.bodyBytes;
      const rawBodyLength = rawBytes.length;
      if (rawBodyLength === 0) {
        return {
          valid: false,
          errorCode: 'EMPTY_RESPONSE_BODY',
          errorMessage: `Live response returned an empty body (0 bytes).`
        };
      }

      const rawContentHash = crypto.createHash('sha256').update(rawBytes).digest('hex');

      // Canonicalization step (clean HTML formatting)
      const rawHtmlStr = rawBytes.toString('utf-8');
      const canonicalContentText = canonicalizeHtmlPage(rawHtmlStr);
      const canonicalContentHash = crypto.createHash('sha256').update(canonicalContentText, 'utf-8').digest('hex');
      const canonicalPageLength = Buffer.byteLength(canonicalContentText, 'utf-8');

      const retrievedAt = new Date().toISOString();
      const artifactId = `art_live_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      const sigPayload = [artifactId, 'REAL_LIVE_HTTP', requestedUrl, currentUrl, canonicalContentHash, retrievedAt, SECRET_PIPELINE_SALT].join('|');
      const pipelineSignature = crypto.createHash('sha256').update(sigPayload).digest('hex');

      const artifact: LiveRetrievalArtifact = {
        artifactId,
        provenanceType: 'REAL_LIVE_HTTP',
        requestedUrl,
        finalUrl: currentUrl,
        redirectChain,
        httpStatus: status,
        contentType: rawContentType,
        rawContentBytes: rawBytes,
        rawContentHash,
        rawBodyLength,
        canonicalContentText,
        canonicalContentHash,
        canonicalPageLength,
        retrievedAt,
        pipelineSignature
      };

      return {
        valid: true,
        artifact
      };
    }

    return {
      valid: false,
      errorCode: 'REDIRECT_LOOP',
      errorMessage: 'Redirect loop detected.'
    };
  }

  public static verifyLiveArtifactSignature(artifact: LiveRetrievalArtifact): boolean {
    if (artifact.provenanceType !== 'REAL_LIVE_HTTP') return false;
    const sigPayload = [artifact.artifactId, 'REAL_LIVE_HTTP', artifact.requestedUrl, artifact.finalUrl, artifact.canonicalContentHash, artifact.retrievedAt, SECRET_PIPELINE_SALT].join('|');
    const expectedSig = crypto.createHash('sha256').update(sigPayload).digest('hex');
    return expectedSig === artifact.pipelineSignature;
  }
}

function canonicalizeHtmlPage(html: string): string {
  // Strip script, style, comments, and normalize whitespace
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean;
}

interface HttpsFetchInternalResult {
  valid: boolean;
  httpStatus: number;
  headers: Record<string, string>;
  bodyBytes: Buffer;
  errorCode?: string;
  errorMessage?: string;
}

function performHttpsGet(
  targetUrl: string,
  timeoutMs: number,
  maxBytes: number
): Promise<HttpsFetchInternalResult> {
  return new Promise((resolve) => {
    const req = https.get(
      targetUrl,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AceleEtmeTrustControlPlane/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      },
      (res) => {
        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let timedOut = false;

        res.on('data', (chunk: Buffer) => {
          if (timedOut) return;
          totalBytes += chunk.length;
          if (totalBytes > maxBytes) {
            timedOut = true;
            req.destroy();
            resolve({
              valid: false,
              httpStatus: res.statusCode || 0,
              headers: res.headers as any,
              bodyBytes: Buffer.alloc(0),
              errorCode: 'RESPONSE_BODY_TOO_LARGE',
              errorMessage: `Response size exceeded maximum allowed limit of ${maxBytes} bytes.`
            });
            return;
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          if (timedOut) return;
          const bodyBytes = Buffer.concat(chunks);
          const headers: Record<string, string> = {};
          for (const key in res.headers) {
            if (typeof res.headers[key] === 'string') {
              headers[key.toLowerCase()] = res.headers[key] as string;
            }
          }
          resolve({
            valid: true,
            httpStatus: res.statusCode || 200,
            headers,
            bodyBytes
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        valid: false,
        httpStatus: 0,
        headers: {},
        bodyBytes: Buffer.alloc(0),
        errorCode: 'NETWORK_TIMEOUT',
        errorMessage: `HTTPS request to '${targetUrl}' timed out after ${timeoutMs}ms.`
      });
    });

    req.setTimeout(timeoutMs);

    req.on('error', (err) => {
      resolve({
        valid: false,
        httpStatus: 0,
        headers: {},
        bodyBytes: Buffer.alloc(0),
        errorCode: 'NETWORK_CONNECTION_ERROR',
        errorMessage: `HTTPS connection error: ${err.message}`
      });
    });
  });
}
