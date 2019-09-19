## `strictBindCallApply`

TypeScript 3.2 introduces a new `--strictBindCallApply` compiler option (in the `--strict` family of options) with which the `bind`, `call`, and `apply` methods on function objects are strongly typed and strictly checked.

```ts
function foo(a: number, b: string): string {
    return a + b;
}

let a = foo.apply(undefined, [10]);              // error: too few argumnts
let b = foo.apply(undefined, [10, 20]);          // error: 2nd argument is a number
let c = foo.apply(undefined, [10, "hello", 30]); // error: too many arguments
let d = foo.apply(undefined, [10, "hello"]);     // okay! returns a string
```

This is achieved by introducing two new types, `CallableFunction` and `NewableFunction`, in `lib.d.ts`. These types contain specialized generic method declarations for `bind`, `call`, and `apply` for regular functions and constructor functions, respectively. The declarations use generic rest parameters (see #24897) to capture and reflect parameter lists in a strongly typed manner. In `--strictBindCallApply` mode these declarations are used in place of the (very permissive) declarations provided by type `Function`.

## Caveats

Since the stricter checks may uncover previously unreported errors, this is a breaking change in `--strict` mode.

Additionally, [another caveat](https://github.com/Microsoft/TypeScript/pull/27028#issuecomment-429334450) of this new functionality is that due to certain limitations, `bind`, `call`, and `apply` can't yet fully model generic functions or functions that have overloads.
When using these methods on a generic function, type parameters will be substituted with the empty object type (`{}`), and when used on a function with overloads, only the last overload will ever be modeled.

## Generic spread expressions in object literals

In TypeScript 3.2, object literals now allow generic spread expressions which now produce intersection types, similar to the `Object.assign` function and JSX literals. For example:

```ts
function taggedObject<T, U extends string>(obj: T, tag: U) {
    return { ...obj, tag };  // T & { tag: U }
}

let x = taggedObject({ x: 10, y: 20 }, "point");  // { x: number, y: number } & { tag: "point" }
```

Property assignments and non-generic spread expressions are merged to the greatest extent possible on either side of a generic spread expression. For example:

```ts
function foo1<T>(t: T, obj1: { a: string }, obj2: { b: string }) {
    return { ...obj1, x: 1, ...t, ...obj2, y: 2 };  // { a: string, x: number } & T & { b: string, y: number }
}
```

Non-generic spread expressions continue to be processed as before: Call and construct signatures are stripped, only non-method properties are preserved, and for properties with the same name, the type of the rightmost property is used. This contrasts with intersection types which concatenate call and construct signatures, preserve all properties, and intersect the types of properties with the same name. Thus, spreads of the same types may produce different results when they are created through instantiation of generic types:

```ts
function spread<T, U>(t: T, u: U) {
    return { ...t, ...u };  // T & U
}

declare let x: { a: string, b: number };
declare let y: { b: string, c: boolean };

let s1 = { ...x, ...y };  // { a: string, b: string, c: boolean }
let s2 = spread(x, y);    // { a: string, b: number } & { b: string, c: boolean }
let b1 = s1.b;  // string
let b2 = s2.b;  // number & string
```

## Generic object rest variables and parameters

TypeScript 3.2 also allows destructuring a rest binding from a generic variable. This is achieved by using the predefined `Pick` and `Exclude` helper types from `lib.d.ts`, and using the generic type in question as well as the names of the other bindings in the destructuring pattern.

```ts
function excludeTag<T extends { tag: string }>(obj: T) {
    let { tag, ...rest } = obj;
    return rest;  // Pick<T, Exclude<keyof T, "tag">>
}

const taggedPoint = { x: 10, y: 20, tag: "point" };
const point = excludeTag(taggedPoint);  // { x: number, y: number }
```

## BigInt

BigInts are part of an upcoming proposal in ECMAScript that allow us to model theoretically arbitrarily large integers.
TypeScript 3.2 brings type-checking for BigInts, as well as support for emitting BigInt literals when targeting `esnext`.

BigInt support in TypeScript introduces a new primitive type called the `bigint` (all lowercase).
You can get a `bigint` by calling the `BigInt()` function or by writing out a BigInt literal by adding an `n` to the end of any integer numeric literal:

```ts
let foo: bigint = BigInt(100); // the BigInt function
let bar: bigint = 100n;        // a BigInt literal

// *Slaps roof of fibonacci function*
// This bad boy returns ints that can get *so* big!
function fibonacci(n: bigint) {
    let result = 1n;
    for (let last = 0n, i = 0n; i < n; i++) {
        const current = result;
        result += last;
        last = current;
    }
    return result;
}

fibonacci(10000n)
```

While you might imagine close interaction between `number` and `bigint`, the two are separate domains.

```ts
declare let foo: number;
declare let bar: bigint;

foo = bar; // error: Type 'bigint' is not assignable to type 'number'.
bar = foo; // error: Type 'number' is not assignable to type 'bigint'.
```

As specified in ECMAScript, mixing `number`s and `bigint`s in arithmetic operations is an error.
You'll have to explicitly convert values to `BigInt`s.

```ts
console.log(3.141592 * 10000n);     // error
console.log(3145 * 10n);            // error
console.log(BigInt(3145) * 10n);    // okay!
```

Also important to note is that `bigint`s produce a new string when using the `typeof` operator: the string `"bigint"`.
Thus, TypeScript correctly narrows using `typeof` as you'd expect.

```ts
function whatKindOfNumberIsIt(x: number | bigint) {
    if (typeof x === "bigint") {
        console.log("'x' is a bigint!");
    }
    else {
        console.log("'x' is a floating-point number");
    }
}
```

We'd like to extend a huge thanks to [Caleb Sander](https://github.com/calebsander) for all the work on this feature.
We're grateful for the contribution, and we're sure our users are too!

## Caveats

As we mentioned, BigInt support is only available for the `esnext` target.
It may not be obvious, but because BigInts have different behavior for mathematical operators like `+`, `-`, `*`, etc., providing functionality for older targets where the feature doesn't exist (like `es2017` and below) would involve rewriting each of these operations.
TypeScript would need to dispatch to the correct behavior depending on the type, and so every addition, string concatenation, multiplication, etc. would involve a function call.

For that reason, we have no immediate plans to provide downleveling support.
On the bright side, Node 11 and newer versions of Chrome already support this feature, so you'll be able to use BigInts there when targeting `esnext`.

Certain targets may include a polyfill or BigInt-like runtime object.
For those purposes you may want to add `esnext.bigint` to the `lib` setting in your compiler options.

## Non-unit types as union discriminants

TypeScript 3.2 makes narrowing easier by relaxing rules for what it considers a discriminant property.
Common properties of unions are now considered discriminants as long as they contain *some* singleton type (e.g. a string literal, `null`, or `undefined`), and they contain no generics.

As a result, TypeScript 3.2 considers the `error` property in the following example to be a discriminant, whereas before it wouldn't since `Error` isn't a singleton type.
Thanks to this, narrowing works correctly in the body of the `unwrap` function.

```ts
type Result<T> =
    | { error: Error; data: null }
    | { error: null; data: T };

function unwrap<T>(result: Result<T>) {
    if (result.error) {
        // Here 'error' is non-null
        throw result.error;
    }

    // Now 'data' is non-null
    return result.data;
}
```

## `tsconfig.json` inheritance via Node.js packages

TypeScript 3.2 now resolves `tsconfig.json`s from `node_modules`. When using a bare path for the `"extends"` field in `tsconfig.json`, TypeScript will dive into `node_modules` packages for us.

```json5
{
    "extends": "@my-team/tsconfig-base",
    "include": ["./**/*"]
    "compilerOptions": {
        // Override certain options on a project-by-project basis.
        "strictBindCallApply": false,
    }
}
```

Here, TypeScript will climb up `node_modules` folders looking for a `@my-team/tsconfig-base` package. For each of those packages, TypeScript will first check whether `package.json` contains a `"tsconfig"` field, and if it does, TypeScript will try to load a configuration file from that field. If neither exists, TypeScript will try to read from a `tsconfig.json` at the root. This is similar to the lookup process for `.js` files in packages that Node uses, and the `.d.ts` lookup process that TypeScript already uses.

This feature can be extremely useful for bigger organizations, or projects with lots of distributed dependencies.

## The new `--showConfig` flag

`tsc`, the TypeScript compiler, supports a new flag called `--showConfig`.
When running `tsc --showConfig`, TypeScript will calculate the effective `tsconfig.json` (after calculating options inherited from the `extends` field) and print that out.
This can be useful for diagnosing configuration issues in general.

## `Object.defineProperty` declarations in JavaScript

When writing in JavaScript files (using `allowJs`), TypeScript now recognizes declarations that use `Object.defineProperty`.
This means you'll get better completions, and stronger type-checking when enabling type-checking in JavaScript files (by turning on the `checkJs` option or adding a `// @ts-check` comment to the top of your file).

```js
// @ts-check

let obj = {};
Object.defineProperty(obj, "x", { value: "hello", writable: false });

obj.x.toLowercase();
//    ~~~~~~~~~~~
//    error:
//     Property 'toLowercase' does not exist on type 'string'.
//     Did you mean 'toLowerCase'?

obj.x = "world";
//  ~
//  error:
//   Cannot assign to 'x' because it is a read-only property.
```
