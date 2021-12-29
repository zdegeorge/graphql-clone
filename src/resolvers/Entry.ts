import { extractParentProp } from '../functions/extractParentProp';
import { Context } from '../services/Context/Context';

import User from '../models/User';

export const Entry:Resolvers.EntryResolvers<Context> = {
    async user(parent, args, context) {
		context.info('Resolvers: Entry: user');

        const _user = await extractParentProp(parent.user);
        const user_id = await extractParentProp(_user.id);

        const user: any = await User.query().findById(user_id);

        return user;
	}
}