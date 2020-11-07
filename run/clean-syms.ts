import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

async function run() {
    for (var docId in docDb) {
        const doc = docDb[docId];

        const mentionedByOthers: { [sym: string]: boolean } = {};
        for (var grp of doc.annotations || []) {
            for (var anno of grp.annotations) {
                for (var tok of anno.content) {
                    if (tok.kind === 'docref') {
                        if (anno.user !== 'symbols bot')
                            mentionedByOthers[tok.docRef] = true;
                    }
                }
            }
        }

        // Only allow one annotation of each symbol from the bot,
        // or none if a non-bot annotated it
        const visited: { [sym: string]: boolean } = {};
        for (var grp of doc.annotations || []) {
            grp.annotations = grp.annotations.filter(anno => {
                for (var tok of anno.content) {
                    if (tok.kind === 'docref') {
                        if (anno.user === 'symbols bot') {
                            if (visited[tok.docRef] || mentionedByOthers[tok.docRef]) {
                                console.log(`trimmed one annotation of ${tok.docRef} from ${docId}`);
                                return false;
                            } else {
                                visited[tok.docRef] = true;
                            }
                        }
                    }
                }

                return true;
            });
        }

        doc.annotations = (doc.annotations || []).filter(grp => grp.annotations.length > 0);
    }

    console.log(`Begin validate and save...`);
    ValidateAndSave(docDb);
    console.log(`Done.`);
}

run();