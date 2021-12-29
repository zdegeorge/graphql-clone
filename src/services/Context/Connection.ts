import { HTTPConnection } from './HTTPConnection';
import { WSConnection } from './WSConnection';

import {
	ConnectionType,
	ConnectionLoggers,
	ConnectionEntity,
	SessionType
} from './types';
import { JWT } from './JWT';

import { debug, log, error, warn, info } from '../../services/logger';

export abstract class Connection {
	static getLoggers(id: string, type: ConnectionType): ConnectionLoggers {
		// id = translator(id);

		const connectionNamespace = `${type === 'WS' ? '  WS' : 'HTTP'} ${id}`;
		const paddedConnectionNamespace = `                                              ${
			type === 'WS' ? '  WS' : 'HTTP'
		} ${id}`;

		return {
			debug: debug.extend(paddedConnectionNamespace),
			log: log.extend(paddedConnectionNamespace),
			error: error.extend(paddedConnectionNamespace),
			warn: warn.extend(paddedConnectionNamespace),
			info: info.extend(paddedConnectionNamespace),
			extend(sessionId: string, sessionType?: SessionType) {
				// sessionId = translator(sessionId);

				const nameSpace = `${
					sessionType ? sessionType : ' UNKNOWN'
				} ${sessionId} ${connectionNamespace}`;

				return {
					debug: debug.extend(nameSpace),
					log: log.extend(nameSpace),
					error: error.extend(nameSpace),
					warn: warn.extend(nameSpace),
					info: info.extend(nameSpace)
				};
			}
		};
	}

	abstract type: ConnectionType;
	abstract id: string; // requestId or socketId (uuid)
	abstract entity: ConnectionEntity;

	loggers: ConnectionLoggers;
	jwt: JWT;

	constructor(jwt: JWT, loggers: ConnectionLoggers) {
		loggers.info('Connection: constructor');

		this.loggers = loggers;
		this.jwt = jwt;
	}

	isWSConnection(): this is WSConnection {
		return this.type === 'WS';
	}

	isHTTPConnection(): this is HTTPConnection {
		return this.type === 'HTTP';
	}
}
