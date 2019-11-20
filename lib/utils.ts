import { CanonFile } from "../schema";
import { CanonDb } from "../index";
import * as Ajv from "ajv";
import * as fs from "fs";
import slugify from "slugify";

const schemas = fs
  .readdirSync("./schema")
  .map(name => require(`../schema/${name}`));
const ajv = new Ajv({ schemas });
const validator = ajv.getSchema("canon-file.json");

export function EnsureValid(doc: CanonFile) {
  const valid = validator(doc);
  if (!valid)
    throw `Failed to validate ${doc.title}; ${ajv.errorsText(validator.errors)}`;
}

function LoadAndValidateOne(id: string): CanonFile {
  const data = require(`../${id}.json`);
  EnsureValid(data);

  return data as CanonFile;
}

export function LoadAndValidate(): CanonDb {
  const out: CanonDb = {
    db: LoadAndValidateOne("db")
  };

  const loadChildren = (pid: string) => {
    for (var name of out[pid].children || []) {
      const cid = `${pid}/${name}`;
      out[cid] = LoadAndValidateOne(cid);
      loadChildren(cid);
    }
  };

  loadChildren("db");

  return out;
}

export function TitleToId(title: string): string {
  return slugify(title, { replacement: "_", lower: true }).replace(/\W/g, '');
}

export function StringifyDoc(doc: CanonFile): string {
  return JSON.stringify(doc, null, 2);
}

function deleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function ValidateAndSave(docDb: CanonDb) {
  deleteFolderRecursive('./build');
  fs.mkdirSync('./build');

  const visited: string[] = [];
  const visitRecursive = (id: string) => {
    const doc = docDb[id];
    if (!doc) throw `Referenced document ${id} does not exist`;

    EnsureValid(doc);
    const fpath = `./build/${id}.json`;
    const docStr = StringifyDoc(doc);
    fs.writeFileSync(fpath, docStr);
    const dirPath = `./build/${id}`;
    if (doc.children) {
      fs.mkdirSync(dirPath);
    }

    visited.push(id);

    for (var childId of doc.children || []) {
        visitRecursive(`${id}/${childId}`);
    }
  };

  visitRecursive("db");

  const unvisited = Object.keys(docDb).filter(key => !visited.includes(key));
  if (unvisited.length > 0)
    throw `The following documents don't exist in the hierarchy: ${unvisited.toString()}`;
}
