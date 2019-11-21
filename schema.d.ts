/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A collection of canonical material tied to a particular time, place, or release
 */
export interface CanonFile {
  /**
   * The string to use when showing this item in menus and links.
   */
  title: string;
  /**
   * The category that this item belongs to.
   */
  kind: "group" | "song" | "live" | "album" | "tour" | "interview" | "other";
  metadata?: Metadata;
  content?: Content;
  /**
   * A list of child document IDs. E.g. if this document is an album, the children are songs. The IDs here are relative - the path part is omitted.
   */
  children?: [string, ...string[]];
}
/**
 * The metadata of a document, which is a set of fully optional standardized properties
 */
export interface Metadata {
  title?: string;
  date?: string;
  event?: string;
  location?: {
    country?: string;
    city?: string;
    venue?: string;
  };
}
/**
 * The content of a document, which is either a single canonical text part, or a sequence of complex parts
 */
export interface Content {
  /**
   * Information about the document itself
   */
  preamble?: string;
  content: (Note | Prologue | Variation)[] | Text;
}
/**
 * A text segment, which may optionally refer to another document
 */
export interface Note {
  kind: "note";
  /**
   * ID of the document that this note is about, if any
   */
  reference?: string;
  content: Text;
}
/**
 * Canonical text content, immutable and eternal
 */
export interface Text {
  /**
   * An array of paragraphs or stanzas, to be referenced by index
   */
  text: (string | string[])[];
}
/**
 * Words spoken about another work, before performing it
 */
export interface Prologue {
  kind: "prologue";
  /**
   * ID of the document that this prologue is about
   */
  reference: string;
  content: Text;
}
/**
 * A variation on another work, while performing it
 */
export interface Variation {
  kind: "variation";
  /**
   * ID of the document that this variation is of
   */
  reference: string;
  content: Text;
}
