import jsonwebtoken from 'jsonwebtoken';
import { v4 } from 'uuid';
import { Debugger } from 'debug';

import SessionModel from '../../models/Session';

import { UserJWT, AdminJWT, VisitorJWT } from './JWT';
import { AdminSession } from './AdminSession';
import { VisitorSession } from './VisitorSession';
import { PartialModelGraph } from 'objection';
import { Session } from './Session';
import { AuthenticationError } from 'apollo-server';

import {
	ContextInput,
	HttpContextInput,
	WebSocketContextInput,
	Loggers
} from './types';

import { log, debug } from '../logger';
import { defined } from '../../functions/defined';

import { HTTPConnection } from './HTTPConnection';
import { WSConnection } from './WSConnection';
import { Connection } from './Connection';

import { SESSION_SECRET } from '../../config';
import UserSession from './UserSession';
import { extractParentProp } from '../../functions/extractParentProp';

export function createConnection(
	contextInput: [HttpContextInput]
): HTTPConnection;
export function createConnection(
	contextInput: WebSocketContextInput
): WSConnection;
export function createConnection(contextInput: ContextInput): Connection;
export function createConnection(contextInput: unknown): unknown {
	log('Context: createContext');

	if (!Array.isArray(contextInput)) {
		throw new Error('contextInput must be an Array');
	}

	if (contextInput.length === 1) {
		// context
		const [{ req, res, connection: socket }] = contextInput;

		if (socket) {
			log(
				'Connection: createConnection: Found socket in contextInput. Using existing connection and session.'
			);

			if (!socket.context.connection) {
				throw new Error(
					'Connection: createConnection: Invalid socket context. "socket.context.connection" is undefined.'
				);
			}

			if (!(socket.context.connection instanceof WSConnection)) {
				throw new Error(
					'Connection: createConnection: Invalid socket context. "socket.context.connection" is not an instance of WebSocketConnection.'
				);
			}

			socket.context.debug(
				'Connection: createConnection: Found socket in contextInput. Using existing connection.'
			);

			return socket.context.connection;
		} else {
			debug(
				`Connection: createConnection: ${req.requestId}: Creating new HTTPConnection`
			);

			return new HTTPConnection({ req, res });
		}
	} else if (contextInput.length === 3) {
		// onConnect
		debug('createContext: creating new WebSocketConnection');
		const [connectionParams, ws, context] = contextInput;

		return new WSConnection({
			connectionParams,
			ws,
			context
		});
	} else {
		throw new Error('Invalid context input.');
	}
}

export const createUserSession = async (
	connection: Connection,
	loggers: Loggers
): Promise<UserSession> => {

	let session: any = await SessionModel.query()
		.findById(connection.jwt.sessionId);
	
	
	if(!session) {
		const newSession: PartialModelGraph<SessionModel> = {
			id: connection.jwt.sessionId,
			type: connection.jwt.type,
			authenticated: false
		};

		if (
			connection.jwt.isAdminJWT() &&
			connection.jwt.authenticated &&
			defined(connection.jwt.userId)
		) {
			newSession.authenticated = true;
			newSession.userId = connection.jwt.userId;

			session = await SessionModel.query().upsertGraphAndFetch(
				newSession,
				{
					relate: true,
					insertMissing: true
				}
			);

			return new AdminSession(connection.jwt, session, loggers);
		}

		if (connection.jwt.authenticated) {
			throw new AuthenticationError(
				'User is authenticated but does not have a session.'
			);
		}

		session = await SessionModel.query().upsertGraphAndFetch(newSession, {
			relate: true,
			insertMissing: true
		});

		connection.jwt.authenticated = false;
		connection.jwt.sessionId = session.id;

		switch (connection.jwt.type) {
			case 'ADMIN':
				return new AdminSession(
					connection.jwt as AdminJWT,
					session,
					loggers
				);
			case 'VISITOR':
				return new VisitorSession(
					connection.jwt as VisitorJWT,
					session,
					loggers
				);
			default:
				return new VisitorSession(
					connection.jwt as VisitorJWT,
					session,
					loggers
				);
		}
	}

	if (connection.jwt.isAdminJWT()) {
		return new AdminSession(connection.jwt, session, loggers);
	}

	if (connection.jwt.isVisitorJWT()) {
		return new VisitorSession(connection.jwt, session, loggers);
	}

	throw new Error('Invalid JWT for user session.');
}


