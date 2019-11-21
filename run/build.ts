import { LoadAndValidate, DeleteFolderRecursive } from '../lib/utils';
import { CanonDb } from '../index';
import { writeFileSync, mkdirSync } from 'fs';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

DeleteFolderRecursive('./build');
mkdirSync('./build');

writeFileSync('./build/dist.json', JSON.stringify(docDb, null, 2));

console.log("written out to ./build/dist.json");
