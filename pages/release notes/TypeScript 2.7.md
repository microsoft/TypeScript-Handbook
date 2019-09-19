## Constant-named properties

TypeScript 2.7 adds support for declaring const-named properties on types including ECMAScript symbols.

##### Example

```ts
// Lib
export const SERIALIZE = Symbol("serialize-method-key");

export interface Serializable {
    [SERIALIZE](obj: {}): string;
}
```

```ts
// consumer

import { SERIALIZE, Serializable } from "lib";

class JSONSerializableItem implements Serializable {
    [SERIALIZE](obj: {}) {
        return JSON.stringify(obj);
    }
}
```

This also applies to numeric and string literals.

##### Example

```ts
const Foo = "Foo";
const Bar = "Bar";

let x = {
    [Foo]: 100,
    [Bar]: "hello",
};

let a = x[Foo]; // has type 'number'
let b = x[Bar]; // has type 'string'
```

## `unique symbol`

To enable treating symbols as unique literals  a new type `unique symbol` is available.
`unique symbol` is a subtype of `symbol`, and are produced only from calling `Symbol()` or `Symbol.for()`, or from explicit type annotations.
The new type is only allowed on `const` declarations and `readonly static` properties, and in order to reference a specific unique symbol, you'll have to use the `typeof` operator.
Each reference to a `unique symbol` implies a completely unique identity that's tied to a given declaration.

##### Example

```ts
// Works
declare const Foo: unique symbol;

// Error! 'Bar' isn't a constant.
let Bar: unique symbol = Symbol();

// Works - refers to a unique symbol, but its identity is tied to 'Foo'.
let Baz: typeof Foo = Foo;

// Also works.
class C {
    static readonly StaticSymbol: unique symbol = Symbol();
}
```

Because each `unique symbol` has a completely separate identity, no two `unique symbol` types are assignable or comparable to each other.

##### Example

```ts
const Foo = Symbol();
const Bar = Symbol();

// Error: can't compare two unique symbols.
if (Foo === Bar) {
    // ...
}
```

## Strict Class Initialization

TypeScript 2.7 introduces a new flag called `--strictPropertyInitialization`.
This flag performs checks to ensure that each instance property of a class gets initialized in the constructor body, or by a property initializer.
For example

```ts
class C {
    foo: number;
    bar = "hello";
    baz: boolean;
//  ~~~
//  Error! Property 'baz' has no initializer and is not definitely assigned in the
//         constructor.

    constructor() {
        this.foo = 42;
    }
}
```

In the above, if we truly meant for `baz` to potentially be `undefined`, we should have declared it with the type `boolean | undefined`.

There are certain scenarios where properties can be initialized indirectly (perhaps by a helper method or dependency injection library), in which case you can use the new *definite assignment assertion modifiers* for your properties (discussed below).

```ts
class C {
    foo!: number;
    // ^
    // Notice this '!' modifier.
    // This is the "definite assignment assertion"

    constructor() {
        this.initialize();
    }

    initialize() {
        this.foo = 0;
    }
}
```

Keep in mind that `--strictPropertyInitialization` will be turned on along with other `--strict` mode flags, which can impact your project.
You can set the `strictPropertyInitialization` setting to `false` in your `tsconfig.json`'s `compilerOptions`, or `--strictPropertyInitialization false` on the command line to turn off this checking.

## Definite Assignment Assertions

The definite assignment assertion is a feature that allows a `!` to be placed after instance property and variable declarations to relay to TypeScript that a variable is indeed assigned for all intents and purposes, even if TypeScript's analyses cannot detect so.

##### Example

```ts
let x: number;
initialize();
console.log(x + x);
//          ~   ~
// Error! Variable 'x' is used before being assigned.

function initialize() {
    x = 10;
}
```

With definite assignment assertions, we can assert that `x` is really assigned by appending an `!` to its declaration:

