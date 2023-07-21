import airtable from 'airtable';
import { BackupEvent } from '../types';
import { fetchTables } from './fetchTables';
import { logger } from './logging';

export const fetchDataFromAirtable = async (event: BackupEvent, tableSpec: string) => {
  logger.info(`Begin fetching tables from airtable. Making request with tableSpec = ${tableSpec}.`)
  airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_TOKEN,
  });

  const base = airtable.base(event.AIRTABLE_BASE);
  // store all tables
  let tableNames: string[]
  if (tableSpec == '*') {
    const tablesFetched = await fetchTables({apiUrl: airtable.endpointUrl, baseId: event.AIRTABLE_BASE, apiKey: airtable.apiKey})
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
      const msg = `Can't find Airtable table ${table} with provided base ${event.AIRTABLE_BASE}. Original error: ${e}`
      logger.error(msg)
      throw new Error(msg);
    }
  }
  logger.info('Successfully retrieved table data from airtable.')
  return jsonRecords;
};
