import { CanonFile } from "../schema";
import { CanonDb } from "../index";
import * as Ajv from "ajv";
import * as fs from "fs";
import slugify from "slugify";

const schemas = fs
  .readdirSync("./schema")
  .filter(name => name !== 'new')
  .map(name => require(`../schema/${name}`));
const newSchemas = fs
  .readdirSync("./schema/new")
  .map(name => require(`../schema/new/${name}`));
const ajv = new Ajv({ schemas: [...schemas, ...newSchemas] });
const validator = ajv.getSchema("canon-file.json");

export function EnsureValid(doc: CanonFile) {
  const valid = validator(doc);
  if (!valid) {
    console.log(JSON.stringify(doc, null, 2));
    throw `Failed to validate ${doc.title}; ${ajv.errorsText(validator.errors)}`;
  }
}

function LoadAndValidateOne(path: string): CanonFile {
  const data = require(`${path}.json`);
  EnsureValid(data);

  return data as CanonFile;
}

export function LoadAndValidate(): CanonDb {
  const out: CanonDb = {
    db: LoadAndValidateOne("../db")
  };

  const loadRecursive = (path: string) => {
    const doc = LoadAndValidateOne(path);

    for (var id of doc.children || []) {
      const [kind, name] = id.split('.');
      out[id] = loadRecursive(`${path}/${name}`)
    }

    return doc;
  };

  loadRecursive("../db");

  return out;
}

export function TitleToId(title: string): string {
  return slugify(title, { replacement: "_", lower: true }).replace(/\W/g, '');
}

export function StringifyDoc(doc: CanonFile): string {
  return JSON.stringify(doc, null, 2);
}

export function DeleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        DeleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function ValidateAndSave(docDb: CanonDb) {

  const visited: string[] = [];
  const visitRecursive = (path: string, id: string) => {
    const doc = docDb[id];
    if (!doc) throw `Referenced document ${id} does not exist`;

    EnsureValid(doc);

    var [kind, name] = id.split('.');
    name = name || kind;
    const newPath = `${path}/${name}`;
    const docStr = StringifyDoc(doc);
    fs.writeFileSync(`${newPath}.json`, docStr);
    if (doc.children) {
      try {
        fs.mkdirSync(newPath);
      } catch {};
    }

    visited.push(id);

    for (var childId of doc.children || []) {
        visitRecursive(newPath, childId);
    }
  };

  visitRecursive('.', 'db');

  const unvisited = Object.keys(docDb).filter(key => !visited.includes(key));
  if (unvisited.length > 0)
    throw `The following documents don't exist in the hierarchy: ${unvisited.toString()}`;
}
