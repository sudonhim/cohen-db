import * as fs from 'fs';
import * as stemmer from 'stemmer';

interface SymbolEntry {
    // How to display the word in UI
    title: string;

    // The stemmed version of the word and synonyms,
    // e.g. "darkness" -> "dark", "dim"
    stemmedVariants: string[];

    // Conceptually related, e.g. dark => night
    // these are in id form, and must exist in the SymbolsMap
    related: string[];
}

interface SymbolsMap {
    [id: string]: SymbolEntry
}

const symsFile = fs.readFileSync('./syms/wordgroups.txt', 'utf8');
const wordGroups = symsFile.split(/[\r\n]+/).map(grp =>
    grp.split(', '));
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

const symsMap: SymbolsMap = {};
for (var word in related) {
    const key = stemmer(word);
    symsMap[key] = {
        title: word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase(),
        related: related[word].map(w => stemmer(w)),
        stemmedVariants: [stemmer(word)]
    }
}


