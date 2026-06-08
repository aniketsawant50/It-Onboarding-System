-- Optional reference migration if you do NOT use spring.jpa.hibernate.ddl-auto=update.
-- With ddl-auto=update (default in this project), Hibernate aligns schema from entities.

-- Example: ensure onboarding columns exist on users (adjust if your DB already differs).
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_query_reason VARCHAR(80);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_query_remarks VARCHAR(2000);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_query_at DATETIME(6);

-- Tables for timeline/audit are created by JPA from entities:
-- onboarding_timeline_events, hr_audit_log
