import {z} from 'zod'
const storageClasses = ["STANDARD", "REDUCED_REDUNDANCY", "STANDARD_IA", "ONEZONE_IA", "INTELLIGENT_TIERING", "GLACIER", "DEEP_ARCHIVE"] as const;
type StorageClass = typeof storageClasses[number]

export type BackupConfig = {
    AIRTABLE_TOKEN: string
    AIRTABLE_BASE: string
    AIRTABLE_TABLES: string
    S3_BUCKET: string
    PREFIX: string
    STORAGE_CLASS: string
    LOCAL_DIRECTORY: string
}

export const zBackupConfig = z.object({
    AIRTABLE_TOKEN: z.string(),
    AIRTABLE_BASE: z.string(),
    AIRTABLE_TABLES: z.string(),
    S3_BUCKET: z.string(),
    PREFIX: z.string(),
    STORAGE_CLASS: z.string(),
    LOCAL_DIRECTORY: z.string()
}) satisfies z.ZodType<BackupConfig>