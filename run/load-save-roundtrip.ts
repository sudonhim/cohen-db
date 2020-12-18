import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

for (const id in docDb) {
  const doc = docDb[id];
  docDb[id] = {
    user: doc.user,
    version: doc.version,
    title: doc.title,
    kind: doc.kind,
    annotations: doc.annotations
  };

  if (doc.metadata) docDb[id].metadata = doc.metadata;
  if (doc.children) docDb[id].children = doc.children;
  if (doc.newContent) docDb[id].content = doc.newContent;
}

ValidateAndSave(docDb);

console.log(`Validated and saved. If there are any changes, roundtrip is broken.`);
