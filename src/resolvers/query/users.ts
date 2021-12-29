import UserModel from '../../models/User';

export const users: QueryResolversWithContext['users'] = async (
    parent,
    args,
    context
) => {

	context.info('Resolvers: Query: users');

    const users: any = await UserModel.query();

    return users;
}