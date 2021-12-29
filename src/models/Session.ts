import {
	ColumnNameMappers,
	Model,
	RelationMappings,
	snakeCaseMappers
} from 'objection';

import BaseModel, { Db } from './_BaseModel';

import User from './User';

class Session extends BaseModel implements Resolvers.Session {

	id!: string;
	type!: Schema.SessionType;
	authenticated!: boolean;
    admin!: boolean;
	userId?: number;

	created_at!: Date;

	static trainingDb: Db = 'prod';

	static get columnNameMappers(): ColumnNameMappers {
		return snakeCaseMappers();
	}

	static get tableName(): string {
		return 'sessions';
	}

	static get idColumn(): string {
		return 'id';
	}

	static get relationMappings(): RelationMappings {
		return { };
	}
}

export default Session;
