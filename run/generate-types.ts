import { compileFromFile } from 'json-schema-to-typescript';
import { writeFileSync } from 'fs';

async function run() {
    const ts: string = await compileFromFile('./schema/canon-file.json', { cwd: './schema' });
    writeFileSync('./schema.d.ts', ts);
}

console.log("Generating new typescript definitions from schema/canon-file.json...");
run()
    .then( _ => console.log("..done"));