import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';

const schemaFolderPath = path.join(__dirname, './schema');

const typesArray = loadFilesSync(schemaFolderPath, {
	recursive: true,
	extensions: ['graphql']
});

const typeDefs = mergeTypeDefs(typesArray, {
	throwOnConflict: true
});

export const schema = print(typeDefs);

export default typeDefs;
