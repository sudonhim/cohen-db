import { DocumentFile } from './schema';

export interface DocDb {
    db: DocumentFile;
    [id: string]: DocumentFile;
}

// CohenDb exports only this monolithic static database object
declare const data: DocDb;
export default data;
