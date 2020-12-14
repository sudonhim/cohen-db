import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';
import { CanonFile } from '../schema';
import axios from 'axios';

interface IUpdate {
    file: CanonFile;
    action: {
        kind: string;
        documentId: string;
    };
}

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

async function run() {
    const src = 'https://leonardcohennotes.com/api/updates';
    console.log(`Fetching updates from [${src}]...`);
    const updates = await (await axios.get(src)).data as IUpdate[];
    console.log(`Recieved ${updates.length} updated documents`);

    for (var update of updates) {
        const v1 = docDb[update.action.documentId].version;
        const v2 = update.file.version;
        console.log(`Updating ${update.action.kind} to ${update.action.documentId}...`);
        console.log(`Version: ${v1} -> ${v2}`);
        if (v1 >= v2) {
            console.log(`Update version not newer, skipping...`);
            continue;
        }

        docDb[update.action.documentId] = update.file;
        console.log('...updated.');
    }

    console.log(`Begin validate and save...`);
    ValidateAndSave(docDb);
    console.log(`Done.`);
}

run();