import { BackupConfig, zBackupConfig } from "./types"
import { fetchDataFromAirtable } from "./airtable"
import { nameFile, saveBackups, saveToLocal, saveToS3 } from "./backup"
import { logger } from "./logging"
require('dotenv').config()

const main = () => {
    const config = zBackupConfig.parse(process.env)
    saveBackups(config)
}

main()