import {
	ColumnNameMappers,
	Model,
	RelationMappings,
	snakeCaseMappers
} from 'objection';

import BaseModel, { Db } from './_BaseModel';
import User from './User';

class Entry extends BaseModel implements Resolvers.Entry {

  id!: string;
  user!: User;
  user_id!;
  name!: string;
  content?: string;
  created_at?: string;

  static trainingDb: Db = 'prod';
  
  // Table name is the only required property.
  static get tableName() {
    return 'entries';
  }

  static get columnNameMappers(): ColumnNameMappers {
		return snakeCaseMappers();
	}

  static get relationMappings(): RelationMappings {
		return {
			user: {
				relation: Model.HasOneRelation,
				modelClass: User,
				join: {
					from: 'entries.user_id',
					to: 'users.id'
				}
			}
		};
	}

}

export default Entry;