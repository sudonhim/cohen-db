import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

for (const id in docDb) {
  const doc = docDb[id];
  if (doc.content) {
    doc.content = {
      kind: doc.content.kind,
      content: doc.content.content || doc.content.sectionalContent
    }
  }
}

ValidateAndSave(docDb);

console.log(`Validated and saved. If there are any changes, roundtrip is broken.`);
