import UserModel from '../../models/User';

export const user: QueryResolversWithContext['user'] = async (
    parent,
    args,
    context
) => {

    context.info('Resolvers: Query: user');

    const id = args.id;

    const user: any = await UserModel.query().findById(id);

    return user;

}