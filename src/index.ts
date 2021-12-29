import { ApolloServer } from 'apollo-server';
import { connect } from './db-connect';
import * as resolvers from './resolvers';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs, { schema as schemaString } from './typeDefs';
import { Session } from './services/Context/Session';
import { Connection } from './services/Context/Connection';
import { Context } from './services/Context/Context';
import { IResolvers } from 'graphql-tools';
import {
  PRODUCTION,
  DEBUG_CACHE
} from './config';
import {
	GraphQLRequestContext,
	GraphQLRequestListener
} from 'apollo-server-plugin-base';

import { debug, error, http, info, log, warn } from './services/logger';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import { createContext } from './services/Context/Context';

console.log('connecting to database');
connect();
console.log('database connected');

const Resolvers = {
	...resolvers
} as IResolvers<Context<Connection, Session>>;

console.log(Resolvers);

console.log('loading schema');
const schema = makeExecutableSchema({ typeDefs, resolvers: Resolvers });
console.log('schema loaded');

const server = new ApolloServer({
	schema,
	debug: !PRODUCTION,
	context: createContext
});

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});