# CREDENTIAL AND ACCESS READINESS
Classification: Internal Access Gate
Status: Required Before Execution
Version: 1.0

## Purpose
This document exists to prevent AI execution from assuming that access, secrets,
repo auth, or environment setup already exist.

No implementation session should begin without passing this gate.

## Access Gate Checklist

### 1. Uploaded Setup Assets Check
Check whether the current working environment includes any newly uploaded files for:
- credential notes
- repo auth notes
- env templates
- deployment setup notes
- token placeholders
- account access instructions

### 2. Canonical Repo Access Check
Confirm:
- repo target is known
- repo exists
- branch strategy is known
- working access exists or does not exist
- push permission exists or does not exist

### 3. Environment Readiness Check
Confirm whether execution requires:
- .env
- .dev.vars
- secret manager values
- sandbox env vars
- deployment credentials
- cloud or database auth

### 4. Credential Handling Classification
Every needed credential must be classified as one of:
- status-only in docs
- safe for local sandbox temporary use
- founder-only manual injection
- production-only
- not yet available

### 5. Missing Access Report
List:
- missing repo access
- missing env files
- missing secrets
- missing deployment auth
- missing manual founder action

### 6. Proceed Decision
Execution status must end with one of these:
- PROCEED
- PROCEED WITH LIMITATIONS
- BLOCKED PENDING ACCESS
- PUSH-READY AFTER MANUAL INJECTION

## Rules
- Never write raw secret values into general living docs
- Never assume auth exists
- Never guess credential values
- Never classify production secrets as normal notes
- Always separate “credential name/status” from “credential value”

## Output Format
Each access check should output:
- what was found
- what was missing
- what is founder-only
- what is safe for sandbox
- what blocks execution
- what can still proceed without access
