import { LoadAndValidate, ValidateAndSave } from "../lib/utils";
import { CanonDb } from "../index";
import { Reference } from "../schema";

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

for (const id in docDb) {
  const doc = docDb[id];
  if (!doc.content) continue;
  if (doc.content.kind === "multipart") {
    for (const grp of doc.annotations) {
        if (grp.anchor.kind === 'section' || grp.anchor.kind === 'fragment') {
            if (!grp.anchor.sectionId) throw 'Expected section id for ' + id;
            const si = parseInt(grp.anchor.sectionId);
            grp.anchor.sectionId = doc.content.content[si - 1].id;
        }
    }
  }
}

ValidateAndSave(docDb);
console.log(
  `Validated and saved. If there are any changes, roundtrip is broken.`
);
