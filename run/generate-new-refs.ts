import { LoadAndValidate, ValidateAndSave } from '../lib/utils';
import { CanonDb } from '../index';
import { Text } from '../schema';

const docDb: CanonDb = LoadAndValidate();

console.log(`Loaded and validated ${Object.keys(docDb).length} documents`);

ValidateAndSave(docDb);

for (const id in docDb) {
    const doc = docDb[id];
    const refMap: { [old: string]: string } = {};
    if (!doc.content) continue;
    if (!doc.annotations) continue;

    const doContent = (c: Text, si?: number) => {
        const oldPrefix = si ? `s${si}.` : '';
        const newPrefix = si ? `${si}:` : '';
        let fragId = 1;
        c.text.forEach((lines, pi) => {
            if (Array.isArray(lines)) {
                lines.forEach((line, li) => {
                    const newRef = `${newPrefix}${fragId}`;
                    refMap[`p${oldPrefix}${pi + 1}`] = newRef;
                    refMap[`p${oldPrefix}${pi + 1}.l${li + 1}`] = newRef;
                    fragId++;
                });
            } else {
                const newRef = `${newPrefix}${fragId}`;
                refMap[`p${oldPrefix}${pi + 1}`] = newRef;
                refMap[`p${oldPrefix}${pi + 1}.l1`] = newRef;
                fragId++;
            }
        });
    }

    if (Array.isArray(doc.content.content)) {
        doc.content.content.map((section, si) => {
            doContent(section.content, si + 1);
        });
    } else {
        doContent(doc.content.content, null);
    }

    for (const grp of doc.annotations) {
        grp.newAnchor = refMap[grp.anchor];
        if (!grp.newAnchor) throw `Anchor ${grp.anchor} not translated for ${id}!`;
    }
}

console.log(`Validated and saved. If there are any changes, roundtrip is broken.`);
