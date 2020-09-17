export interface SymbolEntry {
    // How to display the word in UI
    title: string;

    // The stemmed version of the word and synonyms,
    // e.g. "darkness" -> "dark", "dim"
    stemmedVariants: string[];

    // Conceptually related, e.g. dark => night
    // these are in id form, and must exist in the SymbolsMap
    related: string[];
}

export interface SymbolsMap {
    [id: string]: SymbolEntry
}