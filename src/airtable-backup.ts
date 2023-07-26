#! /usr/bin/env ts-node

import { zBackupConfig } from "./types"
import { saveBackups } from "./backup"
require('dotenv').config()

const main = () => {
    const config = zBackupConfig.parse(process.env)
    saveBackups(config)
}

main()