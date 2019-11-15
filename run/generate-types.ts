import { compileFromFile } from 'json-schema-to-typescript';
import { writeFileSync } from 'fs';

async function run() {
    const ts: string = await compileFromFile('./schema/document-file.json', { cwd: './schema' });
    writeFileSync('./schema.d.ts', ts);
}

console.log("Generating new typescript definitions from schema/document-file.json...");
run()
    .then( _ => console.log("..done"));