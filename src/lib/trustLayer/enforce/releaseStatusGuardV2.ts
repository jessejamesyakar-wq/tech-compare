/**
 * RELEASE STATUS GUARD V2 — TRUST LAYER ENFORCEMENT
 *
 * Hardened release-status and identity gatekeeper:
 * - Detects RELEASE_YEAR_CONFLICT when officialReleaseYear != catalogReleaseYear
 * - Blocks identity closure if a release-year conflict exists
 * - Detects IDENTIFIER_YEAR_MISMATCH when rootId encodes a different historical year
 *   while allowing catalog closure if canonical releaseYear is correct
 * - Enforces zero mutation for UNRELEASED / IDENTITY_UNCERTAIN products
 */

export type RawReleaseStatus = 
  | 'RELEASED_OFFICIAL'
  | 'ANNOUNCED_OFFICIAL'
  | 'UNRELEASED'
  | 'IDENTITY_UNCERTAIN';

export type ReleaseStatusClassification =
  | 'RELEASED_OFFICIAL'
  | 'ANNOUNCED_OFFICIAL'
  | 'UNRELEASED'
  | 'IDENTITY_UNCERTAIN'
  | 'RELEASE_YEAR_CONFLICT';

export interface ReleaseStatusAuditInput {
  rootId: string;
  modelName: string;
  rawStatus: RawReleaseStatus;
  catalogReleaseYear?: number;
  officialReleaseYear?: number;
  officialReleaseDate?: string;
  officialSourceUrl?: string;
}

export interface ReleaseStatusAuditResult {
  rootId: string;
  modelName: string;
  rawStatus: RawReleaseStatus;
  catalogReleaseYear?: number;
  officialReleaseYear?: number;
  officialReleaseDate?: string;
  officialSourceUrl?: string;
  classification: ReleaseStatusClassification;
  identifierYearMismatch: boolean;
  identifierYear?: number;
  closureAllowed: boolean;
  specMutationAllowed: boolean;
  notes: string;
}

export class ReleaseStatusGuardV2 {
  /**
   * Extracts 4-digit year encoded in root ID (e.g., 'poco-x8-pro-256gb-2027' -> 2027)
   */
  public static extractYearFromId(rootId: string): number | undefined {
    const match = rootId.match(/-(\d{4})(?:$|-)/);
    if (match && match[1]) {
      const year = parseInt(match[1], 10);
      if (year >= 2000 && year <= 2099) {
        return year;
      }
    }
    return undefined;
  }

  /**
   * Classifies root release status under V2 rules
   */
  public static evaluate(input: ReleaseStatusAuditInput): ReleaseStatusAuditResult {
    const identifierYear = this.extractYearFromId(input.rootId);
    let identifierYearMismatch = false;

    if (identifierYear !== undefined && input.officialReleaseYear !== undefined) {
      if (identifierYear !== input.officialReleaseYear) {
        identifierYearMismatch = true;
      }
    }

    // 1. UNRELEASED products: blocked evidence, zero mutation
    if (input.rawStatus === 'UNRELEASED') {
      return {
        ...input,
        classification: 'UNRELEASED',
        identifierYearMismatch,
        identifierYear,
        closureAllowed: false,
        specMutationAllowed: false,
        notes: 'Unreleased or unannounced product. Blocked evidence; zero spec mutations permitted.'
      };
    }

    // 2. IDENTITY_UNCERTAIN: STOP immediately
    if (input.rawStatus === 'IDENTITY_UNCERTAIN') {
      return {
        ...input,
        classification: 'IDENTITY_UNCERTAIN',
        identifierYearMismatch,
        identifierYear,
        closureAllowed: false,
        specMutationAllowed: false,
        notes: 'Product identity is ambiguous or unverified. Immediate execution stop required.'
      };
    }

    // 3. RELEASED_OFFICIAL / ANNOUNCED_OFFICIAL
    // Check for RELEASE_YEAR_CONFLICT
    const hasYearConflict = 
      input.officialReleaseYear !== undefined &&
      input.catalogReleaseYear !== undefined &&
      input.officialReleaseYear !== input.catalogReleaseYear;

    if (hasYearConflict) {
      return {
        ...input,
        classification: 'RELEASE_YEAR_CONFLICT',
        identifierYearMismatch,
        identifierYear,
        closureAllowed: false, // Cannot declare closure while canonical year conflicts!
        specMutationAllowed: true, // May audit specs, but identity closure is blocked until fixed
        notes: `RELEASE_YEAR_CONFLICT: officialReleaseYear (${input.officialReleaseYear}) != catalogReleaseYear (${input.catalogReleaseYear}). Full closure blocked.`
      };
    }

    // 4. Clean official release
    let notes = 'Official release verified against manufacturer technical documentation.';
    if (identifierYearMismatch) {
      notes += ` [GOVERNANCE WARNING: IDENTIFIER_YEAR_MISMATCH - rootId encodes ${identifierYear} but canonical releaseYear is ${input.officialReleaseYear}. Do not rename ID/slug without human review.]`;
    }

    return {
      ...input,
      classification: input.rawStatus,
      identifierYearMismatch,
      identifierYear,
      closureAllowed: true,
      specMutationAllowed: true,
      notes
    };
  }
}
