import * as fs from 'fs';
import * as stemmer from 'stemmer';

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

// Load synonyms
const synsEntries = fs.readFileSync('./syms/synonyms.txt', 'utf8')
    .split(/[\r\n]+/).map(grp => grp.split(', '));
const synsLookup: {[key: string]: string[]} = {};
synsEntries.forEach(entry => {
    const [word, ...synonyms] = entry;
    synsLookup[word] = synonyms;
});

// Generate SymbolsMap to be used for search
const symsMap: SymbolsMap = {};
for (var word in related) {
    const key = stemmer(word);
    symsMap[key] = {
        title: word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase(),
        id: `symbol.${word.replace(' ', '_')}`,
        related: related[word],
        stems: [stemmer(word), ...(synsLookup[word] || []).map(syn => stemmer(syn))]
    }
}




