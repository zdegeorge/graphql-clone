import pbkdf2 from 'pbkdf2';
import { AuthenticationError } from 'apollo-server';

// TODO: get hash settings from env
const PW_HASH_KEY_LENGTH = 32;
const PW_HASH_SALT_LENGTH = 12;
const PW_HASH_ITERATIONS = 15000;
const PW_HASH_DIGEST = 'sha256';

export class BadGuess extends AuthenticationError {
	constructor() {
		super('BadGuess');
	}
}

export interface PBKDF2Params {
	digest: string;
	iterations: number;
	salt: string;
	key: string;
}

export const getHashedPasswordParamaters = (
	hashedPassword: string
): PBKDF2Params => {
	const match = hashedPassword.match(/^pbkdf2_(.+?)\$(\d+?)\$(.+?)\$(.+?)$/);

	if (match === null) {
		throw new Error('Could not get paramaters for hashed passsword');
	}

	const [, digest, iterationsString, salt, key] = match;

	const iterations = Number(iterationsString);

	if (isNaN(iterations)) {
		throw new Error(
			'Hashed password has non-numeric value for iterations.'
		);
	}

	return {
		digest,
		iterations,
		salt,
		key
	};
};

const randomString = (
	length: number,
	chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string => {
	let output = '';

	for (let i = 0; i < length; ++i)
		output += chars[Math.floor(Math.random() * chars.length)];

	return output;
};

export const hashPassword = (password: string): string => {
	const salt = randomString(PW_HASH_SALT_LENGTH);

	const key = pbkdf2
		.pbkdf2Sync(
			password,
			Buffer.from(salt),
			PW_HASH_ITERATIONS,
			PW_HASH_KEY_LENGTH,
			PW_HASH_DIGEST
		)
		.toString('base64');

	return `pbkdf2_${PW_HASH_DIGEST}$${PW_HASH_ITERATIONS}$${salt}$${key}`;
};

export const checkAuthGuess = (
	guess: string,
	{ digest, iterations, salt, key }: PBKDF2Params
): boolean => {
	const hash = pbkdf2
		.pbkdf2Sync(
			guess,
			Buffer.from(salt),
			iterations,
			Buffer.byteLength(key, 'base64'),
			digest
		)
		.toString('base64');

	return hash === key;
};
