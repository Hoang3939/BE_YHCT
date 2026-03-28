-- Migration: Create PasswordReset table for forgot-password flow
-- Run this against YHCT_DB before deploying the new code

CREATE TABLE PasswordReset (
    idReset        UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    accountId      UNIQUEIDENTIFIER NOT NULL,
    token          NVARCHAR(255)    NOT NULL,
    expiresAt      DATETIME2(7)     NOT NULL,
    createdAt      DATETIME2(7)     DEFAULT GETUTCDATE()
);
