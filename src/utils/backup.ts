import { PutObjectAclCommand, PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import {z} from 'zod'
import { logger } from "./logging";
import fs from "fs/promises"

export type LocalSaveArgs = {
  fname: string
}

export type S3SaveArgs = {
  bucket: string
  prefix: string
  storageClass?: string
}

export const saveToLocal = async (args: LocalSaveArgs, data: unknown) => {
    const result = (await fs.open(args.fname)).write(JSON.stringify(data))
    logger.info(`Successfully saved to ${args.fname}.`)
    return result
}

export const saveToS3 = async (args: S3SaveArgs, data: unknown) => {
  const s3 = new S3Client({});
  const bucket = args.bucket
  const storageClass = args.storageClass ?? 'STANDARD_IA'
  
  const zParams = z.object({
    Bucket: z.string(),
    StorageClass: z.string(),
    Key: z.string()
  })

  const params = zParams.parse({
    Bucket: bucket,
    StorageClass: storageClass,
    Key: args.prefix,
  });

  const command = new PutObjectCommand({
    ...params,
    Body: JSON.stringify(data),
  });
    const response = await s3.send(command)
    return {
      ...response,
      __metadata: {
        ...params,
      },
    };
};
