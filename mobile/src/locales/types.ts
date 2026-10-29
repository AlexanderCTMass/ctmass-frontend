import type { en } from "./en";

type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

export type Translations = Widen<typeof en>;
