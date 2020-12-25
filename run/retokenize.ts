import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';
import { Token } from '../schema';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

for (const documentId in docDb) {
  const doc = docDb[documentId];
  if (doc.content) {
    const fragments = doc.content.kind === 'simple'
      ? [doc.content.content.fragments]
      : doc.content.content.map(section => section.fragments);
    for (const fragList of fragments) for (const frag of fragList) {
      const newTokensList: Token[] = [];
      if (frag.kind === 'text') {
        for (const token of frag.tokens) {
          if (token.kind === 'text') {
            let text = '';
            let partNumber = 0;
            for (const part of token.text.split('[')) {
              if (partNumber++ === 0) {
                text = text + part;
              } else {
                if (part.indexOf(']')) {
                  if (text) {
                    newTokensList.push({
                      kind: 'text',
                      text
                    });
                  };
                  newTokensList.push({
                    kind: 'text',
                    text:  part.substr(0, part.indexOf(']')),
                    secondary: true
                  });
                  text = part.substr(part.indexOf(']') + 1);
                }
              }
            }
            if (text) {
              newTokensList.push({
                kind: 'text',
                text
              })
            }
          } else {
            newTokensList.push(token);
          }
        }
        frag.tokens = newTokensList;
      }
    }
  }
}

ValidateAndSave(docDb);

console.log(`Validated and saved. If there are any changes, roundtrip is broken.`);
