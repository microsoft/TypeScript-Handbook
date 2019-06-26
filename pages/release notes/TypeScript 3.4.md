## Faster subsequent builds with the `--incremental` flag

TypeScript 3.4 introduces a new flag called `--incremental` which tells TypeScript to save information about the project graph from the last compilation.
The next time TypeScript is invoked with `--incremental`, it will use that information to detect the least costly way to type-check and emit changes to your project.

```json5
// tsconfig.json
{
    "compilerOptions": {
        "incremental": true,
        "outDir": "./lib"
    },
    "include": ["./src"]
}
```

By default with these settings, when we run `tsc`, TypeScript will look for a file called `.tsbuildinfo` in the output directory (`./lib`).
If `./lib/.tsbuildinfo` doesn't exist, it'll be generated.
But if it does, `tsc` will try to use that file to incrementally type-check and update our output files.

These `.tsbuildinfo` files can be safely deleted and don't have any impact on our code at runtime - they're purely used to make compilations faster.
We can also name them anything that we want, and place them anywhere we want using the `--tsBuildInfoFile` flag.

```json5
// front-end.tsconfig.json
{
    "compilerOptions": {
        "incremental": true,
        "tsBuildInfoFile": "./buildcache/front-end",
        "outDir": "./lib"
    },
    "include": ["./src"]
}
```

### Composite projects

Part of the intent with composite projects (`tsconfig.json`s with `composite` set to `true`) is that references between different projects can be built incrementally.
As such, composite projects will **always** produce `.tsbuildinfo` files.

### `outFile`

When `outFile` is used, the build information file's name will be based on the output file's name.
As an example, if our output JavaScript file is `./output/foo.js`, then under the `--incremental` flag, TypeScript will generate the file `./output/foo.tsbuildinfo`.
As above, this can be controlled with the `--tsBuildInfoFile` flag.

## Higher order type inference from generic functions

TypeScript 3.4 can now produce generic function types when inference from other generic functions produces free type variables for inferences.
This means many function composition patterns now work better in 3.4.

To get more specific, let's build up some motivation and consider the following `compose` function:

```ts
function compose<A, B, C>(f: (arg: A) => B, g: (arg: B) => C): (arg: A) => C {
    return x => g(f(x));
}
```

`compose` takes two other functions:

- `f` which takes some argument (of type `A`) and returns a value of type `B`
- `g` which takes an argument of type `B` (the type `f` returned), and returns a value of type `C`

`compose` then returns a function which feeds its argument through `f` and then `g`.

When calling this function, TypeScript will try to figure out the types of `A`, `B`, and `C` through a process called *type argument inference*.
This inference process usually works pretty well:

```ts
interface Person {
    name: string;
    age: number;
}

function getDisplayName(p: Person) {
    return p.name.toLowerCase();
}

function getLength(s: string) {
    return s.length;
}

// has type '(p: Person) => number'
const getDisplayNameLength = compose(
    getDisplayName,
    getLength,
);

// works and returns the type 'number'
getDisplayNameLength({ name: "Person McPersonface", age: 42 });
```

The inference process is fairly straightforward here because `getDisplayName` and `getLength` use types that can easily be referenced.
However, in TypeScript 3.3 and earlier, generic functions like `compose` didn't work so well when passed other generic functions.

```ts
interface Box<T> {
    value: T;
}

function makeArray<T>(x: T): T[] {
    return [x];
}

function makeBox<U>(value: U): Box<U> {
    return { value };
}

// has type '(arg: {}) => Box<{}[]>'
const makeBoxedArray = compose(
    makeArray,
    makeBox,
)

makeBoxedArray("hello!").value[0].toUpperCase();
//                                ~~~~~~~~~~~
// error: Property 'toUpperCase' does not exist on type '{}'.
```

In older versions, TypeScript would infer the empty object type (`{}`) when inferring from other type variables like `T` and `U`.

During type argument inference in TypeScript 3.4, for a call to a generic function that returns a function type, TypeScript *will*, as appropriate, propagate type parameters from generic function arguments onto the resulting function type.

In other words, instead of producing the type

```ts
(arg: {}) => Box<{}[]>
```

TypeScript 3.4 produces the type

```ts
<T>(arg: T) => Box<T[]>
```

Notice that `T` has been propagated from `makeArray` into the resulting type's type parameter list.
This means that genericity from `compose`'s arguments has been preserved and our `makeBoxedArray` sample will just work!

