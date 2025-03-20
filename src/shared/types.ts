// convert as const object to union type
// e.g. const obj = { a: 'a', b: 'b' } as const;
// type Obj = Literal<typeof obj>; // 'a' | 'b'
export type Literal<T> = T[keyof T];
