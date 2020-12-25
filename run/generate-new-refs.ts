import { LoadAndValidate, ValidateAndSave } from "../lib/utils";
import { CanonDb } from "../index";
import { Reference } from "../schema";

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);


function DeserializeDocRef(ref: string): Reference {
  // If there is anything after (.e.g /notes) ignore
  ref = ref.split("/")[0];

  const [documentId, rest] = ref.split("#");
  if (!rest) return { kind: "document", documentId };
  if (!rest.includes(":"))
    return { kind: "fragment", documentId, fragmentId: rest };
  const [sectionId, fragmentId] = rest.split(":");
  if (!fragmentId) return { kind: "section", documentId, sectionId };
  else return { kind: "fragment", documentId, sectionId, fragmentId };
}

for (const id in docDb) {
  const doc = docDb[id];
  for (const annotationGroup of doc.annotations) {
    annotationGroup.annotations = annotationGroup.annotations.map(anno => ({
      id: anno.id,
      user: anno.user,
      tokens: anno.tokens,
    }));
  }
}

ValidateAndSave(docDb);
console.log(
  `Validated and saved. If there are any changes, roundtrip is broken.`
);
