import { LoadAndValidate } from '../lib/utils';
import { CanonDb } from '../index';

const docDb: CanonDb = LoadAndValidate();

console.log(`Validation completed for ${Object.keys(docDb).length} documents`);
