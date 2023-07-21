import pino from 'pino';

export const logger = pino({
  name: 'airtable-backup',
  level: 'debug'
});