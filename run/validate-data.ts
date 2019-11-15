import { DocDb, LoadAndValidate } from '../lib/utils';

const docDb = LoadAndValidate();

console.log(`Validation completed for ${Object.keys(docDb).length} documents`);
