import * as fs from 'fs';
import * as stemmer from 'stemmer';
import { CanonDb } from '..';
import { LoadAndValidate, ValidateAndSave } from '../lib/utils';

interface SymbolEntry {
    // How to display the word in UI
    title: string;

    // ID and filename, e.g. "symbol.darkness"
    id: string;

    // Conceptually related, e.g. dark => night
    // these are in id form, and must exist in the SymbolsMap
    related: string[];

    // The stemmed version of the word and synonyms,
    // e.g. "darkness" -> "dark", "dim"
    stems: string[];
}

interface SymbolsMap {
    [id: string]: SymbolEntry
}

// Build map of word => [related words]
const wordGroups = fs.readFileSync('./syms/wordgroups.txt', 'utf8')
    .split(/[\r\n]+/).map(grp => grp.split(', '));
const related: {[key: string]: string[]} = {};
for (var grp of wordGroups) {
    for (var word of grp) {
        for (var other of grp) {
            related[word] = [
                ...(related[word] || []),
                other
            ];
        }
    }
}
console.log(`Loaded ${wordGroups.length} word groups`);

// Load synonyms
const synsEntries = fs.readFileSync('./syms/synonyms.txt', 'utf8')
    .split(/[\r\n]+/).map(grp => grp.split(', '));
const synsLookup: {[key: string]: string[]} = {};
synsEntries.forEach(entry => {
    const [word, ...synonyms] = entry;
    synsLookup[word] = synonyms;
});
console.log(`Loaded synonyms for ${synsEntries.length} words`);

// Generate SymbolsMap to be used for search
const symsMap: SymbolsMap = {};
for (var word in related) {
    const key = stemmer(word);
    symsMap[key] = {
        title: word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase(),
        id: `symbol.${word.replace(' ', '_')}`,
        related: related[word].map(word => stemmer(word)),
        stems: [key, ...(synsLookup[word] || []).map(syn => stemmer(syn))]
    }
}
console.log('Generated symbols map');

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

// Generate documents for the symbols
for (var key in symsMap) {
    const entry = symsMap[key];
    if (!docDb[entry.id]) {
        docDb[entry.id] = {
            kind: 'symbol',
            title: entry.title
        };
    }

    const dbEntry = docDb[entry.id];

    for (var rel of entry.related) {
        if (!dbEntry.content) {
            dbEntry.content = {
                content: []
            };
        }

        const relId = symsMap[rel].id;
        if (Array.isArray(dbEntry.content.content)
            && !dbEntry.content.content.find(part => part.reference === relId)) {
            dbEntry.content.content.push({
                kind: 'note',
                reference: relId
            });
        }
    }
}

const symsRoot = docDb['group.symbols'];
if (Array.isArray(symsRoot.children) && symsRoot.children.length > 0) {
    for (var key in symsMap) {
        symsRoot.children.push(symsMap[key].id);
    }
    symsRoot.children.sort();
}

// Annotate all other documents with references to the symbols
console.log(`Searching ${Object.keys(docDb).length} documents for symbols...`)
for (var key in docDb) {
    const doc = docDb[key];
    if (doc.kind === 'symbol' || !doc.content) {
        continue;
    }
    const content = doc.content.content;
    var count = 0;

    const exploreLine = (ref: string, line: string) => {
        const words = line.toLocaleLowerCase()
            .replace(/[^\w\s]|_/g, '')
            .split(/\b/).map(word => stemmer(word));
        for (var key in symsMap) {
            const entry = symsMap[key];
            const symDocId = entry.id;
            if (entry.stems.find(stem => words.find(word => word === stem))) {
                doc.annotations = doc.annotations || [];
                if (!doc.annotations.find(anno =>
                    anno.anchor === ref && anno.tokens.some(tok =>
                        (tok.kind === 'docref' && tok.docRef === symDocId)))) {
                    doc.annotations.push({
                        anchor: ref,
                        tokens: [
                            { kind: 'docref', docRef: symDocId }
                        ]
                    })
                    count++;
                    // console.log(`Added annotation to line:\n\t${line}\n=> ${symDocId}`);
                }
            }
        }
    };
    const exploreParagraph = (prefix: string, paragraph: string | string[]) => {
        if (Array.isArray(paragraph)) {
            paragraph.forEach((line, li) => exploreLine(`${prefix}.l${li + 1}`, line));
        } else {
            exploreLine(prefix, paragraph);
        }
    };
    const exploreText = (prefix: string, text: (string | string[])[]) => {
        text.forEach((paragraph, pi) => exploreParagraph(`${prefix}p${pi + 1}`, paragraph));
    };
    if (Array.isArray(content)) {
        content.forEach((section, si) => exploreText(`s${si + 1}.`, section.content.text));
    } else {
        exploreText('', content.text);
    }

    if (count > 0)
        console.log(`Added ${count} annotations to ${doc.title}`)
}

console.log('Validating and saving changes');
ValidateAndSave(docDb);