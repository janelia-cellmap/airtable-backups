import { handler } from "./functions/makeAirtableBackup"
import { zBackupEvent } from "./types"
import { fetchDataFromAirtable } from "./utils/airtable"
import { nameFile, saveToLocal, saveToS3 } from "./utils/store"
import {format} from "date-fns"
import { logger } from "./utils/logging"

require('dotenv').config()

const main = async () => {
    const config = zBackupEvent.parse(process.env)
    const airtableContent = await fetchDataFromAirtable(config);
    logger.info('Successfully retrieved table data from airtable.')
    const name = nameFile(config.prefix)
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

main().then(console.dir)