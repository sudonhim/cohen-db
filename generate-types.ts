import { compileFromFile } from 'json-schema-to-typescript';
import { writeFileSync } from 'fs';

async function run() {
    const ts: string = await compileFromFile('./schema/document.json', { cwd: './schema' });
    writeFileSync('./generated/document.d.ts', ts);
}

console.log("Generating new typescript definitions from schema/document.json...");
run();
console.log("..done");