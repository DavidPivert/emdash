---
"emdash": patch
---

Fixes `emdash migrate` failing on Cloudflare D1 with `incomplete input: SQLITE_ERROR (migration: 081_redirect_write_guards)`. The redirect loop triggers no longer contain an inner `CASE ... END;`, which the D1 HTTP API treated as the end of the `CREATE TRIGGER` statement. Loop detection is unchanged. Sites where 081 stopped partway can run `emdash migrate` again: the migration resumes safely.
