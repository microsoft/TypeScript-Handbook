## `keyof` and Lookup Types

In JavaScript it is fairly common to have APIs that expect property names as parameters, but so far it hasn't been possible to express the type relationships that occur in those APIs.

Enter Index Type Query or `keyof`;
An indexed type query `keyof T` yields the type of permitted property names for `T`.
A `keyof T` type is considered a subtype of `string`.

##### Example

```ts
interface Person {
    name: string;
    age: number;
    location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[];  // "length" | "push" | "pop" | "concat" | ...
type K3 = keyof { [x: string]: Person };  // string
```

The dual of this is *indexed access types*, also called *lookup types*.
Syntactically, they look exactly like an element access, but are written as types:

##### Example

```ts
type P1 = Person["name"];  // string
type P2 = Person["name" | "age"];  // string | number
type P3 = string["charAt"];  // (pos: number) => string
type P4 = string[]["push"];  // (...items: string[]) => number
type P5 = string[][0];  // string
```

You can use this pattern with other parts of the type system to get type-safe lookups.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];  // Inferred type is T[K]
}

function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    obj[key] = value;
}

let x = { foo: 10, bar: "hello!" };

let foo = getProperty(x, "foo"); // number
let bar = getProperty(x, "bar"); // string

let oops = getProperty(x, "wargarbl"); // Error! "wargarbl" is not "foo" | "bar"

setProperty(x, "foo", "string"); // Error!, string expected number
```

## Mapped Types

One common task is to take an existing type and make each of its properties entirely optional.
Let's say we have a `Person`:

```ts
interface Person {
    name: string;
    age: number;
    location: string;
}
```

A partial version of it would be:

```ts
interface PartialPerson {
    name?: string;
    age?: number;
    location?: string;
}
```

with Mapped types, `PartialPerson` can be written as a generalized transformation on the type `Person` as:

```ts
type Partial<T> = {
    [P in keyof T]?: T[P];
};

type PartialPerson = Partial<Person>;
```

Mapped types are produced by taking a union of literal types, and computing a set of properties for a new object type.
They're like [list comprehensions in Python](https://docs.python.org/2/tutorial/datastructures.html#nested-list-comprehensions), but instead of producing new elements in a list, they produce new properties in a type.

In addition to `Partial`, Mapped Types can express many useful transformations on types:

```ts
// Keep types the same, but make each property to be read-only.
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// Same property names, but make the value a promise instead of a concrete one
type Deferred<T> = {
    [P in keyof T]: Promise<T[P]>;
};

// Wrap proxies around properties of T
type Proxify<T> = {
    [P in keyof T]: { get(): T[P]; set(v: T[P]): void }
};
```

## `Partial`, `Readonly`, `Record`, and `Pick`

`Partial` and `Readonly`, as described earlier, are very useful constructs.
You can use them to describe some common JS routines like:

```ts
function assign<T>(obj: T, props: Partial<T>): void;
function freeze<T>(obj: T): Readonly<T>;
```

Because of that, they are now included by default in the standard library.

We're also including two other utility types as well: `Record` and `Pick`.

```ts
// From T pick a set of properties K
declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;

const nameAndAgeOnly = pick(person, "name", "age");  // { name: string, age: number }
```

```ts
// For every properties K of type T, transform it to U
function mapObject<K extends string, T, U>(obj: Record<K, T>, f: (x: T) => U): Record<K, U>

const names = { foo: "hello", bar: "world", baz: "bye" };
const lengths = mapObject(names, s => s.length);  // { foo: number, bar: number, baz: number }
```

## Object Spread and Rest

TypeScript 2.1 brings support for [ESnext Spread and Rest](https://github.com/sebmarkbage/ecmascript-rest-spread).

Similar to array spread, spreading an object can be handy to get a shallow copy:

```ts
let copy = { ...original };
```

Similarly, you can merge several different objects.
In the following example, `merged` will have properties from `foo`, `bar`, and `baz`.

```ts
let merged = { ...foo, ...bar, ...baz };
```

You can also override existing properties and add new ones:

```ts
let obj = { x: 1, y: "string" };
var newObj = {...obj, z: 3, y: 4}; // { x: number, y: number, z: number }
```

The order of specifying spread operations determines what properties end up in the resulting object;
properties in later spreads "win out" over previously created properties.

Object rests are the dual of object spreads, in that they can extract any extra properties that don't get picked up when destructuring an element:

```ts
let obj = { x: 1, y: 1, z: 1 };
let { z, ...obj1 } = obj;
obj1; // {x: number, y:number};
```

## Downlevel Async Functions

This feature was supported before TypeScript 2.1, but only when targeting ES6/ES2015.
TypeScript 2.1 brings the capability to ES3 and ES5 run-times, meaning you'll be free to take advantage of it no matter what environment you're using.

> Note: first, we need to make sure our run-time has an ECMAScript-compliant `Promise` available globally.
> That might involve grabbing [a polyfill](https://github.com/stefanpenner/es6-promise) for `Promise`, or relying on one that you might have in the run-time that you're targeting.
> We also need to make sure that TypeScript knows `Promise` exists by setting your `lib` flag to something like `"dom", "es2015"` or `"dom", "es2015.promise", "es5"`

##### Example

##### tsconfig.json

```json
{
    "compilerOptions": {
        "lib": ["dom", "es2015.promise", "es5"]
    }
}
```

##### dramaticWelcome.ts

```ts
function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function dramaticWelcome() {
    console.log("Hello");

    for (let i = 0; i < 3; i++) {
        await delay(500);
        console.log(".");
    }

    console.log("World!");
}

