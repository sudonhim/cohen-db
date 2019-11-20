import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

ValidateAndSave(docDb);

console.log(`Validated and saved. If there are any changes, roundtrip is broken.`);
