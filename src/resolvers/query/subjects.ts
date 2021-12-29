import SubjectModel from '../../models/Subject';

export const subjects: QueryResolversWithContext['subjects'] = async (
    parent,
    args,
    context
) => {

	context.info('Resolvers: Query: subjects');

    const subjects: any = await SubjectModel.query();

    return subjects;
}