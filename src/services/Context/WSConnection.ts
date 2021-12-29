import shortid from 'shortid';
import { Connection } from './Connection';
import { HTTPConnection } from './HTTPConnection';
import { ConnectionEntity, WSConnectionInput } from './types';
import {
	JWT,
	JWTInput,
	AdminJWT,
	VisitorJWT
} from './JWT';
import { hostNameToSessionType } from '../../functions/hostNameToSessionType';

export class WSConnection extends Connection {
	id: string;
	entity: ConnectionEntity;
	type: 'WS';

	constructor({ connectionParams, context }: WSConnectionInput) {
		const socketId = shortid();
		const loggers = Connection.getLoggers(socketId, 'WS');

		loggers.info('WebSocketConnection: constructor');

		loggers.debug(
			'WebSocketConnection: context.request.headers: %O',
			context.request.headers
		);

		const authToken = connectionParams['authToken'];

		let jwt!: JWT;
		let entity!: ConnectionEntity;

		const sessionType = hostNameToSessionType(
			{
				incomingMessage: context.request
			},
			loggers
		);

		switch (sessionType) {
			case 'VISITOR':
			case 'ADMIN':
				entity = 'USER';
				break;
		}

		switch (sessionType) {
			case 'VISITOR': {
				let jwtInput: JWTInput<'VISITOR'> | undefined;
				const { graphqlCookie } = HTTPConnection.parseCookie(
					loggers,
					'VISITOR',
					context.request.headers.cookie ?? connectionParams['cookie']
				);

				if (graphqlCookie) {
					jwtInput = JWT.verify(graphqlCookie.token, [
						graphqlCookie.type
					]);
				}

				jwt = new VisitorJWT(jwtInput);
				break;
			}
			case 'ADMIN': {
				let jwtInput: JWTInput<'ADMIN'> | undefined;
				const { graphqlCookie, managerCookie } =
					HTTPConnection.parseCookie(
						loggers,
						'ADMIN',
						context.request.headers.cookie ??
							connectionParams['cookie']
					);

				if (graphqlCookie) {
					jwtInput = JWT.verify(graphqlCookie.token, [
						graphqlCookie.type
					]);
				}

				if (managerCookie && !jwtInput?.authenticated) {
					jwtInput = JWT.verify(managerCookie.token, [
						managerCookie.type
					]);
				}

				jwt = new AdminJWT(jwtInput);
				break;
			}
		}

		super(jwt, loggers);
		this.entity = entity;
		this.id = socketId;
		this.type = 'WS';
		loggers.debug('WebSocketConnection: setting socketId %s', this.id);
	}
}
