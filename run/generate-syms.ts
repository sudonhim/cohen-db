import * as fs from 'fs';
import * as stemmer from 'stemmer';
import { CanonDb } from '..';
import { LoadAndValidate } from '../lib/utils';

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
        related: related[word],
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

// Annotate all other documents with references to the symbols
for (var key in docDb) {
    const doc = docDb[key];
    if (doc.kind === 'symbol' || !doc.content) {
        continue;
    }

    
}
