import crypto from 'node:crypto';
import { PostgresDatabaseEngine } from '../postgres/postgresClient';
import smartphonesData from '../../smartphonesData.json';

export interface CatalogUpdateResult {
  success: boolean;
  newVersion?: number;
  newDocumentHash?: string;
  conflict?: boolean;
  errorMessage?: string;
}

export interface CatalogRepository {
  getAuthorityType(): 'READ_ONLY_BOOTSTRAP_BASELINE' | 'POSTGRES_MUTABLE_AUTHORITY';
  getProduct(rootId: string): Promise<any | null>;
  listProducts(): Promise<any[]>;
  updateProduct(
    rootId: string,
    updatedDocument: any,
    expectedVersion: number
  ): Promise<CatalogUpdateResult>;
}

export class LegacyJsonCatalogRepository implements CatalogRepository {
  public getAuthorityType(): 'READ_ONLY_BOOTSTRAP_BASELINE' {
    return 'READ_ONLY_BOOTSTRAP_BASELINE';
  }

  public async getProduct(rootId: string): Promise<any | null> {
    const item = (smartphonesData as any[]).find((p) => p.id === rootId);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  public async listProducts(): Promise<any[]> {
    return JSON.parse(JSON.stringify(smartphonesData));
  }

  public async updateProduct(): Promise<CatalogUpdateResult> {
    return {
      success: false,
      errorMessage: 'IMMUTABLE_MIGRATION_BASELINE: Local JSON file updates are disabled by governance.'
    };
  }
}

export class PostgresCatalogRepository implements CatalogRepository {
  public getAuthorityType(): 'POSTGRES_MUTABLE_AUTHORITY' {
    return 'POSTGRES_MUTABLE_AUTHORITY';
  }

  public async getProduct(rootId: string): Promise<any | null> {
    const row = PostgresDatabaseEngine.getProduct(rootId);
    if (!row) return null;
    return JSON.parse(JSON.stringify(row.catalog_document));
  }

  public async getProductRecord(rootId: string): Promise<any | null> {
    const row = PostgresDatabaseEngine.getProduct(rootId);
    if (!row) return null;
    return {
      rootId: row.root_id,
      brand: row.brand,
      name: row.canonical_name,
      document: JSON.parse(JSON.stringify(row.catalog_document)),
      documentHash: row.document_hash,
      version: row.version,
      updatedAt: row.updated_at
    };
  }

  public async listProducts(): Promise<any[]> {
    const rows = PostgresDatabaseEngine.getAllProducts();
    return rows.map((r) => JSON.parse(JSON.stringify(r.catalog_document)));
  }

  public async updateProduct(
    rootId: string,
    updatedDocument: any,
    expectedVersion: number
  ): Promise<CatalogUpdateResult> {
    const canonicalString = JSON.stringify(updatedDocument);
    const newHash = crypto.createHash('sha256').update(canonicalString).digest('hex');

    const res = PostgresDatabaseEngine.upsertProduct({
      root_id: rootId,
      brand: updatedDocument.brand || 'Unknown',
      canonical_name: updatedDocument.name || rootId,
      catalog_document: updatedDocument,
      document_hash: newHash,
      version: expectedVersion
    });

    if (res.conflict) {
      return {
        success: false,
        conflict: true,
        errorMessage: `CONCURRENT_MODIFICATION_DETECTED: Product ${rootId} version ${expectedVersion} does not match database state.`
      };
    }

    const updatedRow = PostgresDatabaseEngine.getProduct(rootId);
    return {
      success: true,
      newVersion: updatedRow.version,
      newDocumentHash: updatedRow.document_hash
    };
  }
}
