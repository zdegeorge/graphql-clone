import EntryModel from '../../models/Entry';

export const entries: QueryResolversWithContext['entries'] = async (
    parent,
    args,
    context
) => {

	context.info('Resolvers: Query: entries');

    const entries: any = await EntryModel.query();

    return entries;
}