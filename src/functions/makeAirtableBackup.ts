import { BackupConfig } from '../types';
import { fetchDataFromAirtable } from '../utils/airtable';
import { saveToS3, saveToLocal } from '../utils/store';
import { Handler } from 'aws-lambda';

export const handler: Handler = async (event: BackupConfig, context, callback) => {
  const airtableContent = await fetchDataFromAirtable(event);
  try {
    const response = await saveToS3({bucket: event.S3_BUCKET, data: airtableContent, prefix: });

    try {
      const {
        __metadata: {
          Bucket: bucketName,
          StorageClass: storageClass,
          Key: backupName,
        },
      } = response;
      console.log(`Backup "${backupName}" successfully uploaded to bucket "${bucketName}" (using storage class: "${storageClass}")`);

      return {
        statusCode: 200,
        body: 'Successfully created backup',
      };

    } catch (e) {
      console.error(e);

      return {
        statusCode: 500,
        body: JSON.stringify({
          'error': e,
          'humanReadableError': 'Error while uploading data to S3',
        }),
      };
    }
  } catch (e) {
    console.error(e);

    return {
      statusCode: 500,
      body: JSON.stringify({
        'error': e,
        'humanReadableError': 'Error while uploading data to S3',
      }),
    };
  }
};
