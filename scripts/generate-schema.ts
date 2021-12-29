import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';

const schemaFolderPath = resolve(__dirname, '..', 'src', 'schema');
const schemaOutputPath = resolve(__dirname, '..', 'generated-schema.graphql');
const warningFilePath = resolve(__dirname, '..', 'build', 'warning.txt');

const typesArray = loadFilesSync(schemaFolderPath, {
	recursive: true,
	extensions: ['graphql']
});

const typeDefs = mergeTypeDefs([...typesArray, ...scalarTypeDefs], {
	throwOnConflict: true
});

const schema = print(typeDefs);

const warning = readFileSync(warningFilePath, 'utf8');

writeFileSync(schemaOutputPath, warning + schema, 'utf8');
