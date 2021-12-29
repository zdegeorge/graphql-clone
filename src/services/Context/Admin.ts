import { debug } from './../logger';
import Admin from '../../models/User';
import {
	BadGuess,
	getHashedPasswordParamaters,
	checkAuthGuess
} from './../Authentication';

class AdminNotFound extends Error {
	constructor(userId: number) {
		super('AdminNotFound: ' + userId);
	}
}

interface Credentials {
	userId: number;
	password: string;
}

export const lookupAdmin = async ({
	userId,
	password
}: Credentials): Promise<Admin> => {
	debug('Admin: lookupAdmin');
	debug('Admin: lookupAdmin: userId: ' + userId);

	const admin: any = await Admin.query()
		.findById(userId)
		.withGraphFetched({ user: true });

	if (admin) {
		const hashParams = getHashedPasswordParamaters(admin.password);
		const isGuessCorrect = checkAuthGuess(password, hashParams);

		if (isGuessCorrect) {
			return admin;
		} else {
			throw new BadGuess();
		}
	} else {
		throw new AdminNotFound(userId);
	}
};
