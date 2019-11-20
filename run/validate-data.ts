import { LoadAndValidate } from '../lib/utils';
import { DocDb } from '../index';

const docDb: DocDb = LoadAndValidate();

console.log(`Validation completed for ${Object.keys(docDb).length} documents`);
