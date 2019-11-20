import { CanonFile } from './schema';

export interface CanonDb {
    db: CanonFile;
    [id: string]: CanonFile;
}

// CohenDb exports only this monolithic static database object
declare const data: CanonDb;
export default data;
