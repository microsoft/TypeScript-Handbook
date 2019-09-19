## Support `number` and `symbol` named properties with `keyof` and mapped types

TypeScript 2.9 adds support for `number` and `symbol` named properties in index types and mapped types.
Previously, the `keyof` operator and mapped types only supported `string` named properties.

Changes include:

* An index type `keyof T` for some type `T` is a subtype of `string | number | symbol`.
* A mapped type `{ [P in K]: XXX }` permits any `K` assignable to `string | number | symbol`.
* In a `for...in` statement for an object of a generic type `T`, the inferred type of the iteration variable was previously `keyof T` but is now `Extract<keyof T, string>`. (In other words, the subset of `keyof T` that includes only string-like values.)

Given an object type `X`, `keyof X` is resolved as follows:

* If `X` contains a string index signature, `keyof X` is a union of `string`, `number`, and the literal types representing symbol-like properties, otherwise
* If `X` contains a numeric index signature, `keyof X` is a union of `number` and the literal types representing string-like and symbol-like properties, otherwise
* `keyof X` is a union of the literal types representing string-like, number-like, and symbol-like properties.

Where:

* String-like properties of an object type are those declared using an identifier, a string literal, or a computed property name of a string literal type.
* Number-like properties of an object type are those declared using a numeric literal or computed property name of a numeric literal type.
* Symbol-like properties of an object type are those declared using a computed property name of a unique symbol type.

In a mapped type `{ [P in K]: XXX }`, each string literal type in `K` introduces a property with a string name, each numeric literal type in `K` introduces a property with a numeric name, and each unique symbol type in `K` introduces a property with a unique symbol name.
Furthermore, if `K` includes type `string`, a string index signature is introduced, and if `K` includes type `number`, a numeric index signature is introduced.

##### Example

```ts
const c = "c";
const d = 10;
const e = Symbol();

const enum E1 { A, B, C }
const enum E2 { A = "A", B = "B", C = "C" }

type Foo = {
    a: string;       // String-like name
    5: string;       // Number-like name
    [c]: string;     // String-like name
    [d]: string;     // Number-like name
    [e]: string;     // Symbol-like name
    [E1.A]: string;  // Number-like name
    [E2.A]: string;  // String-like name
}

type K1 = keyof Foo;  // "a" | 5 | "c" | 10 | typeof e | E1.A | E2.A
type K2 = Extract<keyof Foo, string>;  // "a" | "c" | E2.A
type K3 = Extract<keyof Foo, number>;  // 5 | 10 | E1.A
type K4 = Extract<keyof Foo, symbol>;  // typeof e
```

Since `keyof` now reflects the presence of a numeric index signature by including type `number` in the key type, mapped types such as `Partial<T>` and `Readonly<T>` work correctly when applied to object types with numeric index signatures:

```ts
type Arrayish<T> = {
    length: number;
    [x: number]: T;
}

type ReadonlyArrayish<T> = Readonly<Arrayish<T>>;

declare const map: ReadonlyArrayish<string>;
let n = map.length;
let x = map[123];  // Previously of type any (or an error with --noImplicitAny)
```

Furthermore, with the `keyof` operator's support for `number` and `symbol` named keys, it is now possible to abstract over access to properties of objects that are indexed by numeric literals (such as numeric enum types) and unique symbols.

```ts
const enum Enum { A, B, C }

const enumToStringMap = {
    [Enum.A]: "Name A",
    [Enum.B]: "Name B",
    [Enum.C]: "Name C"
}

const sym1 = Symbol();
const sym2 = Symbol();
const sym3 = Symbol();

const symbolToNumberMap = {
    [sym1]: 1,
    [sym2]: 2,
    [sym3]: 3
};

type KE = keyof typeof enumToStringMap;     // Enum (i.e. Enum.A | Enum.B | Enum.C)
type KS = keyof typeof symbolToNumberMap;   // typeof sym1 | typeof sym2 | typeof sym3

function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

let x1 = getValue(enumToStringMap, Enum.C);  // Returns "Name C"
let x2 = getValue(symbolToNumberMap, sym3);  // Returns 3
```

This is a breaking change; previously, the `keyof` operator and mapped types only supported `string` named properties.
Code that assumed values typed with `keyof T` were always `string`s, will now be flagged as error.

##### Example

```ts
function useKey<T, K extends keyof T>(o: T, k: K) {
    var name: string = k;  // Error: keyof T is not assignable to string
}
```

#### Recommendations

* If your functions are only able to handle string named property keys, use `Extract<keyof T, string>` in the declaration:

  ```ts
  function useKey<T, K extends Extract<keyof T, string>>(o: T, k: K) {
    var name: string = k;  // OK
  }
  ```

