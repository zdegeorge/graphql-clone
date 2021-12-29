import SessionModel from '../../models/Session';

export const sessions: QueryResolversWithContext['sessions'] = async (
    parent,
    args,
    context
) => {

	context.info('Resolvers: Query: sessions');

    const sessions: any = await SessionModel.query();

    return sessions;
}