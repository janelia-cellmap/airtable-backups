import { BackupEvent } from '../types';
import { fetchDataFromAirtable } from '../utils/airtableParser';
import { saveToS3, saveToLocal } from '../utils/backup';
import { Handler } from 'aws-lambda';

export const handler: Handler = async (event: BackupEvent, context, callback) => {
  const airtableContent = await fetchDataFromAirtable(event, event.AIRTABLE_TABLES);
  try {
    const response = await uploadToS3(event, airtableContent);

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