* If your functions are open to handling all property keys, then the changes should be done down-stream:

  ```ts
  function useKey<T, K extends keyof T>(o: T, k: K) {
    var name: string | number | symbol = k;
  }
  ```

* Otherwise use `--keyofStringsOnly` compiler option to disable the new behavior.

## Generic type arguments in JSX elements

JSX elements now allow passing type arguments to generic components.

##### Example

```ts
class GenericComponent<P> extends React.Component<P> {
    internalProp: P;
}

type Props = { a: number; b: string; };

const x = <GenericComponent<Props> a={10} b="hi"/>; // OK

const y = <GenericComponent<Props> a={10} b={20} />; // Error
```

## Generic type arguments in generic tagged templates

Tagged templates are a form of invocation introduced in ECMAScript 2015.
Like call expressions, generic functions may be used in a tagged template and TypeScript will infer the type arguments utilized.

TypeScript 2.9  allows passing generic type arguments to tagged template strings.

##### Example

```ts
declare function styledComponent<Props>(strs: TemplateStringsArray): Component<Props>;

interface MyProps {
  name: string;
  age: number;
}

styledComponent<MyProps> `
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

declare function tag<T>(strs: TemplateStringsArray, ...args: T[]): T;

// inference fails because 'number' and 'string' are both candidates that conflict
let a = tag<string | number> `${100} ${"hello"}`;
```

## `import` types

Modules can import types declared in other modules. But non-module global scripts cannot access types declared in modules. Enter `import` types.

Using `import("mod")` in a type annotation allows for reaching in a module and accessing its exported declaration without importing it.

##### Example

Given a declaration of a class `Pet` in a module file:

```ts
// module.d.ts

export declare class Pet {
   name: string;
}
```

Can be used in a non-module file `global-script.ts`:

```ts
// global-script.ts

function adopt(p: import("./module").Pet) {
    console.log(`Adopting ${p.name}...`);
}
```

This also works in JSDoc comments to refer to types from other modules in `.js`:

```js
// a.js

/**
 * @param p { import("./module").Pet }
 */
function walk(p) {
    console.log(`Walking ${p.name}...`);
}
```

## Relaxing declaration emit visiblity rules

With `import` types available, many of the visibility errors reported during declaration file generation can be handled by the compiler without the need to change the input.

For instance:

```ts
import { createHash } from "crypto";

export const hash = createHash("sha256");
//           ^^^^
// Exported variable 'hash' has or is using name 'Hash' from external module "crypto" but cannot be named.
```

With TypeScript 2.9, no errors are reported, and now the generated file looks like:

```ts
export declare const hash: import("crypto").Hash;
```

## Support for `import.meta`

TypeScript 2.9 introduces support for `import.meta`, a new meta-property as described by the current [TC39 proposal](https://github.com/tc39/proposal-import-meta).

The type of `import.meta` is the global `ImportMeta` type which is defined in `lib.es5.d.ts`.
This interface is extremely limited.
Adding well-known properties for Node or browsers requires interface merging and possibly a global augmentation depending on the context.

##### Example

Assuming that `__dirname` is always available on `import.meta`, the declaration would be done through reopening `ImportMeta` interface:

```ts
// node.d.ts
interface ImportMeta {
    __dirname: string;
}
```

And usage would be:

```ts
import.meta.__dirname // Has type 'string'
```

`import.meta` is only allowed when targeting `ESNext` modules and ECMAScript targets.

## New `--resolveJsonModule`

Often in Node.js applications a `.json` is needed. With TypeScript 2.9, `--resolveJsonModule` allows for importing, extracting types from and generating `.json` files.

##### Example

```ts
// settings.json

{
    "repo": "TypeScript",
    "dry": false,
    "debug": false
}
```

```ts
// a.ts

import settings from "./settings.json";

settings.debug === true;  // OK
settings.dry === 2;  // Error: Operator '===' cannot be applied boolean and number

```

```ts
// tsconfig.json

{
    "compilerOptions": {
        "module": "commonjs",
        "resolveJsonModule": true,
        "esModuleInterop": true
    }
}
```

## `--pretty` output by default

Starting TypeScript 2.9 errors are displayed under `--pretty` by default if the output device is applicable for colorful text.
TypeScript will check if the output steam has [`isTty`](https://nodejs.org/api/tty.html) property set.

Use `--pretty false` on the command line or set `"pretty": false` in your `tsconfig.json` to disable `--pretty` output.

## New `--declarationMap`

Enabling `--declarationMap` alongside `--declaration` causes the compiler to emit `.d.ts.map` files alongside the output `.d.ts` files.
Language Services can also now understand these map files, and uses them to map declaration-file based definition locations to their original source, when available.

In other words, hitting go-to-definition on a declaration from a `.d.ts` file generated with `--declarationMap` will take you to the source file (`.ts`) location where that declaration was defined, and not to the `.d.ts`.
