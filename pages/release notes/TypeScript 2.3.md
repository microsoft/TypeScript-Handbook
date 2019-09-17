## Generators and Iteration for ES5/ES3

*First some ES2016 terminology:*

##### Iterators

[ES2015 introduced `Iterator`](http://www.ecma-international.org/ecma-262/6.0/#sec-iteration), which is an object that exposes three methods, `next`, `return`, and `throw`, as per the following interface:

```ts
interface Iterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}
```

This kind of iterator is useful for iterating over synchronously available values, such as the elements of an Array or the keys of a Map.
An object that supports iteration is said to be "iterable" if it has a `Symbol.iterator` method that returns an `Iterator` object.

The Iterator protocol also defines the target of some of the ES2015 features like `for..of` and spread operator and the array rest in destructuring assignmnets.

##### Generators

[ES2015 also introduced "Generators"](http://www.ecma-international.org/ecma-262/6.0/#sec-generatorfunction-objects), which are functions that can be used to yield partial computation results via the `Iterator` interface and the `yield` keyword.
Generators can also internally delegate calls to another iterable through `yield *`. For example:

```ts
function* f() {
  yield 1;
  yield* [2, 3];
}
```

##### New `--downlevelIteration`

Previously generators were only supported if the target is ES6/ES2015 or later.
Moreover, constructs that operate on the Iterator protocol, e.g. `for..of` were only supported if they operate on arrays for targets below ES6/ES2015.

TypeScript 2.3 adds full support for generators and the Iterator protocol for ES3 and ES5 targets with `--downlevelIteration` flag.

With `--downlevelIteration`, the compiler uses new type check and emit behavior that attempts to call a `[Symbol.iterator]()` method on the iterated object if it is found, and creates a synthetic array iterator over the object if it is not.

> Please note that this requires a native `Symbol.iterator` or `Symbol.iterator` shim at runtime for any non-array values.

`for..of` statements,  Array Destructuring, and Spread elements in Array, Call, and New expressions support `Symbol.iterator` in ES5/E3 if available when using `--downlevelIteration`, but can be used on an Array even if it does not define `Symbol.iterator` at run time or design time.

## Async Iteration

TypeScript 2.3 adds support for the async iterators and generators as described by the current [TC39 proposal](https://github.com/tc39/proposal-async-iteration).

##### Async iterators

The Async Iteration introduces an `AsyncIterator`, which is similar to `Iterator`.
The difference lies in the fact that the `next`, `return`, and `throw` methods of an `AsyncIterator` return a `Promise` for the iteration result, rather than the result itself.
This allows the caller to enlist in an asynchronous notification for the time at which the `AsyncIterator` has advanced to the point of yielding a value.
An `AsyncIterator` has the following shape:

```ts
interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}
```

An object that supports async iteration is said to be "iterable" if it has a `Symbol.asyncIterator` method that returns an `AsyncIterator` object.

##### Async Generators

The [Async Iteration proposal](https://github.com/tc39/proposal-async-iteration) introduces "Async Generators", which are async functions that also can be used to yield partial computation results.
Async Generators can also delegate calls via `yield*` to either an iterable or async iterable:

```ts
async function* g() {
  yield 1;
  await sleep(100);
  yield* [2, 3];
  yield* (async function *() {
    await sleep(100);
    yield 4;
  })();
}
```

As with Generators, Async Generators can only be function declarations, function expressions, or methods of classes or object literals.
Arrow functions cannot be Async Generators. Async Generators require a valid, global `Promise` implementation (either native or an ES2015-compatible polyfill), in addition to a valid `Symbol.asyncIterator` reference (either a native symbol or a shim).

##### The `for-await-of` Statement

Finally, ES2015 introduced the `for..of` statement as a means of iterating over an iterable.
Similarly, the Async Iteration proposal introduces the `for..await..of` statement to iterate over an async iterable:

```ts
async function f() {
  for await (const x of g()) {
     console.log(x);
  }
}
```

The `for..await..of` statement is only legal within an Async Function or Async Generator.

##### Caveats

* Keep in mind that our support for async iterators relies on support for `Symbol.asyncIterator` to exist at runtime. You may need to polyfill `Symbol.asyncIterator`, which for simple purposes can be as simple as: `(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");`
* You also need to include `esnext` in your `--lib` option, to get the `AsyncIterator` declaration if you do not already have it.
* Finally, if your target is ES5 or ES3, you'll also need to set the `--downlevelIterators` flag.

## Generic parameter defaults

TypeScript 2.3 adds support for declaring defaults for generic type parameters.

##### Example

Consider a function that creates a new `HTMLElement`, calling it with no arguments generates a `Div`; you can optionally pass a list of children as well. Previously you would have to define it as:

```ts
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(element: T, children: U[]): Container<T, U[]>;
```

With generic parameter defaults we can reduce it to:

```ts
declare function create<T extends HTMLElement = HTMLDivElement, U = T[]>(element?: T, children?: U): Container<T, U>;
```

A generic parameter default follows the following rules:

* A type parameter is deemed optional if it has a default.
* Required type parameters must not follow optional type parameters.
* Default types for a type parameter must satisfy the constraint for the type parameter, if it exists.
* When specifying type arguments, you are only required to specify type arguments for the required type parameters. Unspecified type parameters will resolve to their default types.
* If a default type is specified and inference cannot choose a candidate, the default type is inferred.
* A class or interface declaration that merges with an existing class or interface declaration may introduce a default for an existing type parameter.
* A class or interface declaration that merges with an existing class or interface declaration may introduce a new type parameter as long as it specifies a default.

## New `--strict` master option

New checks added to TypeScript are often off by default to avoid breaking existing projects.
While avoiding breakage is a good thing, this strategy has the drawback of making it increasingly complex to choose the highest level of type safety, and doing so requires explicit opt-in action on every TypeScript release.
With the `--strict` option it becomes possible to choose maximum type safety with the understanding that additional errors might be reported by newer versions of the compiler as improved type checking features are added.

The new `--strict` compiler option represents the recommended setting of a number of type checking options. Specifically, specifying `--strict` corresponds to specifying all of the following options (and may in the future include more options):

* `--strictNullChecks`
* `--noImplicitAny`
* `--noImplicitThis`
* `--alwaysStrict`

In exact terms, the `--strict` option sets the *default* value for the compiler options listed above.
This means it is still possible to individually control the options.
For example,

```sh
--strict --noImplicitThis false
```

has the effect of turning on all strict options *except* the `--noImplicitThis` option. Using this scheme it is possible to express configurations consisting of *all* strict options except some explicitly listed options.
In other words, it is now possible to default to the highest level of type safety but opt out of certain checks.

Starting with TypeScript 2.3, the default `tsconfig.json` generated by `tsc --init` includes a `"strict": true` setting in the `"compilerOptions"` section.
Thus, new projects started with `tsc --init` will by default have the highest level of type safety enabled.

## Enhanced `--init` output

Along with setting `--strict` on by default, `tsc --init` has an enhanced output. Default `tsconfig.json` files generated by `tsc --init` now include a set of the common compiler options along with their descriptions commented out.
Just un-comment the configuration you like to set to get the desired behavior; we hope the new output simplifies the setting up new projects and keeps configuration files readable as projects grow.

## Errors in .js files with `--checkJs`

By default the TypeScript compiler does not report any errors in .js files including using `--allowJs`.
With TypeScript 2.3 type-checking errors can also be reported in `.js` files with `--checkJs`.

You can skip checking some files by adding `// @ts-nocheck` comment to them; conversely you can choose to check only a few `.js` files by adding `// @ts-check` comment to them without setting `--checkJs`.
You can also ignore errors on specific lines by adding `// @ts-ignore` on the preceding line.

`.js` files are still checked to ensure that they only include standard ECMAScript features; type annotations are only allowed in `.ts` files and are flagged as errors in `.js` files.
JSDoc comments can be used to add some type information to your JavaScript code, see [JSDoc Support documentation](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript) for more details about the supported JSDoc constructs.

See [Type checking JavaScript Files documentation](https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files) for more details.
