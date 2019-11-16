import { DocDb, LoadAndValidate } from '../lib/utils';

const docDb: DocDb = LoadAndValidate();

console.log(`Validation completed for ${Object.keys(docDb).length} documents`);
