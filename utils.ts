import { DocumentFile } from './schema';
import Ajv from 'ajv';
import fs from 'fs';

const schemas = fs.readdirSync('./schema')
    .map(name => require(`./schema/${name}`));
const ajv = new Ajv({schemas});
const validator = ajv.getSchema('document-file.json');

function LoadAndValidateOne(fullid: string): DocumentFile {
    const data = require(`./${fullid}.json`);
    const valid = validator(data);
    if (!valid) {
        console.log(`Failed to validate ${fullid}`);
        console.log(ajv.errorsText(validator.errors));
        throw 'Validation failure';
    }

    return data as DocumentFile;
}

// All the database documents in a dictionary
export interface DocDb {
    db: DocumentFile;
    [id: string]: DocumentFile;
}

export function LoadAndValidate(): DocDb {
    const out: DocDb = {
        db: LoadAndValidateOne('db')
    };

    return out;
}