```ts
// Notice the '!'
let x!: number;
initialize();

// No error!
console.log(x + x);

function initialize() {
    x = 10;
}
```

In a sense, the definite assignment assertion operator is the dual of the non-null assertion operator (in which *expressions* are post-fixed with a `!`), which we could also have used in the example.

```ts
let x: number;
initialize();

// No error!
console.log(x! + x!);

function initialize() {
    x = 10;

```

In our example, we knew that all uses of `x` would be initialized so it makes more sense to use definite assignment assertions than non-null assertions.

## Fixed Length Tuples

In TypeScript 2.6 and earlier, `[number, string, string]` was considered a subtype of `[number, string]`.
This was motivated by TypeScript's structural nature; the first and second elements of a `[number, string, string]` are respectively subtypes of the first and second elements of `[number, string]`.
However, after examining real world usage of tuples, we noticed that most situations in which this was permitted was typically undesirable.

In TypeScript 2.7, tuples of different arities are no longer assignable to each other.
Thanks to a pull request from [Tycho Grouwstra](https://github.com/tycho01), tuple types now encode their arity into the type of their respective `length` property.
This is accomplished by leveraging numeric literal types, which now allow tuples to be distinct from tuples of different arities.

Conceptually, you might consider the type `[number, string]` to be equivalent to the following declaration of `NumStrTuple`:

```ts
interface NumStrTuple extends Array<number | string> {
    0: number;
    1: string;
    length: 2; // using the numeric literal type '2'
}
```

Note that this is a breaking change for some code.
If you need to resort to the original behavior in which tuples only enforce a minimum length, you can use a similar declaration that does not explicitly define a `length` property, falling back to `number`.

```ts
interface MinimumNumStrTuple extends Array<number | string> {
    0: number;
    1: string;
}
```

Note that this does not imply tuples represent immutable arrays, but it is an implied convention.

## Improved type inference for object literals

TypeScript 2.7 improves type inference for multiple object literals occurring in the same context.
When multiple object literal types contribute to a union type, we now *normalize* the object literal types such that all properties are present in each constituent of the union type.

Consider:

```ts
const obj = test ? { text: "hello" } : {};  // { text: string } | { text?: undefined }
const s = obj.text;  // string | undefined
```

Previously type `{}` was inferred for `obj` and the second line subsequently caused an error because `obj` would appear to have no properties.
That obviously wasn't ideal.

##### Example

```ts
// let obj: { a: number, b: number } |
//     { a: string, b?: undefined } |
//     { a?: undefined, b?: undefined }
let obj = [{ a: 1, b: 2 }, { a: "abc" }, {}][0];
obj.a;  // string | number | undefined
obj.b;  // number | undefined
```

Multiple object literal type inferences for the same type parameter are similarly collapsed into a single normalized union type:

```ts
declare function f<T>(...items: T[]): T;
// let obj: { a: number, b: number } |
//     { a: string, b?: undefined } |
//     { a?: undefined, b?: undefined }
let obj = f({ a: 1, b: 2 }, { a: "abc" }, {});
obj.a;  // string | number | undefined
obj.b;  // number | undefined
```

## Improved handling of structurally identical classes and `instanceof` expressions

TypeScript 2.7 improves the handling of structurally identical classes in union types and `instanceof` expressions:

* Structurally identical, but distinct, class types are now preserved in union types (instead of eliminating all but one).
* Union type subtype reduction only removes a class type if it is a subclass of *and* derives from another class type in the union.
* Type checking of the `instanceof` operator is now based on whether the type of the left operand *derives from* the type indicated by the right operand (as opposed to a structural subtype check).

This means that union types and `instanceof` properly distinguish between structurally identical classes.

##### Example

```ts
class A {}
class B extends A {}
class C extends A {}
class D extends A { c: string }
class E extends D {}

let x1 = !true ? new A() : new B();  // A
let x2 = !true ? new B() : new C();  // B | C (previously B)
let x3 = !true ? new C() : new D();  // C | D (previously C)

let a1 = [new A(), new B(), new C(), new D(), new E()];  // A[]
let a2 = [new B(), new C(), new D(), new E()];  // (B | C | D)[] (previously B[])

function f1(x: B | C | D) {
    if (x instanceof B) {
        x;  // B (previously B | D)
    }
    else if (x instanceof C) {
        x;  // C
    }
    else {
        x;  // D (previously never)
    }
}
```

## Type guards inferred from  `in` operator

The `in` operator now acts as a narrowing expression for types.

For a `n in x` expression, where `n` is a string literal or string literal type and `x` is a union type, the "true" branch narrows to types which have an optional or required property `n`, and the "false" branch narrows to types which have an optional or missing property `n`.

##### Example

```ts
interface A { a: number };
interface B { b: string };

function foo(x: A | B) {
    if ("a" in x) {
        return x.a;
    }
    return x.b;
}
```

## Support for `import d from "cjs"` from CommonJS modules with `--esModuleInterop`

TypeScript 2.7 updates CommonJS/AMD/UMD module emit to synthesize namespace records based on the presence of an `__esModule` indicator under `--esModuleInterop`.
The change brings the generated output from TypeScript closer to that generated by Babel.

Previously CommonJS/AMD/UMD modules were treated in the same way as ES6 modules, resulting in a couple of problems. Namely:

* TypeScript treats a namespace import (i.e. `import * as foo from "foo"`) for a CommonJS/AMD/UMD module as equivalent to `const foo = require("foo")`.Things are simple here, but they don't work out if the primary object being imported is a primitive or a class or a function. ECMAScript spec stipulates that a namespace record is a plain object, and that a namespace import (`foo` in the example above) is not callable, though allowed by TypeScript
* Similarly a default import (i.e. `import d from "foo"`) for a CommonJS/AMD/UMD module as equivalent to `const d = require("foo").default`.Most of the CommonJS/AMD/UMD modules available today do not have a `default` export, making this import pattern practically unusable to import non-ES modules (i.e. CommonJS/AMD/UMD). For instance `import fs from "fs"` or `import express from "express"` are not allowed.

Under the new `--esModuleInterop` these two issues should be addressed:

* A namespace import (i.e. `import * as foo from "foo"`) is now correctly flagged as uncallable. Calling it will result in an error.
* Default imports to CommonJS/AMD/UMD are now allowed (e.g. `import fs from "fs"`), and should work as expected.

> Note: The new behavior is added under a flag to avoid unwarranted breaks to existing code bases. **We highly recommend applying it both to new and existing projects.**
> For existing projects, namespace imports (`import * as express from "express"; express();`) will need to be converted to default imports (`import express from "express"; express();`).

##### Example

With `--esModuleInterop` two new helpers are generated `__importStar` and `__importDefault` for import `*` and import `default` respectively.
For instance input like:

```ts
import * as foo from "foo";
import b from "bar";
```

Will generate:

```js
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
exports.__esModule = true;
var foo = __importStar(require("foo"));
var bar_1 = __importDefault(require("bar"));
```

## Numeric separators

TypeScript 2.7 brings support for [ES Numeric Separators](https://github.com/tc39/proposal-numeric-separator).
Numeric literals can now be separated into segments using `_`.

##### Example

```ts
const million = 1_000_000;
const phone = 555_734_2231;
const bytes = 0xFF_0C_00_FF;
const word = 0b1100_0011_1101_0001;
```

## Cleaner output in `--watch` mode

TypeScript's `--watch` mode now clears the screen after a re-compilation is requested.

## Prettier `--pretty` output

TypeScript's `--pretty` flag can make error messages easier to read and manage.
`--pretty` now uses colors for file names, diagnostic codes, and line numbers.
File names and positions are now also formatted to allow navigation in common terminals (e.g. Visual Studio Code terminal).
