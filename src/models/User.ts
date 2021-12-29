import {
	ColumnNameMappers,
	Model,
	RelationMappings,
	snakeCaseMappers
} from 'objection';

import BaseModel, { Db } from './_BaseModel';

class User extends BaseModel implements Resolvers.User {

  id!: string;
  username!: string;
  password?: string;
  admin!: boolean;
  imageUrl?: string;
  createdAt?: string;

  static trainingDb: Db = 'prod';

  // Table name is the only required property.
  static get tableName() {
    return 'users';
  }

  static get columnNameMappers(): ColumnNameMappers {
		return snakeCaseMappers();
	}

  static get relationMappings(): RelationMappings {
		return { };
	}
}

export default User;