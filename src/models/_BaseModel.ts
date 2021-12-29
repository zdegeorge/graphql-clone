import { Knex } from 'knex';
import {
	Constructor,
	Model,
	Pojo,
	QueryBuilder,
	QueryBuilderType,
	RelationProperty,
	SingleQueryBuilder,
	TransactionOrKnex
} from 'objection';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { prodDb, stagingDb } from '../db-connect';
import { NODE_ENV } from '../config';

export interface RelationMappings {
	[x: string]: boolean | RelationMappings;
}

export type Db = 'prod' | 'staging';

abstract class BaseModel extends Model {
	abstract id: number | string | undefined;

	static ZERO_DATE: Date = new Date('1970-01-01 00:00:00.0000');
	static trainingDb?: Db;
	static defaultDb?: Db;

	$parseDatabaseJson(json: Pojo): Pojo {
		json = super.$parseDatabaseJson(json);

		const keys = Object.keys(json);

		for (const key of keys) {
			json[key.charAt(0).toLowerCase() + key.substr(1, key.length)] =
				json[key];

			if (
				typeof Object.getPrototypeOf(this).constructor.idColumn ===
					'string' &&
				key.toLowerCase() ===
					Object.getPrototypeOf(
						this
					).constructor.idColumn.toLowerCase() &&
				!Object.prototype.hasOwnProperty.call(json, 'id')
			) {
				json.id = json[key];
			}
		}

		return json;
	}

	static get modelPaths(): [string] {
		return [__dirname];
	}

	static trainingKnex(): Knex | undefined {
		switch (this.defaultDb) {
			case 'prod':
				return prodDb;
			case 'staging':
				return stagingDb;
			default:
				return undefined;
		}
	}

	static query<M extends { QueryBuilderType: QueryBuilder<Model, Model[]> }>(
		this: Constructor<M & Model>,
		trxOrKnex?: TransactionOrKnex
	): QueryBuilderType<M> {
		if (NODE_ENV === 'test') {
			return super.query.call(this, trxOrKnex);
		}

		const knex =
			trxOrKnex ?? (this as unknown as typeof BaseModel).trainingKnex();

		return super.query.call(this, knex);
	}

	$query(
		trxOrKnex?: TransactionOrKnex
	): SingleQueryBuilder<QueryBuilderType<this>> {
		if (NODE_ENV === 'test') {
			return super.$query(trxOrKnex);
		}

		const knex = trxOrKnex ?? BaseModel.trainingKnex();

		return super.$query(knex);
	}

	static filterQueryToRelationMappings(
		info?: GraphQLResolveInfo
	): RelationMappings {
		if (!info) {
			return {};
		}

		const query = graphqlFields(info);

		return this.extractRelationMappingsFromFields(query);
	}

	static extractRelationMappingsFromFields(
		query: ReturnType<typeof graphqlFields>
	): RelationMappings {
		const models: { [x: string]: string[] } = { Foo: ['id'] };

		const recursiveRelationKeys = recursivelyExtractRelationMappings(
			{
				modelClass: {
					name: this.name,
					relationMappings: this.relationMappings
				} as typeof Model
			},
			new Set<string>()
		);

		type RelationKey = {
			model: string;
			relation: string;
		};

		const relationKeys: RelationKey[] = [];

		for (const key of recursiveRelationKeys) {
			const [modelName, relation] = key.split('.');

			if (
				!relationKeys.some(
					relationKey => relationKey.relation === relation
				)
			) {
				relationKeys.push({
					model: modelName,
					relation
				});
			}
		}

		const graph = filterObjectToObjectsByKeys(
			this.name,
			relationKeys,
			query
		);

		return graph;

		function recursivelyExtractRelationMappings(
			relation: Partial<RelationProperty>,
			set: Set<string>
		): string[] {
			if (relation.modelClass?.relationMappings) {
				const output: string[][] = [];

				models[relation.modelClass.name] = Object.keys(
					relation.modelClass.relationMappings
				);

				for (const [key, value] of Object.entries(
					relation.modelClass.relationMappings
				)) {
					const namespacedKey = `${value.modelClass.name}.${key}`;

					output.push([namespacedKey]);

					if (value.modelClass.relationMappings) {
						models[value.modelClass.name] = Object.keys(
							value.modelClass.relationMappings
						);
					} else {
						models[value.modelClass.name] = [];
					}

					if (!set.has(namespacedKey)) {
						set.add(namespacedKey);

						output.push(
							recursivelyExtractRelationMappings(value, set)
						);
					}
				}

				return output.flat(3);
			} else {
				return [];
			}
		}

		function filterObjectToObjectsByKeys(
			onModelName: string,
			keys: RelationKey[],
			obj: ReturnType<typeof graphqlFields>
		): RelationMappings {
			const output: RelationMappings = {};

			for (const [key, value] of Object.entries(obj)) {
				if (
					typeof value === 'object' &&
					models[onModelName]?.includes(key)
				) {
					const relationKey = keys.find(
						relationKey => relationKey.relation === key
					);

					if (relationKey) {
						const filteredObject = filterObjectToObjectsByKeys(
							relationKey.model,
							keys,
							value
						);

						if (Object.keys(filteredObject).length > 0) {
							output[key] = filteredObject;
						} else {
							output[key] = true;
						}
					}
				}
			}

			return output;
		}
	}
}

export default BaseModel;
