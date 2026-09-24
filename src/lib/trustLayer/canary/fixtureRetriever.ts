import crypto from 'node:crypto';

export interface FixtureArtifact {
  artifactId: string;
  provenanceType: 'TEST_FIXTURE';
  requestedUrl: string;
  httpStatus: number;
  fixtureContentText: string;
  fixtureContentHash: string;
  createdAt: string;
}

export interface FixtureEvidenceRecord {
  evidenceId: string;
  sourceUrl: string;
  provenanceType: 'TEST_FIXTURE';
  status: 'TEST_FIXTURE_ONLY'; // Structurally prevented from ever becoming ACTIVE_VERIFIED!
  factDomain: string;
  targetFact: string;
  sourceContentHash: string;
  targetRootId: string;
}

export class TestFixtureRetriever {
  /**
   * TestFixtureRetriever is structurally isolated for testing only.
   * It produces evidence marked exclusively as 'TEST_FIXTURE_ONLY'.
   * The Trust Control Plane Pre-Write Enforcement Gate will reject any
   * candidate payload whose provenanceType is 'TEST_FIXTURE' or whose status
   * is 'TEST_FIXTURE_ONLY' for production persistence.
   */
  public static createTestFixtureEvidence(
    requestedUrl: string,
    fixtureHtml: string,
    targetFact: string,
    targetRootId: string
  ): { artifact: FixtureArtifact; record: FixtureEvidenceRecord } {
    const fixtureContentHash = crypto.createHash('sha256').update(fixtureHtml, 'utf-8').digest('hex');
    const artifactId = `art_fixture_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const artifact: FixtureArtifact = {
      artifactId,
      provenanceType: 'TEST_FIXTURE',
      requestedUrl,
      httpStatus: 200,
      fixtureContentText: fixtureHtml,
      fixtureContentHash,
      createdAt: new Date().toISOString()
    };

    const record: FixtureEvidenceRecord = {
      evidenceId: `ev_fixture_${Date.now()}`,
      sourceUrl: requestedUrl,
      provenanceType: 'TEST_FIXTURE',
      status: 'TEST_FIXTURE_ONLY',
      factDomain: 'spec.screen.type',
      targetFact,
      sourceContentHash: `sha256:${fixtureContentHash}`,
      targetRootId
    };

    return { artifact, record };
  }
}
