import express = require('express');
import { IncomingMessage } from 'http';

import { Loggers, SessionType } from '../services/Context/types';

export const hostNameToSessionType = (
	{
		req,
		incomingMessage
	}: {
		req?: express.Request;
		incomingMessage?: IncomingMessage;
	},
	loggers: Loggers
): SessionType => {
	loggers.info('hostNameToSessionType');

	const hosts: string[] = [];

	const rawHosts = [
		req?.headers['x-forwarded-host'],
		req?.headers.host,
		req?.headers.origin,
		incomingMessage?.headers['x-forwarded-host'],
		incomingMessage?.headers.host,
		incomingMessage?.headers.origin,
		''
	];

	for (const rawHost of rawHosts) {
		if (rawHost) {
			if (Array.isArray(rawHost)) {
				for (const host of rawHost) {
					hosts.push(host);
				}
			} else {
				hosts.push(rawHost);
			}
		}
	}

	loggers.debug('hostNameToSessionType: hosts %O', hosts);

	return 'VISITOR';
};
