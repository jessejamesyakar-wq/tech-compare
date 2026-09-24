import crypto from 'node:crypto';
import { validateHttpSourceContent, HttpSourceValidationResult } from './httpSourceValidator';

export interface ControlledProvenanceArtifact {
  artifactId: string;
  requestedUrl: string;
  finalUrl: string;
  httpStatus: number;
  rawContentBytes: Buffer;
  canonicalContentText: string;
  rawContentHash: string;
  canonicalContentHash: string;
  retrievedAt: string;
  pipelineSignature: string;
}

export class ControlledRetrievalPipeline {
  private static SECRET_PIPELINE_SALT = 'phase8c10_trust_control_plane_salt_v1';

  public static retrieveAndBindProvenance(
    requestedUrl: string,
    contentOverride?: string,
    httpStatusOverride?: number
  ): { valid: boolean; artifact?: ControlledProvenanceArtifact; httpResult: HttpSourceValidationResult; errorCode?: string } {
    const httpResult = validateHttpSourceContent({
      requestedUrl,
      contentOverride,
      httpStatusOverride
    });

    if (!httpResult.valid) {
      return {
        valid: false,
        httpResult,
        errorCode: httpResult.errorCode || 'RETRIEVAL_FAILED'
      };
    }

    const rawContentBytes = Buffer.from(contentOverride || '', 'utf-8');
    const canonicalContentText = httpResult.canonicalContentHash;
    const rawContentHash = httpResult.rawContentHash;
    const canonicalContentHash = httpResult.canonicalContentHash;
    const retrievedAt = new Date().toISOString();
    const artifactId = `art_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const signaturePayload = [artifactId, requestedUrl, httpResult.finalUrl, canonicalContentHash, retrievedAt, this.SECRET_PIPELINE_SALT].join('|');
    const pipelineSignature = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    const artifact: ControlledProvenanceArtifact = {
      artifactId,
      requestedUrl,
      finalUrl: httpResult.finalUrl,
      httpStatus: httpResult.httpStatus,
      rawContentBytes,
      canonicalContentText,
      rawContentHash,
      canonicalContentHash,
      retrievedAt,
      pipelineSignature
    };

    return {
      valid: true,
      artifact,
      httpResult
    };
  }

  public static verifyArtifactSignature(artifact: ControlledProvenanceArtifact): boolean {
    const signaturePayload = [artifact.artifactId, artifact.requestedUrl, artifact.finalUrl, artifact.canonicalContentHash, artifact.retrievedAt, this.SECRET_PIPELINE_SALT].join('|');
    const expectedSig = crypto.createHash('sha256').update(signaturePayload).digest('hex');
    return expectedSig === artifact.pipelineSignature;
  }
}
