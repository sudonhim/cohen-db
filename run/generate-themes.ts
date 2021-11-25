import * as fs from 'fs';
import slugify from 'slugify';
import { CanonDb } from '..';
import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonFile } from '../schema';

const docDb: CanonDb = LoadAndValidate();
console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

const themesFile: CanonFile = {
    title: "Themes",
    kind: "group",
    user: "sudonhim",
    version: 1,
    annotations: []
}

const lines = fs.readFileSync('./syms/themes.txt', 'utf8')
    .split(/[\r\n]+/);

let curGroup: CanonFile = null;
for (let line of lines) {
    if (line.endsWith('/')) {
        if (curGroup) {
            const id = 'group.' + slugify(curGroup.title, {
                replacement: "_",
                lower: true,
              });
            docDb[id] = curGroup;
            themesFile.children = themesFile.children ? [...themesFile.children, id] : [id];
        }

        curGroup = {
            title: line.substr(0, line.length - 1),
            kind: 'group',
            user: 'sudonhim',
            version: 1,
            annotations: []
        }
    } else {
        const title = line.substr(1);
        const id = 'theme.' + slugify(title, {
            replacement: "_",
            lower: true,
          });
        docDb[id] = {
            title,
            kind: 'theme',
            user: 'sudonhim',
            version: 1,
            annotations: []
        }

        curGroup.children = curGroup.children ? [...curGroup.children, id] : [id];
    }
}

const id = "group." + slugify(curGroup.title, {
    replacement: "_",
    lower: true,
  });
docDb[id] = curGroup;
themesFile.children = themesFile.children ? [...themesFile.children, id] : [id];

docDb['group.themes'] = themesFile;
docDb.db.children.push('group.themes');

console.log('Validating and saving changes');
ValidateAndSave(docDb);