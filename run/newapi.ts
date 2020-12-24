import { LoadAndValidate, TitleToId, ValidateAndSave } from "../lib/utils";
import { CanonDb } from "../index";
import { readFileSync } from "fs";
import { CanonFile, Content, Fragment, Metadata } from "../schema";

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

const newContent = [
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
    frags.push({
      id: `${id++}`,
      kind: 'text',
      speaker: line.speaker,
      tokens: [
        { kind: 'text', text: line.text }
      ]
    });
    if (line.speaker !== prevSpeaker) {
      frags.push({ kind: 'lineBreak' });
      frags.push({ kind: 'lineBreak' });
    }
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
  docDb[documentId] = newDoc;
  docDb['group.interviews'].children.push(documentId);
}

ValidateAndSave(docDb);

console.log(
  `Validated and saved. If there are any changes, roundtrip is broken.`
);
