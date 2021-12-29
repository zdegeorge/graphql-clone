import EntryModel from '../../models/Entry';

export const entry: QueryResolversWithContext['entry'] = async (
    parent,
    args,
    context
) => {

    context.info('Resolvers: Query: entry');

    const id = args.id;

    const entry: any = await EntryModel.query().findById(id);

    return entry;

}