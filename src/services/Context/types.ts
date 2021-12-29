import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { ConnectionContext } from 'subscriptions-transport-ws';
import { Debugger } from 'debug';

import ws = require('ws');
import express = require('express');
import { VisitorSession } from './VisitorSession';
import UserSession from './UserSession';

export interface LoungeAuthenticationRequestData {
	url: string;
	method: string;
	data: {
		status: string;
		username: string;
		password: string;
	};
}

export type ConnectionType = 'HTTP' | 'WS';
export type ConnectionEntity = 'USER' | 'TERM';
export type SessionType = 'VISITOR' | 'ADMIN';

export interface WSConnectionInput {
	connectionParams: ConnectionParams;
	ws: ws;
	context: ConnectionContext;
}

export interface HTTPConnectionInput {
	req: Request;
	res: express.Response;
}

export type Credentials =
	| Schema.AuthenticateAdminInput
	| Schema.AuthenticateVisitorInput
	| null;

export interface ConnectionParams {
	authToken?: string;
	cookie?: string;
}

export interface AuthenticationStrategyInterface<
	CredentialsType extends Credentials
> {
	authenticate(
		session: UserSession,
		credentials: CredentialsType
	): Promise<string | boolean>;
}

export type WebSocketContextInput = [ConnectionParams, ws, ConnectionContext];

export type Request = express.Request & {
	requestId: string;
};

export interface HttpContextInput extends ExpressContext {
	req: Request;
}

export type ContextInput = [HttpContextInput] | WebSocketContextInput;

export interface Loggers {
	debug: Debugger;
	log: Debugger;
	error: Debugger;
	warn: Debugger;
	info: Debugger;
}

export interface ConnectionLoggers extends Loggers {
	extend(sessionId: string, sessionType?: SessionType): Loggers;
}

export type AuthorizeArgs = {
	authenticated?: boolean;
	sessionId?: string;
};

export type TerminalAuthorizeArgs = AuthorizeArgs & {
	storeId?: number;
	termId?: number;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type UserAuthorizeArgs = AuthorizeArgs & {};

export type EmployeeAuthorizeArgs = UserAuthorizeArgs & {
	employeeId?: number;
	roleIds?: number[];
	storeIds?: number[];
	permissions?: Schema.Permission[];
};

export type CustomerAuthorizeArgs = UserAuthorizeArgs & {
	profileId?: number;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type BHLoungeAuthorizeArgs = CustomerAuthorizeArgs & {};

export type AppUserAuthorizeArgs = CustomerAuthorizeArgs & {
	appUserId?: number;
};