export const createSession = async (
	connection: Connection
): Promise<Session> => {
	const loggers = connection.loggers.extend(
		connection.jwt.sessionId,
		connection.jwt.type
	);

	connection.loggers.debug(
		'Session: createSession'
	);

	switch (connection.entity) {
		case 'TERM':
			connection.loggers.debug(
				'Session: createSession: session type: TerminalSession'
			);

			throw new Error(
				'Session: createSession: TERM entity type is not supported.'
			);

		case 'USER': {
			connection.loggers.debug(
				'Session: createSession type: UserSession'
			);

			const session = await createUserSession(connection, loggers);

			return session;
		}
	}

};

export async function createContext(
	...contextInput: [HttpContextInput]
): Promise<Context<HTTPConnection>>;
export async function createContext(
	...contextInput: WebSocketContextInput
): Promise<Context<WSConnection>>;
export async function createContext(
	...contextInput: [HttpContextInput] | WebSocketContextInput
): Promise<Context<Connection>>;
export async function createContext(
	...contextInput: ContextInput
): Promise<unknown> {
	const connection = createConnection(contextInput);
	const session = await createSession(connection);

	const context = Context.createContext(connection, session);

	// save the context (so the header is set) if this is an HTTPConnection
	if (context.hasHTTPConnection()) {
		await context.save();
	}

	return context;
}

export class Context<
	ConnectionType extends Connection = Connection,
	SessionType extends Session = Session
> {
	static createContext<
		ConnectionType extends Connection = Connection,
		SessionType extends Session = Session
	>(
		connection: ConnectionType,
		session: SessionType
	): Context<ConnectionType, SessionType> {
		return new Context<ConnectionType, SessionType>(connection, session);
	}

	connection: ConnectionType;
	session: SessionType;

	log: Debugger;
	info: Debugger;
	warn: Debugger;
	error: Debugger;
	debug: Debugger;

	constructor(connection: ConnectionType, session: SessionType) {
		this.connection = connection;
		this.session = session;

		this.log = session.loggers.log;
		this.info = session.loggers.info;
		this.warn = session.loggers.warn;
		this.error = session.loggers.error;
		this.debug = session.loggers.debug;
	}

	async save(): Promise<void> {
		this.info('Context: save');

		if (this.hasHTTPConnection()) {
			const serializedSession = await this.session.serialize();

			this.debug(
				'Context: save: saving context. session: %O',
				serializedSession
			);

			const jwt = jsonwebtoken.sign(
				Object.fromEntries(
					Object.entries(serializedSession).filter(
						([, value]) => value
					)
				),
				SESSION_SECRET,
				{
					expiresIn: '30d'
				}
			);

			this.connection.setCookieHeader(jwt);
		} else {
			throw new Error('Session can only be saved if connected via HTTP.');
		}
	}

	hasWSConnection(): this is Context<WSConnection> {
		return this.connection.isWSConnection();
	}

	hasHTTPConnection(): this is Context<HTTPConnection> {
		return this.connection.isHTTPConnection();
	}

	hasUserSession(): this is Context<ConnectionType, UserSession> {
		return this.session.isUserSession();
	}

	hasVisitorSession(): this is Context<ConnectionType, VisitorSession> {
		return this.session.isVisitorSession();
	}

	hasAdminSession(): this is Context<ConnectionType, AdminSession> {
		return this.session.isAdminSession();
	}
}
