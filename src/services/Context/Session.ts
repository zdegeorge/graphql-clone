import { Transaction } from 'objection';

import SessionModel from '../../models/Session'

import { SessionType, Loggers, Credentials, AuthorizeArgs } from './types';

import { JWT, JWTInput } from './JWT';
import UserSession from './UserSession';
import { AdminSession } from './AdminSession';
import { VisitorSession } from './VisitorSession';

export abstract class Session {
	abstract type: SessionType;
	abstract loggers: Loggers;
	abstract userId?: string | number;

	id: string;
	// connectionId: string;
	authenticated: boolean;
	private txn_?: Transaction;

	constructor(jwt: JWT) {
		this.id = jwt.sessionId;
		// this.connectionId = jwt.connectionId;

		this.authenticated = jwt.authenticated;
	}

	set txn(txn: Transaction | undefined) {
		this.txn_ = txn;
	}

	get txn(): Transaction | undefined {
		return this.txn_;
	}

	abstract serialize(): Promise<JWTInput<SessionType>>;
	abstract authenticate(credentials: Credentials): Promise<string | boolean>;

	async authorize({
		authenticated,
		sessionId
	}: AuthorizeArgs): Promise<boolean> {
		let hasAuthenticated = true;
		let hasSessionId = true;

		if (authenticated !== undefined) {
			hasAuthenticated = this.authenticated === authenticated;
		}

		if (sessionId) {
			hasSessionId = this.id === sessionId;
		}

		return hasAuthenticated && hasSessionId;
	}

	isAdminSession(): this is AdminSession {
		return this.type === 'ADMIN';
	}

	isUserSession(): this is UserSession {
		return ['ADMIN', 'VISITOR'].includes(this.type);
	}

	isVisitorSession(): this is VisitorSession {
		return this.type === 'VISITOR';
	}
}