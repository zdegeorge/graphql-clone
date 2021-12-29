import SubjectModel from '../../models/Subject';

export const subject: QueryResolversWithContext['subject'] = async (
    parent,
    args,
    context
) => {

    context.info('Resolvers: Query: subject');

    const id = args.id;

    const subject: any = await SubjectModel.query().findById(id);

    return subject;

}