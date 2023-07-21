import { PutObjectAclCommand, PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import {z} from 'zod'
import { logger } from "./logging";
import fs from "fs/promises"
import { format } from "date-fns";

type LocalSaveArgs = {
  fname: string
  data: {[key: string]: any}
}

type S3SaveArgs = {
  bucket: string
  key: string
  storageClass?: string
  data: {[key: string]: any}
}

export const nameFile = (prefix: string) => {
  return prefix + '/' + format(new Date(), 'yyyy_MM_dd_HH-mm-ss') + '.json';
}

export const saveToLocal = async (args: LocalSaveArgs) => {
    const result = (await fs.open(args.fname)).write(JSON.stringify(args.data))
    logger.info(`Successfully saved to ${args.fname}.`)
    return result
}

export const saveToS3 = async (args: S3SaveArgs) => {
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
    Key: args.key,
  });

  const command = new PutObjectCommand({
    ...params,
    Body: JSON.stringify(args.data),
  });
    const response = await s3.send(command)
    return {
      ...response,
      __metadata: {
        ...params,
      },
    };
};