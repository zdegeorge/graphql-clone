import express = require('express');
import { ConnectionEntity, HTTPConnectionInput, Loggers } from './types';
import {
	JWT,
	JWTInput,
	AdminJWT,
	VisitorJWT
} from './JWT';
import { Connection } from './Connection';

import { defined } from '../../functions/defined';
import { hostNameToSessionType } from '../../functions/hostNameToSessionType';
import {
	SECURE_COOKIES,
	COOKIE_DOMAIN,
	SESSION_VERSION,
	COOKIE_ENV_POSTFIX
} from '../../config';

const CookieSessionTypes = ['VISITOR', 'ADMIN'] as const;
type CookieSessionType = typeof CookieSessionTypes[number];

type ParsedCookieHeader<TSession extends CookieSessionType> = {
	graphqlCookie?: { type: TSession; token: string };
	managerCookie?: { type: 'ADMIN'; token: string };
};

const graphqlCookieRegex = new RegExp(
	`_sess_v${SESSION_VERSION}_(${CookieSessionTypes.join(
		'|'
	)})_${COOKIE_ENV_POSTFIX}`
);

export class HTTPConnection extends Connection {
	static parseCookie<TSession extends CookieSessionType>(
		{ info, debug }: Loggers,
		sessionType: TSession,
		cookieHeader?: string
	): ParsedCookieHeader<TSession> {
		info('HttpConnection: parseCookie');

		debug('HttpConnection: parseCookie: sessionType %s', sessionType);
		// debug('HttpConnection: parseCookie: cookieHeader %s', cookieHeader);

		const output: ParsedCookieHeader<TSession> = {};

		if (!cookieHeader) return output;

		const cookies = cookieHeader.split(';');

		// debug('HttpConnection: parseCookie: cookies %O', cookies);

		for (const cookie of cookies) {
			// debug('HttpConnection: parseCookie: cookie %O', cookie);

			const [key, value] = cookie.split('=');

			// debug('HttpConnection: parseCookie: key %s', key);
			// debug('HttpConnection: parseCookie: value %s', value);

			if (!defined(key) || !defined(value)) continue;

			const matchGraphqlKey = key.match(graphqlCookieRegex);

			const matchManagerKey = key.match(/managertoken/);

			if (defined(matchGraphqlKey)) {
				const [, type] = matchGraphqlKey;

				if (type === sessionType) {
					output.graphqlCookie = {
						type: type as TSession,
						token: value
					};
				}
			}

			if (defined(matchManagerKey)) {
				output.managerCookie = {
					type: 'ADMIN',
					token: value
				};
			}

			if (defined(output.graphqlCookie) && defined(output.managerCookie))
				break;
		}

		return output;
	}

	id: string;
	entity: ConnectionEntity;

	type: 'HTTP';

	req: express.Request;
	res: express.Response;

	constructor({ req, res }: HTTPConnectionInput) {
		const loggers = Connection.getLoggers(req.requestId, 'HTTP');
		loggers.info('HttpConnection: constructor');

		// loggers.debug(
		// 	'HttpConnection: constructor: req.headers %O',
		// 	req.headers
		// );

		let jwt: JWT;
		let entity: ConnectionEntity;

		const sessionType = hostNameToSessionType({ req }, loggers);

		entity = 'USER';

		if(sessionType === 'ADMIN') {

			let jwtInput: JWTInput<'ADMIN'> | undefined;
			const { graphqlCookie, managerCookie } =
				HTTPConnection.parseCookie(
					loggers,
					'ADMIN',
					req.headers.cookie
				);

			if (graphqlCookie) {
				jwtInput = JWT.verify(graphqlCookie.token, [
					graphqlCookie.type
				]);
			}

			if (managerCookie && !jwtInput?.authenticated) {
				jwtInput = JWT.verify(managerCookie.token, [
					managerCookie.type
				]);
			}

			jwt = new AdminJWT(jwtInput);
			
		} else {
			
			let jwtInput: JWTInput<'VISITOR'> | undefined;
			const { graphqlCookie } = HTTPConnection.parseCookie(
				loggers,
				'VISITOR',
				req.headers.cookie
			);

			if (graphqlCookie) {
				jwtInput = JWT.verify(graphqlCookie.token, [
					graphqlCookie.type
				]);
			}

			jwt = new VisitorJWT(jwtInput);

		} 

		super(jwt, loggers);
		loggers.debug('HttpConnection: constructor: jwt %O', this.jwt);
		this.entity = entity;
		this.type = 'HTTP';
		this.req = req;
		this.res = res;
		this.id = req['requestId'];
	}

	setCookieHeader(jwt: string): void {
		// generate session cookie header
		this.loggers.info('HttpConnection: setCookieHeader');

		const expiresDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		const sessionCookieHeader = `_sess_v${SESSION_VERSION}_${
			this.jwt.type
		}_${COOKIE_ENV_POSTFIX}=${jwt}; Expires=${expiresDate.toUTCString()}; SameSite=Lax;${
			SECURE_COOKIES ? ' Secure;' : ''
		} HttpOnly; Path=/; Domain=${COOKIE_DOMAIN}`;

		// set session cookie header
		this.res.set('Set-Cookie', sessionCookieHeader);
	}
}
