-- Database Verification Script
--
-- Use this script to verify the integrity of the database schema,
-- including tables, constraints, indexes, and functions.
-- It should be run after migrations.

-- Example Verification Query:
-- Check if the 'users' table exists
SELECT to_regclass('public.users') IS NOT NULL AS table_exists;

-- Check for specific columns in a table
SELECT
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'users'
ORDER BY
    ordinal_position;

-- Add more verification queries below
-- e.g., check foreign keys, indexes, enums, triggers, etc. 