import SessionModel from '../../models/Session';

import UserSession from './UserSession';

import { UserJWT } from './JWT';
import { Credentials, CustomerAuthorizeArgs, Loggers } from './types';

export class VisitorSession extends UserSession {
	
    type: 'VISITOR';
	loggers: Loggers;
	graph = {};
	userId?: string | number;

	constructor(jwt: UserJWT, session: SessionModel, loggers: Loggers) {
		super(jwt, session);
		this.type = 'VISITOR';
		this.loggers = loggers;
		this.graph = {};
		this.userId = session.userId;
	}

	authenticate(_: Credentials): Promise<string | boolean> {
		return new Promise((resolve, _) => {
			resolve("200");
		})
	}

}
