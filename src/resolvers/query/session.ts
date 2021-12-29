import SessionModel from '../../models/Session';

export const session: QueryResolversWithContext['session'] = async (
    parent,
    args,
    context
) => {

    context.info('Resolvers: Query: session');

    const id = args.id;

    const session: any = await SessionModel.query().findById(id);

    return session;

}