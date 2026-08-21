-- Migration 0004: User Plans & Custom Monthly Quota Limits
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN monthly_limit INTEGER NOT NULL DEFAULT 200;
