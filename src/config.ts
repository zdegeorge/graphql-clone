const defined = <T>(t: T): t is Exclude<T, undefined | null> =>
	t !== undefined && t !== null;

const trueVals = ['true', '1'];
const falseVals = ['false', '0'];

const env = (name: string): string | undefined => {
	const raw = process.env[name];

	return raw;
};

const boolEnv = (name: string, fallback?: boolean): boolean => {
	const raw = env(name);

	if (!defined(raw)) {
		return false;
	}

	const normalizedEnv = raw.toLowerCase();

	if (trueVals.some(val => val === normalizedEnv)) {
		return true;
	}

	if (falseVals.some(val => val === normalizedEnv)) {
		return false;
	}

	if (fallback !== undefined) {
		return fallback;
	}

	throw new Error('Expected boolean value for env var: ' + name + '.');
};

const requireEnv = (name: string, fallback?: string): string => {
	const raw = env(name);

	if (defined(raw) && raw !== '') {
		return raw;
	}

	if (fallback === undefined) {
		throw new Error('Missing required env var: ' + name + '.');
	}

	return fallback;
};

const numberEnv = (name: string, fallback?: number): number => {
	const raw = env(name);
	const num = Number(raw);

	if (!isNaN(num)) {
		return num;
	}

	if (fallback === undefined) {
		throw new Error(
			'Received ' + raw + ' for ' + name + ' but expected number.'
		);
	}

	return fallback;
};

export const NODE_ENV = requireEnv('NODE_ENV', 'production').toLowerCase();
export const ENVIRONMENT = requireEnv('ENVIRONMENT', 'development');
export const DEBUG = boolEnv('DEBUG', true);
export const PRODUCTION = boolEnv('PRODUCTION', true);

export const APP_URL = requireEnv('APP_URL');

export const DB_USER = requireEnv('DB_USER');
export const DB_PASSWORD = requireEnv('DB_PASSWORD');
export const DB_HOST = requireEnv('DB_HOST', '127.0.0.1');
export const DB_PORT = numberEnv('DB_PORT', 3306);
export const DB_DATABASE = requireEnv('DB_DATABASE', 'ziggy');
export const DB_DATABASE_STAGING = requireEnv('DB_DATABASE_STAGING', 'ziggy_staging');

export const SESSION_SECRET = requireEnv('SESSION_SECRET', 'SuperSecretStringOfWords!');
export const DEBUG_CACHE = boolEnv('DEBUG_CACHE',false);

export const COOKIE_ENV_POSTFIX = requireEnv('COOKIE_ENV_PREFIX', 'dev');
export const SESSION_VERSION = numberEnv('SESSION_VERSION', 1);
export const COOKIE_DOMAIN = requireEnv('COOKIE_DOMAIN', '');
export const SECURE_COOKIES = boolEnv('SECURE_COOKIES', true);

