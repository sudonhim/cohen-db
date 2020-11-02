import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

async function run() {
    for (var docId in docDb) {
        const doc = docDb[docId];
        const curAnnos = (doc.annotations || []);
        curAnnos.forEach(anno => {
            if (anno.tokens.length === 1 && anno.tokens[0].kind === 'docref' && anno.tokens[0].docRef.startsWith('sym'))
                anno.user = 'symbols bot'
        });
    }

    console.log(`Begin validate and save...`);
    ValidateAndSave(docDb);
    console.log(`Done.`);
}

run();