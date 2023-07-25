import airtable from 'airtable';
import { BackupConfig } from './types';
import { logger } from './logging';

type fetchTablesArgs = {
  apiUrl: string,
  baseId: string,
  apiKey: string
}

export const fetchTables = async ({apiUrl, baseId, apiKey}: fetchTablesArgs) => {
const url = `${apiUrl}/v0/meta/bases/${baseId}/tables`;
const requestInit = {
method: 'GET',
withCredentials: true,
headers: {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
}}
const response = await fetch(
  url,
  requestInit,
)
if (response.status == 200){
    return await response.json()
}
else {
  const msg = `Encountered an error fetching list of tables from airtable. Got HTTP status code ${response.status} when attempting to GET from ${url}`
  logger.error(msg)
  throw new Error(msg)
}
}

export const fetchDataFromAirtable = async (config: BackupConfig) => {
  const tableSpec = config.AIRTABLE_TABLES
  logger.info(`Begin fetching tables from airtable. Making request with tableSpec = ${tableSpec}.`)
  airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_TOKEN,
  });

  const base = airtable.base(config.AIRTABLE_BASE);
  // store all tables
  let tableNames: string[]
  if (tableSpec == '*') {
    const tablesFetched = await fetchTables({apiUrl: airtable.endpointUrl, baseId: config.AIRTABLE_BASE, apiKey: airtable.apiKey})
    try{
      tableNames = tablesFetched['tables'].map((t: {name: string}) => {return t.name})
    }
    catch (err) {
      const msg = `Encountered an error while attempting to parse tables fetched from airtable. Original error: ${err}`
      logger.error(msg)
      throw err
    }
  }
  else {
    tableNames = tableSpec.split(";")
  }
  logger.info(`Getting contents of these ${tableNames.length} tables: ${tableNames}.`)
  let jsonRecords: {[key: string]: unknown} = {};
  for (const table of tableNames) {
    try {
      await base(table).select().all().then(async (records) => {
        jsonRecords[table] = (records.map((record) => record._rawJson));
      });
    } catch (e) {
      const msg = `Can't find Airtable table ${table} with provided base ${config.AIRTABLE_BASE}. Original error: ${e}`
      logger.error(msg)
      throw new Error(msg);
    }
  }
  return jsonRecords;
};
