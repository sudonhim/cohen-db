import { LoadAndValidate, TitleToId, ValidateAndSave } from "../lib/utils";
import { CanonDb } from "../index";
import { readFileSync } from "fs";
import { CanonFile, Content, Fragment, Metadata } from "../schema";

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

// remove the 'speaker' property of text fragments
// instead just use a fragment with inactive text
for (const documentId in docDb) {
  const doc = docDb[documentId];
  if (doc.content && doc.content.kind === 'simple') {
    const newFragments: Fragment[] = [];
    const prevFrag: Fragment = null;
    for (const frag of doc.content.content.fragments) {
      if (frag.kind === 'text') {
        if (frag.speaker && (!prevFrag || prevFrag.kind !== 'text' || prevFrag.speaker !== frag.speaker)) {
          newFragments.push({
            kind: 'text',
            tokens: [
              { kind: 'text', secondary: true, text: frag.speaker + ':' }
            ]
          })
        }

        const modFrag: Fragment = {
          kind: 'text',
          id: frag.id,
          tokens: frag.tokens
        };
        newFragments.push(modFrag);

      } else { newFragments.push(frag); }
    }

    doc.content.content.fragments = newFragments;
  }
}

// old code for text format
/* const newContent = [
  './data/1984ckuainterview.txt',
  //'./data/2016youwantitdarker.txt',
  //'./data/2017lastinterview.txt'
].map(fname => readFileSync(fname).toString());

for (const data of newContent) {
  const [
    titleLine,
    dateLine,
    sourceLine,
    kindLine,
    _,
    ...contentLines
  ] = data.split('\n').map(line => line.trim());
  const title = titleLine.split(': <')[1].split('>')[0];
  const date = dateLine.split(': <')[1].split('>')[0];
  const source = sourceLine.split(': <')[1].split('>')[0];
  console.log(`Processing '${title}'`);
  console.log(`Date: ${date}`);
  console.log(`Source: ${source}`);
  console.log(`Kind: ${kindLine.split(': <')[1].split('>')[0]}`);
  console.log(`+ ${contentLines.length} lines of content`);
  const lines = contentLines.map(line => {
    let [speaker, text] = line.split('>: <');
    speaker = speaker.substr(1);
    text = text.substr(0, text.length - 1);
    return {
      speaker,
      text
    };
  });
  let prevSpeaker = '';
  let id = 1;
  let frags: Fragment[] = [];
  for (var line of lines) {
    if (line.speaker !== prevSpeaker && prevSpeaker) {
      frags.push({ kind: 'lineBreak' });
      frags.push({ kind: 'lineBreak' });
    }
    frags.push({
      id: `${id++}`,
      kind: 'text',
      speaker: line.speaker,
      tokens: [
        { kind: 'text', text: line.text }
      ]
    });
    prevSpeaker = line.speaker;
  }

  const newContent: Content = {
    kind: 'simple',
    content: {
      fragments: frags
    }
  };

  const newMetadata: Metadata = {
    date: date,
    source: source
  }

  const newDoc: CanonFile = {
    title: title,
    kind: 'interview',
    version: 0,
    user: 'sudonhim',
    metadata: newMetadata,
    content: newContent,
    annotations: []
  };

  const documentId = TitleToId(newDoc.title);
  const fullId = 'interview.' + documentId;
  docDb[fullId] = newDoc;
  // docDb['group.interviews'].children.push('interview.' + documentId);
} */

ValidateAndSave(docDb);

console.log(
  `Validated and saved. If there are any changes, roundtrip is broken.`
);
