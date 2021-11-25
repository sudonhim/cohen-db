/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * The content of a document, which is either a single canonical text part, or a sequence of complex parts
 */
export type Content =
  | {
      kind: "simple";
      content: MainContent;
    }
  | {
      kind: "multipart";
      content: SectionalContent[];
    };
/**
 * A fragment of content, the smallest addressable unit of a document
 */
export type Fragment = LineBreakFragment | TextFragment;
/**
 * A piece of contiguous inline content
 */
export type Token = TextTokenNEW | ReferenceToken | LinkToken;
/**
 * A reference to a document, section, or fragment in the database
 */
export type Reference =
  | {
      kind: "document";
      documentId: string;
    }
  | {
      kind: "section";
      documentId: string;
      sectionId: string;
    }
  | {
      kind: "fragment";
      documentId: string;
      /**
       * Present only in references to multipart documents
       */
      sectionId?: string;
      fragmentId: string;
    };
/**
 * Annotations attached to a file
 */
export type Annotations = AnnotationsGroup[];

/**
 * A collection of canonical material tied to a particular time, place, or release
 */
export interface CanonFile {
  /**
   * The username that owns the document and may edit it.
   */
  user: string;
  /**
   * The iteration of the document. Every edit increases this by one.
   */
  version: number;
  /**
   * The string to use when showing this item in menus and links.
   */
  title: string;
  /**
   * The category that this item belongs to.
   */
  kind: "group" | "song" | "live" | "album" | "tour" | "interview" | "other" | "symbol" | "theme";
  metadata?: Metadata;
  content?: Content;
  annotations: Annotations;
  /**
   * A list of child document IDs. E.g. if this document is an album, the children are songs. The IDs here are relative - the path part is omitted.
   */
  children?: [string, ...string[]];
}
/**
 * The metadata of a document, which is a set of fully optional standardized properties
 */
export interface Metadata {
  date?: string;
  source?: string;
  event?: string;
  location?: {
    country?: string;
    city?: string;
    venue?: string;
  };
}
/**
 * Content of a single part document
 */
export interface MainContent {
  fragments: Fragment[];
}
/**
 * Fragment for a line break
 */
export interface LineBreakFragment {
  kind: "lineBreak";
}
/**
 * A fragment of text
 */
export interface TextFragment {
  kind: "text";
  /**
   * Used to refer to this fragment within the document. If not present, this fragment cannot be referred to.
   */
  id?: string;
  tokens: Token[];
}
/**
 * A string of pure text
 */
export interface TextTokenNEW {
  kind: "text";
  /**
   * Only valid if it contains non-whitespace characters.
   */
  text: string;
  /**
   * Default false. Text that should be excluded from search and rendered de-emphasized.
   */
  secondary?: boolean;
}
/**
 * A reference to a document, section, or fragment elsewhere in the database
 */
export interface ReferenceToken {
  kind: "reference";
  reference: Reference;
}
/**
 * A hyperlink, optionally with alternate display text
 */
export interface LinkToken {
  kind: "link";
  /**
   * Text to display for the link, if any
   */
  text?: string;
  link: string;
}
/**
 * A piece of content in a multipart document
 */
export interface SectionalContent {
  id: string;
  title: TextFragment;
  fragments: Fragment[];
}
/**
 * The list of annotations attached to a single location in the parent document
 */
export interface AnnotationsGroup {
  anchor: Reference;
  annotations: Annotation[];
}
/**
 * A user-submitted annotation
 */
export interface Annotation {
  user: string;
  /**
   * ID unique to the anchor
   */
  id: string;
  /**
   * An array of tokens constituting the annotation
   */
  tokens: Token[];
}
