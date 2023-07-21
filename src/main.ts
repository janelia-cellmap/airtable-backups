import { handler } from "./functions/makeAirtableBackup"
import { zBackupEvent } from "./types"
import { fetchDataFromAirtable } from "./utils/airtableParser"
import { saveToLocal, saveToS3 } from "./utils/backup"
import {format} from "date-fns"
import { logger } from "./utils/logging"

require('dotenv').config()

const main = async () => {
    const event = zBackupEvent.parse(process.env)
    const airtableContent = await fetchDataFromAirtable(event, event.AIRTABLE_TABLES);
    const backupName = event.PREFIX + '/' + format(new Date(), 'yyyy_MM_dd_HH-mm-ss') + '.json';
    const s3Uri = `${event.S3_BUCKET}/${backupName}`
    const localUri = `${event.LOCAL_DIRECTORY}/${backupName}`
    logger.info(`Begin saving data to ...${s3Uri}`)
    try {
        const s3Response = await saveToS3({bucket: event.S3_BUCKET, prefix: backupName}, airtableContent);
        logger.info(`Successfully saved data to ${s3Uri}`)
    }
    catch (err) {
        logger.error(`Error encountered while saving data to ${s3Uri}: ${err}`)
    }
    logger.info(`Begin saving data to ${localUri}...`)
    try {
        const localResponse = await saveToLocal({fname: localUri}, airtableContent)
        logger.info(`Successfully saved data to ${localUri}.`)
    }
    catch (err)
    {
        logger.error(`Error encountered while saving data to ${localUri}: ${err}`)
    }
    logger.info('Finished backing up airtable content.')
}

main().then(console.dir)