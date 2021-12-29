require('dotenv/config');
import knex, { Knex } from 'knex';
import { Model } from 'objection';
import { ConnectionConfig } from 'mysql';

import {
	DB_HOST,
	DB_PORT,
	DB_USER,
	DB_PASSWORD,
	DB_DATABASE,
    DB_DATABASE_STAGING
} from './config';

const default_connection: ConnectionConfig & {
	dateStrings?: boolean;
	debug?: boolean;
	flags?: string;
	ssl?: string | Knex.MariaSslConfiguration;
} = {
	host: DB_HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	timezone: 'Z',
};

const staging_connection: ConnectionConfig & {
	dateStrings?: boolean;
	debug?: boolean;
	flags?: string;
	ssl?: string | Knex.MariaSslConfiguration;
} = {
	host: DB_HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_DATABASE_STAGING,
	timezone: 'Z',
};

const config: Knex.Config = {
    client: 'mysql',
    connection: default_connection
};

const prodConfig: Knex.Config = {
    client: 'mysql',
    connection: default_connection
};

const stagingConfig: Knex.Config = {
    client: 'mysql',
    connection: staging_connection
};

export const defaultDb = Model.knex(knex(config));
export const prodDb = knex(prodConfig);
export const stagingDb = knex(stagingConfig);

export const connect = (): Knex => Model.knex(knex(config));

