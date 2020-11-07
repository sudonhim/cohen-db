import axios from 'axios';
import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';
import { CanonFile } from '../schema';

interface IUpdate {
    docId: string;
    file: CanonFile;
}

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

async function run() {
    const src = 'https://leonardcohennotes.com/api/updates';
    console.log(`Fetching updates from [${src}]...`);
    const updates = await (await axios.get(src)).data as IUpdate[];
    console.log(`Recieved ${updates.length} updated documents`);

    for (var update of updates) {
        console.log(`Updating ${update.docId}...`);
        docDb[update.docId] = update.file;
    }

    console.log(`Begin validate and save...`);
    ValidateAndSave(docDb);
    console.log(`Done.`);
}

run();