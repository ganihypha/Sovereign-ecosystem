-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 007-wa-logs-governance-hardening.sql
-- Session: 4G — Approval Governance Hardening
-- Date: 2026-04-10
-- Author: Haidar Faras Maulia (via AI Dev — Session 4G)
-- ============================================================================
--
-- 📋 PURPOSE:
--   Session 4F approval flow had an ambiguity:
--   After approveQueueItem(), status was set to 'sent' even though the message
--   had NOT yet been dispatched to Fonnte. This created audit trail confusion:
--     wa_logs.status = 'sent' could mean "approved" OR "actually dispatched"
--
--   Session 4G fixes this by:
--   1. Adding 'approved' status to the wa_logs.status CHECK constraint
--      so approved-but-not-yet-sent items have a clear, unambiguous state
--   2. Adding composite index for faster approval queue queries
--   3. Adding rejection reason column for better audit clarity
--
-- STATUS LIFECYCLE AFTER THIS MIGRATION:
--   pending           → queued, awaiting founder review
--   approved          → founder approved, NOT yet dispatched to Fonnte  ← NEW
--   sent              → dispatched to Fonnte (send call made)
--   delivered         → Fonnte confirmed delivery
--   read              → recipient read the message
--   failed            → send attempt failed
--   rejected_by_founder → explicitly rejected by founder
--
-- 🔁 ROLLBACK:
--   ALTER TABLE wa_logs DROP COLUMN IF EXISTS rejection_reason;
--   ALTER TABLE wa_logs DROP COLUMN IF EXISTS rejected_at;
--   (Cannot easily revert CHECK constraint without rebuilding table)
--
-- ⚠️ APPLY TO PRODUCTION: npx wrangler d1 migrations apply (if using D1)
--    OR: Run in Supabase SQL editor
-- ============================================================================

-- Step 1: Drop old CHECK constraint on status
ALTER TABLE wa_logs DROP CONSTRAINT IF EXISTS wa_logs_status_check;

-- Step 2: Add new CHECK constraint with 'approved' status added
ALTER TABLE wa_logs ADD CONSTRAINT wa_logs_status_check
  CHECK (status IN (
    'pending',
    'approved',
    'sent',
    'delivered',
    'read',
    'failed',
    'rejected_by_founder'
  ));

-- Step 3: Add rejection_reason column for clearer audit when rejecting
ALTER TABLE wa_logs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Step 4: Add rejected_at timestamp for audit trail
ALTER TABLE wa_logs ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Step 5: Add composite index for approval queue queries (performance)
-- Covers: GET /api/wa/queue (requires_approval=true AND status='pending')
-- AND: GET /api/agents/pending-messages (same query pattern)
CREATE INDEX IF NOT EXISTS idx_wa_logs_approval_queue
  ON wa_logs(requires_approval, status, created_at DESC)
  WHERE requires_approval = true;

-- Step 6: Update comment to reflect new lifecycle
COMMENT ON COLUMN wa_logs.status IS
  'Message lifecycle: pending→approved(by founder)→sent(dispatched to Fonnte)→delivered(confirmed)→read. Also: failed, rejected_by_founder. Session 4G: approved status added for clarity between "approved but not yet sent" vs "actually sent".';

COMMENT ON COLUMN wa_logs.rejection_reason IS
  'Optional reason when founder rejects a queued message. Session 4G addition for audit clarity.';

COMMENT ON COLUMN wa_logs.rejected_at IS
  'Timestamp when founder explicitly rejected the message. Session 4G addition.';

-- ============================================================================
-- POST-RUN VALIDATION QUERIES:
--
-- Check constraint updated:
-- SELECT pg_get_constraintdef(c.oid)
--   FROM pg_constraint c
--   JOIN pg_class t ON t.oid = c.conrelid
--   WHERE t.relname = 'wa_logs' AND c.conname = 'wa_logs_status_check';
--
-- Check columns added:
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'wa_logs' AND column_name IN ('rejection_reason', 'rejected_at');
--
-- Check index created:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'wa_logs'
--   AND indexname = 'idx_wa_logs_approval_queue';
-- ============================================================================
