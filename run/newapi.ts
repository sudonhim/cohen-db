import { LoadAndValidate, ValidateAndSave } from "../lib/utils";
import { CanonDb } from "../index";
import { Fragment, SectionalContent, Text, TextFragment } from "../schema";

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

for (const documentId in docDb) {
  const doc = docDb[documentId];
  if (!doc.content) continue;

  const textToFrags = (t: Text): Fragment[] => {
    if (!t) return [];
    let i = 1;
    const out: Fragment[] = [];
    for (const p of t.text) {
      if (Array.isArray(p)) {
        for (const l of p) {
          const frag: Fragment = {
            kind: "text",
            id: `${i++}`,
            tokens: [{ kind: "text", text: l }],
          };
          out.push(frag);
          out.push({ kind: "lineBreak" });
        }
        out.push({ kind: "lineBreak" });
      } else {
        const frag: Fragment = {
          kind: "text",
          id: `${i++}`,
          tokens: [{ kind: "text", text: p }],
        };
        out.push(frag);
        out.push({ kind: "lineBreak" });
        out.push({ kind: "lineBreak" });
      }
    }
    return out;
  };

  if (Array.isArray(doc.content.content)) {
    const sections: SectionalContent[] = [];
    for (const section of doc.content.content) {
      if (!section.reference)
        throw new Error("Expected every section to have a reference");
      let title: TextFragment;
      let id: string;
      const refstr = section.reference.split('.')[1]
      switch (section.kind) {
        case "note":
          id = `on_${refstr}`;
          title = {
            kind: "text",
            tokens: [
              { kind: "text", text: "On " },
              {
                kind: "reference",
                reference: { kind: "document", documentId: section.reference },
              },
            ],
          };
          break;
        case "prologue":
          id = `prologue_to_${refstr}`;
          title = {
            kind: "text",
            tokens: [
              { kind: "text", text: "Prologue to " },
              {
                kind: "reference",
                reference: { kind: "document", documentId: section.reference },
              },
            ],
          };
          break;
        case "variation":
          id = `variation_on_${refstr}`;
          title = {
            kind: "text",
            tokens: [
              { kind: "text", text: "Variation on " },
              {
                kind: "reference",
                reference: { kind: "document", documentId: section.reference },
              },
            ],
          };
          break;
      }
      const fragments = textToFrags(section.content);
      sections.push({
        id,
        title,
        fragments,
      });
    }
    if (sections.length > 0) {
      doc.newContent = { sectionalContent: sections };
    }
  } else {
    const fragments = textToFrags(doc.content.content);
    doc.newContent = {
      content: {
        fragments,
      },
    };
  }
}

ValidateAndSave(docDb);

console.log(
  `Validated and saved. If there are any changes, roundtrip is broken.`
);
