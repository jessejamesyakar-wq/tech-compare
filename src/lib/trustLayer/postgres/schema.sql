-- ============================================================================
-- ACELEETME TRUST CORE & CANONICAL CATALOG POSTGRESQL SCHEMA (PHASE 9-C)
-- Compatible with Neon Postgres, Vercel Postgres, AWS RDS, GCP Cloud SQL & PostgreSQL 14+
-- ============================================================================

-- 1. CANONICAL CATALOG PRODUCTS TABLE (Durable Mutable Catalog Authority)
CREATE TABLE IF NOT EXISTS catalog_products (
  root_id VARCHAR(255) PRIMARY KEY,
  brand VARCHAR(128) NOT NULL,
  canonical_name VARCHAR(255) NOT NULL,
  catalog_document JSONB NOT NULL,
  document_hash VARCHAR(64) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(64) NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_brand ON catalog_products(brand);
CREATE INDEX IF NOT EXISTS idx_catalog_products_status ON catalog_products(status);

-- 2. CATALOG EVIDENCE TABLE (Durable Evidence & Provenance Store)
CREATE TABLE IF NOT EXISTS catalog_evidence (
  evidence_id VARCHAR(255) PRIMARY KEY,
  root_id VARCHAR(255) NOT NULL REFERENCES catalog_products(root_id) ON DELETE CASCADE,
  field_path VARCHAR(255) NOT NULL,
  claim_value JSONB NOT NULL,
  value_fingerprint VARCHAR(64) NOT NULL,
  provenance_type VARCHAR(128) NOT NULL,
  source_type VARCHAR(128) NOT NULL,
  source_url TEXT,
  verification_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalog_evidence_root ON catalog_evidence(root_id);
CREATE INDEX IF NOT EXISTS idx_catalog_evidence_field ON catalog_evidence(field_path);

-- 3. TRUST AUDIT EVENTS TABLE (Chained Append-Only Audit Ledger)
CREATE TABLE IF NOT EXISTS trust_audit_events (
  event_id VARCHAR(255) PRIMARY KEY,
  sequence_number BIGSERIAL UNIQUE,
  entity_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  field_domain VARCHAR(255),
  payload_hash VARCHAR(64) NOT NULL,
  old_value_hash VARCHAR(64),
  new_value_hash VARCHAR(64),
  source_content_hash VARCHAR(64),
  previous_event_hash VARCHAR(64) NOT NULL,
  event_hash VARCHAR(64) NOT NULL,
  policy_version VARCHAR(64) NOT NULL,
  policy_hash VARCHAR(64) NOT NULL,
  key_version VARCHAR(64) NOT NULL,
  candidate_id VARCHAR(255),
  manifest_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trust_audit_entity ON trust_audit_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_trust_audit_seq ON trust_audit_events(sequence_number);

-- 4. TRUST WAL OPERATIONS TABLE (Write-Ahead Logging & Crash Recovery)
CREATE TABLE IF NOT EXISTS trust_wal_operations (
  journal_id VARCHAR(255) PRIMARY KEY,
  candidate_id VARCHAR(255) NOT NULL,
  target_root_id VARCHAR(255) NOT NULL,
  atomic_fact_domain VARCHAR(255) NOT NULL,
  stage VARCHAR(64) NOT NULL,
  claim_value TEXT NOT NULL,
  provenance_type VARCHAR(128) NOT NULL,
  source_type VARCHAR(128) NOT NULL,
  requested_url TEXT,
  policy_version VARCHAR(64) NOT NULL,
  policy_hash VARCHAR(64) NOT NULL,
  candidate_payload_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trust_wal_root ON trust_wal_operations(target_root_id);
CREATE INDEX IF NOT EXISTS idx_trust_wal_stage ON trust_wal_operations(stage);

-- 5. TRUST AUTHORIZATIONS TABLE (Single-Use Write Manifest History)
CREATE TABLE IF NOT EXISTS trust_authorizations (
  manifest_id VARCHAR(255) PRIMARY KEY,
  target_roots JSONB NOT NULL,
  allowed_operations JSONB NOT NULL,
  allowed_domains JSONB NOT NULL,
  candidate_payload_hash VARCHAR(64) NOT NULL,
  policy_version VARCHAR(64) NOT NULL,
  policy_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
  used_at TIMESTAMPTZ
);

-- 6. TRUST IDEMPOTENCY TABLE (Unique Constraint Key Ledger)
CREATE TABLE IF NOT EXISTS trust_idempotency (
  idempotency_key VARCHAR(255) PRIMARY KEY, -- UNIQUE DB constraint enforced by Primary Key
  candidate_id VARCHAR(255) NOT NULL,
  target_root_id VARCHAR(255) NOT NULL,
  fact_domain VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  committed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  manifest_id VARCHAR(255) NOT NULL
);

-- 7. TRUST CIRCUIT BREAKERS TABLE (Cross-Runtime Trip Integrity Persistence)
CREATE TABLE IF NOT EXISTS trust_circuit_breakers (
  scope VARCHAR(128) PRIMARY KEY DEFAULT 'GLOBAL',
  state VARCHAR(32) NOT NULL DEFAULT 'CLOSED',
  trip_reason TEXT,
  tripped_at TIMESTAMPTZ,
  trip_count INT NOT NULL DEFAULT 0,
  message TEXT,
  policy_version VARCHAR(64) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. TRUST POLICY HISTORY TABLE (Versioned Policy Audit Archive)
CREATE TABLE IF NOT EXISTS trust_policy_history (
  policy_version VARCHAR(64) PRIMARY KEY,
  policy_hash VARCHAR(64) NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  retired_at TIMESTAMPTZ,
  revision VARCHAR(64) NOT NULL,
  policy_document JSONB
);

-- 9. TRUST RETRIEVAL ARTIFACTS TABLE (Provenance Metadata Store)
CREATE TABLE IF NOT EXISTS trust_retrieval_artifacts (
  retrieval_artifact_id VARCHAR(255) PRIMARY KEY,
  requested_url TEXT NOT NULL,
  final_url TEXT NOT NULL,
  canonical_url TEXT,
  http_status INT NOT NULL,
  raw_content_hash VARCHAR(64) NOT NULL,
  raw_content_length INT NOT NULL,
  canonical_hash VARCHAR(64) NOT NULL,
  canonical_length INT NOT NULL,
  claim_hash VARCHAR(64) NOT NULL,
  claim_locator TEXT NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source_identity VARCHAR(255) NOT NULL,
  pipeline_version VARCHAR(64) NOT NULL,
  signature_key_version VARCHAR(64) NOT NULL
);
