# TypeScript 2.4

## Dynamic Import Expressions

Dynamic `import` expressions are a new feature and part of ECMAScript that allows users to asynchronously request a module at any arbitrary point in your program.

This means that you can conditionally and lazily import other modules and libraries.
For example, here's an `async` function that only imports a utility library when it's needed:

```ts
async function getZipFile(name: string, files: File[]): Promise<File> {
    const zipUtil = await import('./utils/create-zip-file');
    const zipContents = await zipUtil.getContentAsBlob(files);
    return new File(zipContents, name);
}
```

Many bundlers have support for automatically splitting output bundles based on these `import` expressions, so consider using this new feature with the `esnext` module target.

## String Enums

TypeScript 2.4 now allows enum members to contain string initializers.

```ts
enum Colors {
    Red = "RED",
    Green = "GREEN",
    Blue = "BLUE",
}
```

The caveat is that string-initialized enums can't be reverse-mapped to get the original enum member name.
In other words, you can't write `Colors["RED"]` to get the string `"Red"`.

## Improved inference for generics

TypeScript 2.4 introduces a few wonderful changes around the way generics are inferred.

### Return types as inference targets

For one, TypeScript can now make inferences for the return type of a call.
This can improve your experience and catch errors.
Something that now works:

```ts
function arrayMap<T, U>(f: (x: T) => U): (a: T[]) => U[] {
    return a => a.map(f);
}

const lengths: (a: string[]) => number[] = arrayMap(s => s.length);
```

As an example of new errors you might spot as a result:

```ts
let x: Promise<string> = new Promise(resolve => {
    resolve(10);
    //      ~~ Error!
});
```

### Type parameter inference from contextual types

Prior to TypeScript 2.4, in the following example

```ts
let f: <T>(x: T) => T = y => y;
```

`y` would have the type `any`.
This meant the program would type-check, but you could technically do anything with `y`, such as the following:

```ts
let f: <T>(x: T) => T = y => y() + y.foo.bar;
```

That last example isn't actually type-safe.

In TypeScript 2.4, the function on the right side implicitly *gains* type parameters, and `y` is inferred to have the type of that type-parameter.

If you use `y` in a way that the type parameter's constraint doesn't support, you'll correctly get an error.
In this case, the constraint of `T` was (implicitly) `{}`, so the last example will appropriately fail.

### Stricter checking for generic functions

TypeScript now tries to unify type parameters when comparing two single-signature types.
As a result, you'll get stricter checks when relating two generic signatures, and may catch some bugs.

```ts
type A = <T, U>(x: T, y: U) => [T, U];
type B = <S>(x: S, y: S) => [S, S];

function f(a: A, b: B) {
    a = b;  // Error
    b = a;  // Ok
}
```

## Strict contravariance for callback parameters

TypeScript has always compared parameters in a bivariant way.
There are a number of reasons for this, but by-and-large this was not been a huge issue for our users until we saw some of the adverse effects it had with `Promise`s and `Observable`s.

TypeScript 2.4 introduces tightens this up when relating two callback types. For example:

```ts
interface Mappable<T> {
    map<U>(f: (x: T) => U): Mappable<U>;
}

declare let a: Mappable<number>;
declare let b: Mappable<string | number>;

a = b;
b = a;
```

Prior to TypeScript 2.4, this example would succeed.
When relating the types of `map`, TypeScript would bidirectionally relate their parameters (i.e. the type of `f`).
When relating each `f`, TypeScript would also bidirectionally relate the type of *those* parameters.

When relating the type of `map` in TS 2.4, the language will check whether each parameter is a callback type, and if so, it will ensure that those parameters are checked in a contravariant manner with respect to the current relation.

In other words, TypeScript now catches the above bug, which may be a breaking change for some users, but will largely be helpful.

## Weak Type Detection

TypeScript 2.4 introduces the concept of "weak types".
Any type that contains nothing but a set of all-optional properties is considered to be *weak*.
For example, this `Options` type is a weak type:

```ts
interface Options {
    data?: string,
    timeout?: number,
    maxRetries?: number,
}
```

In TypeScript 2.4, it's now an error to assign anything to a weak type when there's no overlap in properties.
For example:

```ts
function sendMessage(options: Options) {
    // ...
}

const opts = {
    payload: "hello world!",
    retryOnFail: true,
}

// Error!
sendMessage(opts);
// No overlap between the type of 'opts' and 'Options' itself.
// Maybe we meant to use 'data'/'maxRetries' instead of 'payload'/'retryOnFail'.
```

You can think of this as TypeScript "toughening up" the weak guarantees of these types to catch what would otherwise be silent bugs.

Since this is a breaking change, you may need to know about the workarounds which are the same as those for strict object literal checks:

1. Declare the properties if they really do exist.
2. Add an index signature to the weak type (i.e. `[propName: string]: {}`).
3. Use a type assertion (i.e. `opts as Options`).
