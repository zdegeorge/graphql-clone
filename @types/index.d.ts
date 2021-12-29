import { GraphQLResolveInfo } from 'graphql';
import {
	Context,
	WSConnection,
	Connection,
	Session
} from '../src/services/Context';

declare module '*.json' {
	const value: unknown;
	export default value;
}

declare global {
	type QueryResolversWithContext<
		ConnectionType extends Connection = Connection,
		SessionType extends Session = Session
	> = Required<
		Resolvers.QueryResolvers<Context<ConnectionType, SessionType>>
	>;

	type MutationResolversWithContext<
		ConnectionType extends Connection = Connection,
		SessionType extends Session = Session
	> = Required<
		Resolvers.MutationResolvers<Context<ConnectionType, SessionType>>
	>;

	type SubscriptionResolversWithContext<
		K extends keyof Resolvers.Subscription,
		TPayload,
		TArgs,
		TResolve = Resolvers.SubscriptionResolveFn<
			Resolvers.Subscription[K],
			TPayload,
			Context<WSConnection, TSession>,
			TArgs
		>,
		TSession = Session
	> = {
		resolve: TResolve;
		subscribe: Resolvers.SubscriptionSubscribeFn<
			Resolvers.Subscription[K],
			TPayload,
			Context<WSConnection, TSession>,
			TArgs
		>;
	};

	type FilterFn<TPayload, TArgs, TSession = Session> = (
		payload: TPayload,
		args: TArgs,
		context: Context<WSConnection, TSession>,
		info: GraphQLResolveInfo
	) => boolean | Promise<boolean>;

	namespace Express {
		interface Request {
			context?: Context<HTTPConnection>;
			requestId?: string;
		}

		interface Response {
			requestId?: string;
		}
	}
}
