import SessionModel from '../../models/Session';

import { UserJWT } from './JWT';
import { UserSession } from './UserSession';
import { Credentials, Loggers } from './types';

export class AdminSession extends UserSession {
	
    type: 'ADMIN';
	loggers: Loggers;
	graph = {};
	userId?: string | number;

	constructor(jwt: UserJWT, session: SessionModel, loggers: Loggers) {
		super(jwt, session);
		this.type = 'ADMIN';
		this.loggers = loggers;
		this.graph = {};
		this.userId = session.userId;
	}

	authenticate(credentials: Credentials): Promise<string | boolean> {
		return new Promise((resolve, _) => {
			resolve("200");
		})
	}
 
}
