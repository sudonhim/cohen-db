import axios from 'axios';
import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';
import { Annotation } from '../schema';

interface UpdatesBlob {
    [docId: string]: {
        canonRefs: string[],
        text: string,
    }[]
}

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

async function run() {
    const src = 'https://cohen-machine.herokuapp.com/api/updates';
    console.log(`Fetching updates from [${src}]...`);
    const data = await (await axios.get(src)).data as UpdatesBlob;
    console.log('Response received:');
    console.log(JSON.stringify(data, null, 2));

    for (var docId in data) {
        const newAnnotations: Annotation[] = data[docId].map(anno => ({
            anchor: anno.canonRefs[0],
            tokens: [ { text: anno.text } ]
        }));
        const allAnnotations = [...(docDb[docId].annotations || []), ...newAnnotations];
        allAnnotations.sort((a, b) => a.anchor.localeCompare(b.anchor));
        docDb[docId].annotations = allAnnotations;
    }

    console.log(`Begin validate and save...`);
    ValidateAndSave(docDb);
    console.log(`Done.`);
}

run();