import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';
import { Reference } from '../schema';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

for (const id in docDb) {
    const doc = docDb[id];
    if (!doc.content) continue;
    for (const grp of doc.annotations) { 
        let ref: Reference;
        if (doc.content.kind === 'multipart') {
            const [sectionId, fragmentId] = grp.newAnchor.split(':');
            if (fragmentId) {
                ref = {
                    kind: 'fragment',
                    documentId: id,
                    sectionId,
                    fragmentId
                };
            } else {
                ref = {
                    kind: 'section',
                    documentId: id,
                    sectionId
                };
            }
        } else {
            ref = {
                kind: 'fragment',
                documentId: id,
                fragmentId: grp.newAnchor
            };
        }
        grp.anchor = ref;
        delete grp.newAnchor;
    }
}

ValidateAndSave(docDb);
console.log(`Validated and saved. If there are any changes, roundtrip is broken.`);
