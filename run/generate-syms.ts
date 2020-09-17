import * as fs from 'fs';
import * as stemmer from 'stemmer';

import { SymbolsMap } from '../syms';

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