```ts
interface Box<T> {
    value: T;
}

function makeArray<T>(x: T): T[] {
    return [x];
}

function makeBox<U>(value: U): Box<U> {
    return { value };
}

// has type '<T>(arg: T) => Box<T[]>'
const makeBoxedArray = compose(
    makeArray,
    makeBox,
)

// works with no problem!
makeBoxedArray("hello!").value[0].toUpperCase();
```

For more details, you can [read more at the original change](https://github.com/Microsoft/TypeScript/pull/30215).

## Improvements for `ReadonlyArray` and `readonly` tuples

TypeScript 3.4 makes it a little bit easier to use read-only array-like types.

### A new syntax for `ReadonlyArray`

The `ReadonlyArray` type describes `Array`s that can only be read from.
Any variable with a reference to a `ReadonlyArray` can't add, remove, or replace any elements of the array.

```ts
function foo(arr: ReadonlyArray<string>) {
    arr.slice();        // okay
    arr.push("hello!"); // error!
}
```

While it's good practice to use `ReadonlyArray` over `Array` when no mutation is intended, it's often been a pain given that arrays have a nicer syntax.
Specifically, `number[]` is a shorthand version of `Array<number>`, just as `Date[]` is a shorthand for `Array<Date>`.

TypeScript 3.4 introduces a new syntax for `ReadonlyArray` using a new `readonly` modifier for array types.

```ts
function foo(arr: readonly string[]) {
    arr.slice();        // okay
    arr.push("hello!"); // error!
}
```

### `readonly` tuples

TypeScript 3.4 also introduces new support for `readonly` tuples.
We can prefix any tuple type with the `readonly` keyword to make it a `readonly` tuple, much like we now can with array shorthand syntax.
As you might expect, unlike ordinary tuples whose slots could be written to, `readonly` tuples only permit reading from those positions.

```ts
function foo(pair: readonly [string, string]) {
    console.log(pair[0]);   // okay
    pair[1] = "hello!";     // error
}
```

The same way that ordinary tuples are types that extend from `Array` - a tuple with elements of type <code>T<sub>1</sub></code>, <code>T<sub>2</sub></code>, ... <code>T<sub>n</sub></code> extends from <code>Array&lt; T<sub>1</sub> \| T<sub>2</sub> \| ... T<sub>n</sub> &gt;</code> - `readonly` tuples are types that extend from `ReadonlyArray`. So a `readonly` tuple with elements <code>T<sub>1</sub></code>, <code>T<sub>2</sub></code>, ... <code>T<sub>n</sub></code> extends from <code>ReadonlyArray< T<sub>1</sub> \| T<sub>2</sub> | ... T<sub>n</sub> ></code>.

### `readonly` mapped type modifiers and `readonly` arrays

In earlier versions of TypeScript, we generalized mapped types to operate differently on array-like types.
This meant that a mapped type like `Boxify` could work on arrays and tuples alike.

```ts
interface Box<T> { value: T }

type Boxify<T> = {
    [K in keyof T]: Box<T[K]>
}

// { a: Box<string>, b: Box<number> }
type A = Boxify<{ a: string, b: number }>;

// Array<Box<number>>
type B = Boxify<number[]>;

// [Box<string>, Box<number>]
type C = Boxify<[string, boolean]>;
```

Unfortunately, mapped types like the `Readonly` utility type were effectively no-ops on array and tuple types.

```ts
// lib.d.ts
type Readonly<T> = {
    readonly [K in keyof T]: T[K]
}

// How code acted *before* TypeScript 3.4

// { readonly a: string, readonly b: number }
type A = Readonly<{ a: string, b: number }>;

// number[]
type B = Readonly<number[]>;

// [string, boolean]
type C = Readonly<[string, boolean]>;
```

In TypeScript 3.4, the `readonly` modifier in a mapped type will automatically convert array-like types to their corresponding `readonly` counterparts.

```ts
// How code acts now *with* TypeScript 3.4

// { readonly a: string, readonly b: number }
type A = Readonly<{ a: string, b: number }>;

// readonly number[]
type B = Readonly<number[]>;

// readonly [string, boolean]
type C = Readonly<[string, boolean]>;
```

Similarly, you could write a utility type like `Writable` mapped type that strips away `readonly`-ness, and that would convert `readonly` array containers back to their mutable equivalents.

```ts
type Writable<T> = {
    -readonly [K in keyof T]: T[K]
}

// { a: string, b: number }
type A = Writable<{
    readonly a: string;
    readonly b: number
}>;

// number[]
type B = Writable<readonly number[]>;

// [string, boolean]
type C = Writable<readonly [string, boolean]>;
```

### Caveats

Despite its appearance, the `readonly` type modifier can only be used for syntax on array types and tuple types.
It is not a general-purpose type operator.

```ts
let err1: readonly Set<number>; // error!
let err2: readonly Array<boolean>; // error!

let okay: readonly boolean[]; // works fine
```

You can [see more details in the pull request](https://github.com/Microsoft/TypeScript/pull/29435).

## `const` assertions

TypeScript 3.4 introduces a new construct for literal values called *`const`* assertions.
Its syntax is a type assertion with `const` in place of the type name (e.g. `123 as const`).
When we construct new literal expressions with `const` assertions, we can signal to the language that

- no literal types in that expression should be widened (e.g. no going from `"hello"` to `string`)
- object literals get `readonly` properties
- array literals become `readonly` tuples

```ts
// Type '"hello"'
let x = "hello" as const;

// Type 'readonly [10, 20]'
let y = [10, 20] as const;

// Type '{ readonly text: "hello" }'
let z = { text: "hello" } as const;
```

Outside of `.tsx` files, the angle bracket assertion syntax can also be used.

```ts
// Type '"hello"'
let x = <const>"hello";

// Type 'readonly [10, 20]'
let y = <const>[10, 20];

// Type '{ readonly text: "hello" }'
let z = <const>{ text: "hello" };
```

This feature means that types that would otherwise be used just to hint immutability to the compiler can often be omitted.

```ts
// Works with no types referenced or declared.
// We only needed a single const assertion.
function getShapes() {
    let result = [
        { kind: "circle", radius: 100, },
        { kind: "square", sideLength: 50, },
    ] as const;

    return result;
}

for (const shape of getShapes()) {
    // Narrows perfectly!
    if (shape.kind === "circle") {
        console.log("Circle radius", shape.radius);
    }
    else {
        console.log("Square side length", shape.sideLength);
    }
}
```

Notice the above needed no type annotations.
The `const` assertion allowed TypeScript to take the most specific type of the expression.

This can even be used to enable `enum`-like patterns in plain JavaScript code if you choose not to use TypeScript's `enum` construct.

```ts
export const Colors = {
    red: "RED",
    blue: "BLUE",
    green: "GREEN",
} as const;

// or use an 'export default'

export default {
    red: "RED",
    blue: "BLUE",
    green: "GREEN",
} as const;
```

### Caveats

One thing to note is that `const` assertions can only be applied immediately on simple literal expressions.

```ts
// Error! A 'const' assertion can only be applied to a
// to a string, number, boolean, array, or object literal.
let a = (Math.random() < 0.5 ? 0 : 1) as const;

// Works!
let b = Math.random() < 0.5 ?
    0 as const :
    1 as const;
```

Another thing to keep in mind is that `const` contexts don't immediately convert an expression to be fully immutable.

```ts
let arr = [1, 2, 3, 4];

let foo = {
    name: "foo",
    contents: arr,
} as const;

foo.name = "bar";   // error!
foo.contents = [];  // error!

foo.contents.push(5); // ...works!
```

For more details, you can [check out the respective pull request](https://github.com/Microsoft/TypeScript/pull/29510).

## Type-checking for `globalThis`

TypeScript 3.4 introduces support for type-checking ECMAScript's new `globalThis` - a global variable that, well, refers to the global scope.
Unlike the above solutions, `globalThis` provides a standard way for accessing the global scope which can be used across different environments.

```ts
// in a global file:

var abc = 100;

// Refers to 'abc' from above.
globalThis.abc = 200;
```

Note that global variables declared with `let` and `const` don't show up on `globalThis`.

```ts
let answer = 42;

// error! Property 'answer' does not exist on 'typeof globalThis'.
globalThis.answer = 333333;
```

It's also important to note that TypeScript doesn't transform references to `globalThis` when compiling to older versions of ECMAScript.
As such, unless you're targeting evergreen browsers (which already support `globalThis`), you may want to [use an appropriate polyfill](https://github.com/ljharb/globalThis) instead.

For more details on the implementation, see [the feature's pull request](https://github.com/Microsoft/TypeScript/pull/29332).