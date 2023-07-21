import { logger } from "./logging";

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