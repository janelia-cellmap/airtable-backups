# Airtable Backups

Back up all or some of the tables in an Airtable Base on S3 and a local directory. Because this program needs access to a local directory, it should run locally, e.g. from a [cron job](#configuring-a-scheduled-backup). 

The output of this program is a `JSON` document containing the contents(schema + fields) of the requested airtable tables.

The same `JSON` document is saved to s3 and local storage, with a filename in the following format: `yyyy_MM_dd_HH-mm-ss.json`.

This project is modified from [airtable-backups-boilerplate](https://github.com/UnlyEd/airtable-backups-boilerplate)

### Local install
Clone the repo, then

```bash
npm install -g
```
Using a global installation (the `-g` flag) is optional. It makes a cron job marginally simpler.

### Generating backups

run 

```
airtable-backup
```
From the command line.

### Configuration

#### Environment variables

This program is configured via environment variables, either directly or via a `.env` file. [This type](./src/types.ts#L5) expresses the expected structure of the environment variables (i.e., a handful of strings assigned to variables with capitalized names). The rest of the README will refer to variables in `.env`, but those values can be overriden by specifying environment variables directly.

The `AIRTABLE_BASE` variable in `.env` is the name of the airtable base that should be backed up. You can find that name by going to https://airtable.com/api, selecting your base, and looking for the base id.

The `AIRTABLE_TABLES` variable in `.env` is either the string `*`, which means "all tables", or a ";" delimited list of table names, which specifies exactly which tables you want to back up.


#### Airtable credentials

First, you need to find your Airtable API KEY, you can find it in your [Airtable account](https://airtable.com/account), or in the API documentation of your Airtable Base. Assign `AIRTABLE_TOKEN` in `.env` to the value of your airtable api key. As per best practices, the `.env` file should never be checked into version control!

### Storage

##### Local

You need to create a directory for local backups, e.g. `/User/foo/home/airtable/`. Assign the absolute path to this directory to the `LOCAL_DIRECTORY` variable in `.env`. 

Backups will be stored in a subdirectory within this directory. The `PREFIX` variable in `.env` determines the name of this sub-directory.

For example, if `LOCAL_DIRECTORY` is `/foo/bar`, and `PREFIX` is `backups`, backups will be saved in `/foo/bar/backups`.

##### S3

You need to create a bucket before this tool can write to S3. Use the [AWS Console](https://console.aws.amazon.com/s3/home) or the programmatic method of your choice.

Assign the name of this bucket to the `S3_BUCKET` variable in `.env`.

Backups will be stored with a prefix appended to their filename. The `PREFIX` variable in `.env` determines the value of this prefix.

For example,  if `S3_BUCKET` is `my-cool-bucket`, and `prefix` is `backups`, then backups will be saved to `s3://my-cool-bucket/backups`. Unless you specify your AWS credentials with environment variables, you must have your S3 credentials available in the normal location. See the AWS documentation for more.

##### S3 Storage Classes

S3 objects can be stored in a variety of storage classes. See the [official documentation](https://aws.amazon.com/en/s3/storage-classes/) for details.

The storage class I recommend for storing backups is `STANDARD_IA` (AKA "Standard Infrequent Access"). It's a good compromise in terms of cost, accessibility, backup redundancy (multi zones), etc. 

Set the `S3_STORAGE_CLASS` value in `.env` to your desired storage class. The default is `STANDARD_IA`.

### Configuring a scheduled backup

This program can be used with [`cron`](https://en.wikipedia.org/wiki/Cron) to run regular backups from a machine running Linux. An example entry in `crontab` for running a backup every day at midnight and logging errors / status to a logfile might look like this: 

`0 0 * * * exec /usr/bin/zsh /path/to/repo/airtable-backups/src/cron.sh >> /var/log/airtable-backup.log 2>&1`

Note that the log file (e.g., `/var/log/airtable-backup.log`) must be created before running this, with the correct permissions to enable writing.`

For me it was helpful to write a standalone [shell script](./src/cron.sh) for `cron`.

## Airtable - Security Concerns

Be extra cautious about not leaking your Airtable API Key anywhere (like on github, for instance)