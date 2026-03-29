ALTER TABLE [User]
ADD
    customInstructions NVARCHAR(MAX) NULL,
    privacyMode BIT NOT NULL DEFAULT 1,
    useMemory BIT NOT NULL DEFAULT 1;
GO
