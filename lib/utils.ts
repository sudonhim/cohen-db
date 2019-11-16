import { DocumentFile } from "../schema";
import * as Ajv from "ajv";
import * as fs from "fs";
import slugify from "slugify";

const schemas = fs
  .readdirSync("./schema")
  .map(name => require(`../schema/${name}`));
const ajv = new Ajv({ schemas });
const validator = ajv.getSchema("document-file.json");

export function EnsureValid(doc: DocumentFile) {
  const valid = validator(doc);
  if (!valid) {
    console.log(`Failed to validate ${doc.title}`);
    console.log(ajv.errorsText(validator.errors));
    throw "Validation failure";
  }
}

function LoadAndValidateOne(id: string): DocumentFile {
  const data = require(`../${id}.json`);
  EnsureValid(data);

  return data as DocumentFile;
}

// All the database documents in a dictionary
export interface DocDb {
  db: DocumentFile;
  [id: string]: DocumentFile;
}

export function LoadAndValidate(): DocDb {
  const out: DocDb = {
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
  return slugify(title, { replacement: "_", lower: true });
}

export function StringifyDoc(doc: DocumentFile): string {
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

export function ValidateAndSave(docDb: DocDb) {
  const visited: string[] = [];
  const visitRecursive = (id: string) => {
    const doc = docDb[id];
    if (!doc) throw `Referenced document ${id} does not exist`;

    EnsureValid(doc);
    const fpath = `./${id}.json`;
    const docStr = StringifyDoc(doc);
    if (!fs.existsSync(fpath) || fs.readFileSync(fpath, "utf8") !== docStr) {
      console.log(`Updating document ${id}`);
      fs.writeFileSync(fpath, docStr);
      const dirPath = `./${id}`;
      if (doc.children) {
        if (!fs.existsSync(dirPath)) {
          console.log(`Creating directory ${dirPath}`);
          fs.mkdirSync(dirPath);
        }
      } else {
        if (fs.existsSync(dirPath)) {
            console.log(`Removing directory ${dirPath}`);
            deleteFolderRecursive(dirPath);
        }
      }
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
