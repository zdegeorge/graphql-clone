import {
	ColumnNameMappers,
	Model,
	RelationMappings,
	snakeCaseMappers
} from 'objection';

import BaseModel, { Db } from './_BaseModel';

class Subject extends BaseModel implements Resolvers.Subject {

  id!: string;
  name!: string;
  extension?: string;
  created_at?: string;

  static trainingDb: Db = 'prod';

  // Table name is the only required property.
  static get tableName() {
    return 'subjects';
  }

  static get columnNameMappers(): ColumnNameMappers {
		return snakeCaseMappers();
	}

  static get relationMappings(): RelationMappings {
		return { };
  }
}

export default Subject;