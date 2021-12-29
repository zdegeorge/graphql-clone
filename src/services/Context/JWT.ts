import { v4 } from 'uuid';
import { verify } from 'jsonwebtoken';
// import shortid from 'shortid';

import { SessionType } from './types';

import { info } from '../logger';
import { SESSION_SECRET } from '../../config';

export interface JWTInput<Type = SessionType | undefined> {
	type: Type;

	// connectionId?: string;

	sessionId?: string;
	authenticated?: boolean;
	userId?: string;

	iat?: number;
	exp?: number;
}

const validateSessionType = <T extends SessionType>(
	t: unknown
): t is Exclude<JWTInput<T>, Record<string, unknown>> =>
	Object.prototype.hasOwnProperty.call(t, 'type');

export abstract class JWT {
	static verify<T extends SessionType>(
		jwt: string,
		sessionTypes: T[]
	): JWTInput<T> {
		info('JWT: verify');
		const result = <Record<string, unknown>>verify(jwt, SESSION_SECRET);

		if (typeof result === 'string') {
			throw new Error('JWT: verify: Invalid jwt result.');
		}

		if (!validateSessionType<T>(result)) {
			throw new Error('JWT: verify: Result does not have a type.');
		}

		if (!sessionTypes.includes(result.type as T)) {
			throw new Error(
				'JWT: verify: Result type does not match any of the requested types.'
			);
		}

		return result;
	}

	abstract type: SessionType;

	// connectionId: string;

	sessionId: string;
	authenticated: boolean;

	iat?: number;
	exp?: number;

	constructor(jwt: JWTInput) {
		info('JWT: constructor');
		// this.connectionId = jwt.connectionId || shortid();

		this.sessionId = jwt.sessionId || v4();
		this.authenticated = jwt.authenticated || false;

		this.iat = jwt.iat;
		this.exp = jwt.exp;
	}

	isVisitorJWT(): this is UserJWT {
		return this.type === 'VISITOR';
	}

	isAdminJWT(): this is AdminJWT {
		return this.type === 'ADMIN';
	}
}


export abstract class UserJWT extends JWT {
	abstract type: 'VISITOR' | 'ADMIN';

	constructor(jwt: JWTInput<'VISITOR' | 'ADMIN'>) {
		super(jwt);
		info('UserJWT: constructor');
	}
}

export class AdminJWT extends UserJWT {
	type!: 'ADMIN';
	userId?: number;

	constructor(jwt: JWTInput<'ADMIN'> = { type: 'ADMIN' }) {
		super(jwt);
		info('AdminJWT: constructor');
	}
}

export class VisitorJWT extends UserJWT {
	type!: 'VISITOR';

	constructor(jwt: JWTInput<'VISITOR'> = { type: 'VISITOR' }) {
		super(jwt);
		info('VisitorJWT: constructor');
	}
}
