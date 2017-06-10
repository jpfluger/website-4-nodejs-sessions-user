/*
 * DB SCHEMAS v0.1.0
 */

--CREATE DATABASE mydb;

--\c mydb

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- version
-- --------------------------------------------------------
-- Contains a single row with this databases sql schema version
-- Doing it here to keep it generic between databases in case of a switch (eg MariahDB)
-- --------------------------------------------------------

CREATE TABLE "version" (
  "schema" TEXT NOT NULL
);

insert into "version" ("schema") values ('0.1.0');

-- --------------------------------------------------------
-- users
-- --------------------------------------------------------

CREATE TABLE "users" (
  -- a random v4 uuid is more difficult to guess but less easy to maintain (could use serial/int)
  "userid" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- email vs username? for a simple db schema, use case probably leans "email"
  -- when including email (or username), recommended to send verification email to user
  -- b/c this demo doesn't cover email verify, we'll use "username" and not include email as a column
  "username" TEXT NOT NULL,
  -- using pgcrypt for password hash and unique salt
  "password" TEXT NOT NULL,
  "fullname" TEXT NOT NULL
);

-- allow faster lookups
CREATE UNIQUE INDEX IDX_users_username ON "users" ("username");

-- --------------------------------------------------------
-- statistics
-- --------------------------------------------------------

CREATE TABLE "global_stats" (
  "appName" TEXT NOT NULL PRIMARY KEY,
  "stats" JSONB NOT NULL
);

-- --------------------------------------------------------
-- TESTING
-- --------------------------------------------------------

INSERT INTO users (username, password, fullname) VALUES ('test', crypt('Test123!', gen_salt('bf', 8)), 'Test User');
