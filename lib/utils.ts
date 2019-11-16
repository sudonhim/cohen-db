import { DocumentFile } from '../schema';
import * as Ajv from 'ajv';
import * as fs from 'fs';
import slugify from 'slugify';

const schemas = fs.readdirSync('./schema')
    .map(name => require(`../schema/${name}`));
const ajv = new Ajv({schemas});
const validator = ajv.getSchema('document-file.json');

function LoadAndValidateOne(id: string): DocumentFile {
    const data = require(`../${id}.json`);
    const valid = validator(data);
    if (!valid) {
        console.log(`Failed to validate ${id}`);
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

    const loadChildren = (pid: string) => {
        for (var name of out[pid].children || []) {
            const cid = `${pid}/${name}`;
            out[cid] = LoadAndValidateOne(cid);
            loadChildren(cid);
        }
    }

    loadChildren('db');

    return out;
}

export function TitleToId(title: string): string {
    return slugify(title, { replacement: '_', lower: true });
}