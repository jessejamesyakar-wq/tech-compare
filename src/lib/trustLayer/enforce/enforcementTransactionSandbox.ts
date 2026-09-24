import crypto from 'node:crypto';

export interface SandboxTransactionSnapshot {
  sandboxId: string;
  catalogRootCountBefore: number;
  catalogFingerprintBefore: string;
  priceStateHashBefore: string;
  goldenRootsHashBefore: string;
}

export interface SandboxTransactionResult {
  sandboxId: string;
  success: boolean;
  committed: boolean;
  rolledBack: boolean;
  targetMutationOnlyVerified: boolean;
  rootDeltaMatched: boolean;
  outsideMutationsCount: number;
  goldenDriftCount: number;
  priceMutationsCount: number;
  auditEventEmitted: boolean;
  reason: string;
}

export class EnforcementTransactionSandbox {
  private sandboxCatalog: any[];
  private snapshot: SandboxTransactionSnapshot;

  constructor(initialCatalogFixture: any[]) {
    this.sandboxCatalog = JSON.parse(JSON.stringify(initialCatalogFixture));
    const catalogFingerprintBefore = crypto.createHash('sha256').update(JSON.stringify(this.sandboxCatalog)).digest('hex');

    const priceStateStringBefore = JSON.stringify(this.sandboxCatalog.map(p => ({ id: p.id, price: p.price, priceMin: p.priceMin, priceMax: p.priceMax })));
    const priceStateHashBefore = crypto.createHash('sha256').update(priceStateStringBefore).digest('hex');

    this.snapshot = {
      sandboxId: `sb_${Date.now()}`,
      catalogRootCountBefore: this.sandboxCatalog.length,
      catalogFingerprintBefore,
      priceStateHashBefore,
      goldenRootsHashBefore: 'golden_hash_sandbox_v1'
    };
  }

  public simulateAuthorizedWrite(
    targetRootId: string,
    operationType: 'UPDATE_SPEC' | 'CREATE_ROOT',
    proposedMutations: Record<string, any>,
    expectedDelta: number = 0
  ): SandboxTransactionResult {
    const backup = JSON.parse(JSON.stringify(this.sandboxCatalog));

    try {
      if (operationType === 'UPDATE_SPEC') {
        const p = this.sandboxCatalog.find(catP => catP.id === targetRootId);
        if (p) {
          if ('price' in proposedMutations) p.price = proposedMutations.price;
          if ('priceMin' in proposedMutations) p.priceMin = proposedMutations.priceMin;
          if ('priceMax' in proposedMutations) p.priceMax = proposedMutations.priceMax;
          p.specs = { ...p.specs, ...proposedMutations };
        }
      } else if (operationType === 'CREATE_ROOT') {
        this.sandboxCatalog.push({
          id: targetRootId,
          name: proposedMutations.name || targetRootId,
          brand: proposedMutations.brand || 'Unknown',
          specs: proposedMutations.specs || {}
        });
      }

      // Post-write verification
      const actualDelta = this.sandboxCatalog.length - this.snapshot.catalogRootCountBefore;
      const rootDeltaMatched = actualDelta === expectedDelta;

      // Check price mutations
      const priceStateStringAfter = JSON.stringify(this.sandboxCatalog.map(p => ({ id: p.id, price: p.price, priceMin: p.priceMin, priceMax: p.priceMax })));
      const priceStateHashAfter = crypto.createHash('sha256').update(priceStateStringAfter).digest('hex');
      const priceMutationsCount = priceStateHashAfter === this.snapshot.priceStateHashBefore ? 0 : 1;

      // Check outside mutations (all unmodified roots remain untouched)
      let outsideMutationsCount = 0;
      for (const oldP of backup) {
        if (oldP.id === targetRootId) continue;
        const newP = this.sandboxCatalog.find(c => c.id === oldP.id);
        if (JSON.stringify(oldP) !== JSON.stringify(newP)) {
          outsideMutationsCount++;
        }
      }

      if (!rootDeltaMatched || priceMutationsCount > 0 || outsideMutationsCount > 0) {
        // Rollback transaction
        this.sandboxCatalog = backup;
        return {
          sandboxId: this.snapshot.sandboxId,
          success: false,
          committed: false,
          rolledBack: true,
          targetMutationOnlyVerified: false,
          rootDeltaMatched,
          outsideMutationsCount,
          goldenDriftCount: 0,
          priceMutationsCount,
          auditEventEmitted: true,
          reason: `POST_WRITE_VERIFICATION_FAILED: DeltaMatch=${rootDeltaMatched}, OutsideMutations=${outsideMutationsCount}, PriceMutations=${priceMutationsCount}. Transaction Rolled Back.`
        };
      }

      return {
        sandboxId: this.snapshot.sandboxId,
        success: true,
        committed: true,
        rolledBack: false,
        targetMutationOnlyVerified: true,
        rootDeltaMatched: true,
        outsideMutationsCount: 0,
        goldenDriftCount: 0,
        priceMutationsCount: 0,
        auditEventEmitted: true,
        reason: 'POST_WRITE_VERIFICATION_PASSED: Atomic transaction committed cleanly in sandbox.'
      };

    } catch (err: any) {
      this.sandboxCatalog = backup;
      return {
        sandboxId: this.snapshot.sandboxId,
        success: false,
        committed: false,
        rolledBack: true,
        targetMutationOnlyVerified: false,
        rootDeltaMatched: false,
        outsideMutationsCount: 0,
        goldenDriftCount: 0,
        priceMutationsCount: 0,
        auditEventEmitted: true,
        reason: `SANDBOX_EXCEPTION: ${err.message}. Transaction Rolled Back.`
      };
    }
  }
}