dramaticWelcome();
```

Compiling and running the output should result in the correct behavior on an ES3/ES5 engine.

## Support for external helpers library (`tslib`)

TypeScript injects a handful of helper functions such as `__extends` for inheritance, `__assign` for spread operator in object literals and JSX elements, and `__awaiter` for async functions.

Previously there were two options:

 1. inject helpers in *every* file that needs them, or
 2. no helpers at all with `--noEmitHelpers`.

The two options left more to be desired;
bundling the helpers in every file was a pain point for customers trying to keep their package size small.
And not including helpers, meant customers had to maintain their own helpers library.

TypeScript 2.1 allows for including these files in your project once in a separate module, and the compiler will emit imports to them as needed.

First, install the [`tslib`](https://github.com/Microsoft/tslib) utility library:

```sh
npm install tslib
```

Second, compile your files using `--importHelpers`:

```sh
tsc --module commonjs --importHelpers a.ts
```

So given the following input, the resulting `.js` file will include an import to `tslib` and use the `__assign` helper from it instead of inlining it.

```ts
export const o = { a: 1, name: "o" };
export const copy = { ...o };
```

```js
"use strict";
var tslib_1 = require("tslib");
exports.o = { a: 1, name: "o" };
exports.copy = tslib_1.__assign({}, exports.o);
```

## Untyped imports

TypeScript has traditionally been overly strict about how you can import modules.
This was to avoid typos and prevent users from using modules incorrectly.

However, a lot of the time, you might just want to import an existing module that may not have its own `.d.ts` file.
Previously this was an error.
Starting with TypeScript 2.1 this is now much easier.

With TypeScript 2.1, you can import a JavaScript module without needing a type declaration.
A type declaration (such as `declare module "foo" { ... }` or `node_modules/@types/foo`) still takes priority if it exists.

An import to a module with no declaration file will still be flagged as an error under `--noImplicitAny`.

##### Example

```ts
// Succeeds if `node_modules/asdf/index.js` exists
import { x } from "asdf";
```

## Support for `--target ES2016`, `--target ES2017` and `--target ESNext`

TypeScript 2.1 supports three new target values `--target ES2016`, `--target ES2017` and `--target ESNext`.

Using target `--target ES2016` will instruct the compiler not to transform ES2016-specific features, e.g. `**` operator.

Similarly, `--target ES2017` will instruct the compiler not to transform ES2017-specific features like `async`/`await`.

`--target ESNext` targets latest supported [ES proposed features](https://github.com/tc39/proposals).

## Improved `any` Inference

Previously, if TypeScript couldn't figure out the type of a variable, it would choose the `any` type.

```ts
let x;      // implicitly 'any'
let y = []; // implicitly 'any[]'

let z: any; // explicitly 'any'.
```

With TypeScript 2.1, instead of just choosing `any`, TypeScript will infer types based on what you end up assigning later on.

This is only enabled if `--noImplicitAny` is set.

##### Example

```ts
let x;

// You can still assign anything you want to 'x'.
x = () => 42;

// After that last assignment, TypeScript 2.1 knows that 'x' has type '() => number'.
let y = x();

// Thanks to that, it will now tell you that you can't add a number to a function!
console.log(x + y);
//          ~~~~~
// Error! Operator '+' cannot be applied to types '() => number' and 'number'.

// TypeScript still allows you to assign anything you want to 'x'.
x = "Hello world!";

// But now it also knows that 'x' is a 'string'!
x.toLowerCase();
```

The same sort of tracking is now also done for empty arrays.

A variable declared with no type annotation and an initial value of `[]` is considered an implicit `any[]` variable.
However, each subsequent `x.push(value)`, `x.unshift(value)` or `x[n] = value` operation *evolves* the type of the variable in accordance with what elements are added to it.

``` ts
function f1() {
    let x = [];
    x.push(5);
    x[1] = "hello";
    x.unshift(true);
    return x;  // (string | number | boolean)[]
}

