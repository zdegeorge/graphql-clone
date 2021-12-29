import { PartialModelObject } from 'objection';
import Entry from '../../models/Entry';

export const createEntry: MutationResolversWithContext['createEntry'] = async (
	parent,
	args,
	context
) => {
	context.info('Resolvers: Mutation: createEntry');

    const _entry: PartialModelObject<Entry> = {
        name: args.name,
        user_id: args.userId,
        content: args.content ? args.content : 'Put here for fobery.'
    };

    const entry: any = await Entry.query()
        .insert(_entry);

    return entry;
}