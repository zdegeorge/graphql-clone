import { QueryBuilder, RelationExpression, ModelRelations } from 'objection';

import SessionModel from '../../models/Session';

import { JWTInput, UserJWT } from './JWT';
import { Session } from './Session';

export interface GraphField {
	[x: string]: boolean | GraphField | undefined;
}

export abstract class UserSession extends Session {
	abstract type: 'VISITOR' | 'ADMIN';
	abstract graph: {
		[K in ModelRelations<SessionModel>]?: boolean | GraphField | undefined;
	};

	protected session_: SessionModel;

	constructor(jwt: UserJWT, session: SessionModel) {
		super(jwt);

		this.authenticated = session.authenticated;

		this.session_ = session;
	}

	get initialSession(): SessionModel {
		// this.loggers.warn(
		// 	"Warning: the data in the 'initialSession' is potentially not up to date with the actual contents of the user's session. Are you sure you didn't mean to use '(await context.session).someProperty'?"
		// );

		return this.session_;
	}

	get session(): QueryBuilder<SessionModel, SessionModel> {
		return this.session_
			.$query(this.txn)
			.withGraphFetched({ ...this.graph });
	}

	async serialize(): Promise<JWTInput<'ADMIN' | 'VISITOR'>> {
		return {
			type: this.type,
			authenticated: this.authenticated,
			sessionId: this.id
		};
	}
}

export default UserSession;