function f2() {
    let x = null;
    if (cond()) {
        x = [];
        while (cond()) {
            x.push("hello");
        }
    }
    return x;  // string[] | null
}
```

## Implicit any errors

One great benefit of this is that you'll see *way fewer* implicit `any` errors when running with `--noImplicitAny`.
Implicit `any` errors are only reported when the compiler is unable to know the type of a variable without a type annotation.

##### Example

``` ts
function f3() {
    let x = [];  // Error: Variable 'x' implicitly has type 'any[]' in some locations where its type cannot be determined.
    x.push(5);
    function g() {
        x;    // Error: Variable 'x' implicitly has an 'any[]' type.
    }
}
```

## Better inference for literal types

String, numeric and boolean literal types (e.g. `"abc"`, `1`, and `true`) were previously inferred only in the presence of an explicit type annotation.
Starting with TypeScript 2.1, literal types are *always* inferred for `const` variables and `readonly` properties.

The type inferred for a `const` variable or `readonly` property without a type annotation is the type of the literal initializer.
The type inferred for a `let` variable, `var` variable, parameter, or non-`readonly` property with an initializer and no type annotation is the widened literal type of the initializer.
Where the widened type for a string literal type is `string`, `number` for numeric literal types, `boolean` for `true` or `false` and the containing enum for enum literal types.

##### Example

```ts
const c1 = 1;  // Type 1
const c2 = c1;  // Type 1
const c3 = "abc";  // Type "abc"
const c4 = true;  // Type true
const c5 = cond ? 1 : "abc";  // Type 1 | "abc"

let v1 = 1;  // Type number
let v2 = c2;  // Type number
let v3 = c3;  // Type string
let v4 = c4;  // Type boolean
let v5 = c5;  // Type number | string
```

Literal type widening can be controlled through explicit type annotations.
Specifically, when an expression of a literal type is inferred for a const location without a type annotation, that `const` variable gets a widening literal type inferred.
But when a `const` location has an explicit literal type annotation, the `const` variable gets a non-widening literal type.

##### Example

```ts
const c1 = "hello";  // Widening type "hello"
let v1 = c1;  // Type string

const c2: "hello" = "hello";  // Type "hello"
let v2 = c2;  // Type "hello"
```

## Use returned values from super calls as 'this'

In ES2015, constructors which return an object implicitly substitute the value of `this` for any callers of `super()`.
As a result, it is necessary to capture any potential return value of `super()` and replace it with `this`.
This change enables working with [Custom Elements](https://w3c.github.io/webcomponents/spec/custom/#htmlelement-constructor), which takes advantage of this to initialize browser-allocated elements with user-written constructors.

##### Example

```ts
class Base {
    x: number;
    constructor() {
        // return a new object other than `this`
        return {
            x: 1,
        };
    }
}

class Derived extends Base {
    constructor() {
        super();
        this.x = 2;
    }
}
```

Generates:

```js
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        var _this = _super.call(this) || this;
        _this.x = 2;
        return _this;
    }
    return Derived;
}(Base));
```

> This change entails a break in the behavior of extending built-in classes like `Error`, `Array`, `Map`, etc.. Please see the [extending built-ins breaking change documentation](https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work) for more details.

## Configuration inheritance

Often a project has multiple output targets, e.g. `ES5` and `ES2015`, debug and production or `CommonJS` and `System`;
Just a few configuration options change between these two targets, and maintaining multiple `tsconfig.json` files can be a hassle.

TypeScript 2.1 supports inheriting configuration using `extends`, where:

* `extends` is a new top-level property in `tsconfig.json` (alongside `compilerOptions`, `files`, `include`, and `exclude`).
* The value of `extends` must be a string containing a path to another configuration file to inherit from.
* The configuration from the base file are loaded first, then overridden by those in the inheriting config file.
* Circularity between configuration files is not allowed.
* `files`, `include` and `exclude` from the inheriting config file *overwrite* those from the base config file.
* All relative paths found in the configuration file will be resolved relative to the configuration file they originated in.

##### Example

`configs/base.json`:

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

`tsconfig.json`:

```json
{
  "extends": "./configs/base",
  "files": [
    "main.ts",
    "supplemental.ts"
  ]
}
```

`tsconfig.nostrictnull.json`:

```json
{
  "extends": "./tsconfig",
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

## New `--alwaysStrict`

Invoking the compiler with `--alwaysStrict` causes:

1. Parses all the code in strict mode.
2. Writes `"use strict";` directive atop every generated file.

Modules are parsed automatically in strict mode.
The new flag is recommended for non-module code.
