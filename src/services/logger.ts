import Debug from 'debug';
import { GraphQLError } from 'graphql';

import {
	DEBUG,
	PRODUCTION,
	NODE_ENV
} from '.././config';

if (NODE_ENV === 'test' && DEBUG === undefined) {
	console.warn(
		"PLEASE CHECK YOUR .env FILE. The 'DEBUG' environment variable is currently set to an empty string, which means that nothing is being logged. If this is intentional, you can ignore this message."
	);
}

const overrideDebugNamespace = (namespace: string): Debug.Debugger => {
	const debugNamespace_ = Debug(namespace);

	debugNamespace_.log = (...args: unknown[]) => {
		console.log(...args);
	};

	return debugNamespace_;
};

const createLogger = (name: string): Debug.Debugger => {
	const extendable = (logger_: Debug.Debugger): Debug.Debugger => {
		logger_.extend = (extendedName: string): Debug.Debugger =>
			extendable(overrideDebugNamespace(name + ' ' + extendedName));

		return logger_;
	};

	const _logger = overrideDebugNamespace(name);

	return extendable(_logger);
};

if (PRODUCTION) {
	Debug.formatters.O = (O: unknown): string => JSON.stringify(O);

	Debug.formatters.E = (E: GraphQLError | Error): string =>
		`\t${E?.message}\t${JSON.stringify(E ?? null)}`;
} else {
	Debug.formatters.E = (E: GraphQLError | Error): string => {
		return `${E?.message}\n${JSON.stringify(E ?? null)}`;
	};
}

export const debug = createLogger('APP::DEBUG');
export const log = createLogger('APP::LOG');
export const error = createLogger('APP::ERROR');
export const warn = createLogger('APP::WARN');
export const info = createLogger('APP::INFO');
export const http = createLogger('APP::HTTP');
