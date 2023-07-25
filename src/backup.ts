import { PutObjectAclCommand, PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import {z} from 'zod'
import { logger } from "./logging";
import fs from "fs/promises"
import { format } from "date-fns";
import { BackupConfig } from "./types";
import { fetchDataFromAirtable } from "./airtable";

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
    const result = await fs.writeFile(args.fname, JSON.stringify(args.data))
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

export const saveBackups = async (config: BackupConfig) => {    
  const airtableContent = await fetchDataFromAirtable(config);
  logger.info('Successfully retrieved table data from airtable.')
  const name = nameFile(config.PREFIX)
  const s3Uri = `${config.S3_BUCKET}/${name}`
  const localUri = `${config.LOCAL_DIRECTORY}/${name}`
  logger.info(`Begin saving data to ...${s3Uri}`)
  try {
      const s3Response = await saveToS3({bucket: config.S3_BUCKET, key: name, data: airtableContent});
      logger.info(`Successfully saved data to ${s3Uri}`)
  }
  catch (err) {
      logger.error(`Error encountered while saving data to ${s3Uri}: ${err}`)
  }
  logger.info(`Begin saving data to ${localUri}...`)
  try {
      const localResponse = await saveToLocal({fname: localUri, data: airtableContent})
      logger.info(`Successfully saved data to ${localUri}.`)
  }
  catch (err)
  {
      logger.error(`Error encountered while saving data to ${localUri}: ${err}`)
  }
  logger.info('Finished backing up airtable content.')
}