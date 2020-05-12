This page is all of the release notes combined into a single page. It's long, but comprehensive.

## TypeScript 3.9

* [Improvements in Inference and `Promise.all`](#promise-improvements)
* [Speed Improvements](#speed-improvements)
* [`// @ts-expect-error` Comments](#ts-expect-error-comments)
* [Uncalled Function Checks in Conditional Expressions](#uncalled-in-conditionals)
* [Editor Improvements](#editor-improvements)
    * [CommonJS Auto-Imports in JavaScript](#cjs-auto-imports)
    * [Code Actions Preserve Newlines](#preserve-newlines)
    * [Quick Fixes for Missing Return Expressions](#missing-returns)
    * [Support for "Solution Style" `tsconfig.json` Files](#solution-style-tsconfig)
* [Breaking Changes](#breaking-changes)

## <span id=promise-improvements /> Improvements in Inference and `Promise.all`

Recent versions of TypeScript (around 3.7) have had updates to the declarations of functions like `Promise.all` and `Promise.race`.
Unfortunately, that introduced a few regressions, especially when mixing in values with `null` or `undefined`.

```ts
interface Lion {
    roar(): void
}

interface Seal {
    singKissFromARose(): void
}

async function visitZoo(lionExhibit: Promise<Lion>, sealExhibit: Promise<Seal | undefined>) {
    let [lion, seal] = await Promise.all([lionExhibit, sealExhibit]);
    lion.roar(); // uh oh
//  ~~~~
// Object is possibly 'undefined'.
}
```

This is strange behavior!
The fact that `sealExhibit` contained an `undefined` somehow poisoned type of `lion` to include `undefined`.

Thanks to [a pull request](https://github.com/microsoft/TypeScript/pull/34501) from [Jack Bates](https://github.com/jablko), this has been fixed with improvements in our inference process in TypeScript 3.9.
The above no longer errors.
If you've been stuck on older versions of TypeScript due to issues around `Promise`s, we encourage you to give 3.9 a shot!

### What About the `awaited` Type?

If you've been following our issue tracker and design meeting notes, you might be aware of some work around [a new type operator called `awaited`](https://github.com/microsoft/TypeScript/pull/35998).
This goal of this type operator is to accurately model the way that `Promise` unwrapping works in JavaScript.

We initially anticipated shipping `awaited` in TypeScript 3.9, but as we've run early TypeScript builds with existing codebases, we've realized that the feature needs more design work before we can roll it out to everyone smoothly.
As a result, we've decided to pull the feature out of our main branch until we feel more confident.
We'll be experimenting more with the feature, but we won't be shipping it as part of this release.

## <span id=speed-improvements /> Speed Improvements

TypeScript 3.9 ships with many new speed improvements.
Our team has been focusing on performance after observing extremely poor editing/compilation speed with packages like material-ui and styled-components.
We've dived deep here, with a series of different pull requests that optimize certain pathological cases involving large unions, intersections, conditional types, and mapped types.

* https://github.com/microsoft/TypeScript/pull/36576
* https://github.com/microsoft/TypeScript/pull/36590
* https://github.com/microsoft/TypeScript/pull/36607
* https://github.com/microsoft/TypeScript/pull/36622
* https://github.com/microsoft/TypeScript/pull/36754
* https://github.com/microsoft/TypeScript/pull/36696

Each of these pull requests gains about a 5-10% reduction in compile times on certain codebases.
In total, we believe we've achieved around a 40% reduction in material-ui's compile time!

We also have some changes to file renaming functionality in editor scenarios.
We heard from the Visual Studio Code team that when renaming a file, just figuring out which import statements needed to be updated could take between 5 to 10 seconds.
TypeScript 3.9 addresses this issue by [changing the internals of how the compiler and language service caches file lookups](https://github.com/microsoft/TypeScript/pull/37055).

While there's still room for improvement, we hope this work translates to a snappier experience for everyone!

## <span id=ts-expect-error-comments /> `// @ts-expect-error` Comments

Imagine that we're writing a library in TypeScript and we're exporting some function called `doStuff` as part of our public API.
The function's types declare that it takes two `string`s so that other TypeScript users can get type-checking errors, but it also does a runtime check (maybe only in development builds) to give JavaScript users a helpful error.

```ts
function doStuff(abc: string, xyz: string) {
    assert(typeof abc === "string");
    assert(typeof xyz === "string");

    // do some stuff
}
```

So TypeScript users will get a helpful red squiggle and an error message when they misuse this function, and JavaScript users will get an assertion error.
We'd like to test this behavior, so we'll write a unit test.

```ts
expect(() => {
    doStuff(123, 456);
}).toThrow();
```

Unfortunately if our tests are written in TypeScript, TypeScript will give us an error!

```ts
    doStuff(123, 456);
//          ~~~
// error: Type 'number' is not assignable to type 'string'.
```

That's why TypeScript 3.9 brings a new feature: `// @ts-expect-error` comments.
When a line is prefixed with a `// @ts-expect-error` comment, TypeScript will suppress that error from being reported;
but if there's no error, TypeScript will report that `// @ts-expect-error` wasn't necessary.

As a quick example, the following code is okay

```ts
// @ts-expect-error
console.log(47 * "octopus");
```

while the following code

```ts
// @ts-expect-error
console.log(1 + 1);
```

results in the error

```
Unused '@ts-expect-error' directive.
```

We'd like to extend a big thanks to [Josh Goldberg](https://github.com/JoshuaKGoldberg), the contributor who implemented this feature.
For more information, you can take a look at [the `ts-expect-error` pull request](https://github.com/microsoft/TypeScript/pull/36014).

### <span id=what-about-ts-ignore /> `ts-ignore` or `ts-expect-error`?

In some ways `// @ts-expect-error` can act as a suppression comment, similar to `// @ts-ignore`.
The difference is that `// @ts-ignore` will do nothing if the following line is error-free.

You might be tempted to switch existing `// @ts-ignore` comments over to `// @ts-expect-error`, and you might be wondering which is appropriate for future code.
While it's entirely up to you and your team, we have some ideas of which to pick in certain situations.

Pick `ts-expect-error` if:

* you're writing test code where you actually want the type system to error on an operation
* you expect a fix to be coming in fairly quickly and you just need a quick workaround
* you're in a reasonably-sized project with a proactive team that wants to remove suppression comments as soon affected code is valid again

Pick `ts-ignore` if:

* you have an a larger project and and new errors have appeared in code with no clear owner
* you are in the middle of an upgrade between two different versions of TypeScript, and a line of code errors in one version but not another.
* you honestly don't have the time to decide which of these options is better.

## <span id=uncalled-in-conditionals /> Uncalled Function Checks in Conditional Expressions

In TypeScript 3.7 we introduced *uncalled function checks* to report an error when you've forgotten to call a function.

```ts
function hasImportantPermissions(): boolean {
    // ...
}

// Oops!
if (hasImportantPermissions) {
//  ~~~~~~~~~~~~~~~~~~~~~~~
// This condition will always return true since the function is always defined.
// Did you mean to call it instead?
    deleteAllTheImportantFiles();
}
```

However, this error only applied to conditions in `if` statements.
Thanks to [a pull request](https://github.com/microsoft/TypeScript/pull/36402) from [Alexander Tarasyuk](https://github.com/a-tarasyuk), this feature is also now supported in ternary conditionals (i.e. the `cond ? trueExpr : falseExpr` syntax).

```ts
declare function listFilesOfDirectory(dirPath: string): string[];
declare function isDirectory(): boolean;

function getAllFiles(startFileName: string) {
    const result: string[] = [];
    traverse(startFileName);
    return result;

    function traverse(currentPath: string) {
        return isDirectory ?
        //     ~~~~~~~~~~~
        // This condition will always return true
        // since the function is always defined.
        // Did you mean to call it instead?
            listFilesOfDirectory(currentPath).forEach(traverse) :
            result.push(currentPath);
    }
}
```

https://github.com/microsoft/TypeScript/issues/36048

## <span id=editor-improvements /> Editor Improvements

The TypeScript compiler not only powers the TypeScript editing experience in most major editors, it also powers the JavaScript experience in the Visual Studio family of editors and more.
Using new TypeScript/JavaScript functionality in your editor will differ depending on your editor, but

* Visual Studio Code supports [selecting different versions of TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). Alternatively, there's the [JavaScript/TypeScript Nightly Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) to stay on the bleeding edge (which is typically very stable).
* Visual Studio 2017/2019 have [the SDK installers above] and [MSBuild installs](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild).
* Sublime Text 3 supports [selecting different versions of TypeScript](https://github.com/microsoft/TypeScript-Sublime-Plugin#note-using-different-versions-of-typescript)

### <span id=cjs-auto-imports /> CommonJS Auto-Imports in JavaScript

One great new improvement is in auto-imports in JavaScript files using CommonJS modules.

In older versions, TypeScript always assumed that regardless of your file, you wanted an ECMAScript-style import like

```js
import * as fs from "fs";
```

However, not everyone is targeting ECMAScript-style modules when writing JavaScript files.
Plenty of users still use CommonJS-style `require(...)` imports like so

```js
const fs = require("fs");
```

TypeScript now automatically detects the types of imports you're using to keep your file's style clean and consistent.

<video src="https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/ERkaliGU0AA5anJ1.mp4"></video>

For more details on the change, see [the corresponding pull request](https://github.com/microsoft/TypeScript/pull/37027).

### <span id=preserve-newlines /> Code Actions Preserve Newlines

TypeScript's refactorings and quick fixes often didn't do a great job of preserving newlines.
As a really basic example, take the following code.

```ts
const maxValue = 100;

/*start*/
for (let i = 0; i <= maxValue; i++) {
    // First get the squared value.
    let square = i ** 2;

    // Now print the squared value.
    console.log(square);
}
/*end*/
```

If we highlighted the range from `/*start*/` to `/*end*/` in our editor to extract to a new function, we'd end up with code like the following.

```ts
const maxValue = 100;

printSquares();

function printSquares() {
    for (let i = 0; i <= maxValue; i++) {
        // First get the squared value.
        let square = i ** 2;
        // Now print the squared value.
        console.log(square);
    }
}
```

![Extracting the for loop to a function in older versions of TypeScript. A newline is not preserved.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/printSquaresWithoutNewlines-3.9.gif.gif)

That's not ideal - we had a blank line between each statement in our `for` loop, but the refactoring got rid of it!
TypeScript 3.9 does a little more work to preserve what we write.

```ts
const maxValue = 100;

printSquares();

function printSquares() {
    for (let i = 0; i <= maxValue; i++) {
        // First get the squared value.
        let square = i ** 2;

        // Now print the squared value.
        console.log(square);
    }
}
```

![Extracting the for loop to a function in TypeScript 3.9. A newline is preserved.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/printSquaresWithNewlines-3.9.gif.gif)

You can see more about the implementation [in this pull request](https://github.com/microsoft/TypeScript/pull/36688)

### <span id=missing-returns /> Quick Fixes for Missing Return Expressions

There are occasions where we might forget to return the value of the last statement in a function, especially when adding curly braces to arrow functions.

```ts
// before
let f1 = () => 42

// oops - not the same!
let f2 = () => { 42 }
```

Thanks to [a pull request](https://github.com/microsoft/TypeScript/pull/26434) from community member [Wenlu Wang](https://github.com/Kingwl), TypeScript can provide a quick-fix to add missing `return` statements, remove curly braces, or add parentheses to arrow function bodies that look suspiciously like object literals.

![TypeScript fixing an error where no expression is returned by adding a `return` statement or removing curly braces.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/04/missingReturnValue-3-9.gif)

### <span id=solution-style-tsconfig /> Support for "Solution Style" `tsconfig.json` Files

Editors need to figure out which configuration file a file belongs to so that it can apply the appropriate options and figure out which other files are included in the current "project".
By default, editors powered by TypeScript's language server do this by walking up each parent directory to find a `tsconfig.json`.

One case where this slightly fell over is when a `tsconfig.json` simply existed to reference other `tsconfig.json` files.

```json5
// tsconfig.json
{
    "files": [],
    "references": [
        { "path": "./tsconfig.shared.json" },
        { "path": "./tsconfig.frontend.json" },
        { "path": "./tsconfig.backend.json" },
    ]
}
```

This file that really does nothing but manage other project files is often called a "solution" in some environments.
Here, none of these `tsconfig.*.json` files get picked up by the server, but we'd really like the language server to understand that the current `.ts` file probably belongs to one of the mentioned projects in this root `tsconfig.json`.

TypeScript 3.9 adds support to editing scenarios for this configuration.
For more details, take a look at [the pull request that added this functionality](https://github.com/microsoft/TypeScript/pull/37239).

## <span id=breaking-changes /> Breaking Changes

### Parsing Differences in Optional Chaining and Non-Null Assertions

TypeScript recently implemented the optional chaining operator, but we've received user feedback that the behavior of optional chaining (`?.`) with the non-null assertion operator (`!`) is extremely counter-intuitive.

Specifically, in previous versions, the code

```ts
foo?.bar!.baz
```

was interpreted to be equivalent to the following JavaScript.

```js
(foo?.bar).baz
```

In the above code the parentheses stop the "short-circuiting" behavior of optional chaining, so if `foo` is `undefined`, accessing `baz` will cause a runtime error.

The Babel team who pointed this behavior out, and most users who provided feedback to us, believe that this behavior is wrong.
We do too!
The thing we heard the most was that the `!` operator should just "disappear" since the intent was to remove `null` and `undefined` from the type of `bar`.

In other words, most people felt that the original snippet should be interpreted as

```js
foo?.bar.baz
```

which just evaluates to `undefined` when `foo` is `undefined`.

This is a breaking change, but we believe most code was written with the new interpretation in mind.
Users who want to revert to the old behavior can add explicit parentheses around the left side of the `!` operator.

```ts
(foo?.bar)!.baz
```

### `}` and `>` are Now Invalid JSX Text Characters

The JSX Specification forbids the use of the `}` and `>` characters in text positions.
TypeScript and Babel have both decided to enforce this rule to be more comformant.
The new way to insert these characters is to use an HTML escape code (e.g. `<span> 2 &gt 1 </div>`) or insert an expression with a string literal (e.g. `<span> 2 {">"} 1 </div>`).

Luckily, thanks to the [pull request](https://github.com/microsoft/TypeScript/pull/36636) enforcing this from [Brad Zacher](https://github.com/bradzacher), you'll get an error message along the lines of

```
Unexpected token. Did you mean `{'>'}` or `&gt;`?
Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
```

For example:

```tsx
let directions = <span>Navigate to: Menu Bar > Tools > Options</div>
//                                           ~       ~
// Unexpected token. Did you mean `{'>'}` or `&gt;`?
```

That error message came with a handy quick fix, and thanks to [Alexander Tarasyuk](https://github.com/a-tarasyuk), [you can apply these changes in bulk](https://github.com/microsoft/TypeScript/pull/37436) if you have a lot of errors.

### Stricter Checks on Intersections and Optional Properties

Generally, an intersection type like `A & B` is assignable to `C` if either `A` or `B` is assignable to `C`; however, sometimes that has problems with optional properties.
For example, take the following:

```ts
interface A {
    a: number; // notice this is 'number'
}

interface B {
    b: string;
}

interface C {
    a?: boolean; // notice this is 'boolean'
    b: string;
}

declare let x: A & B;
declare let y: C;

y = x;
```

In previous versions of TypeScript, this was allowed because while `A` was totally incompatible with `C`, `B` *was* compatible with `C`.

In TypeScript 3.9, so long as every type in an intersection is a concrete object type, the type system will consider all of the properties at once.
As a result, TypeScript will see that the `a` property of `A & B` is incompatible with that of `C`:

```
Type 'A & B' is not assignable to type 'C'.
  Types of property 'a' are incompatible.
    Type 'number' is not assignable to type 'boolean | undefined'.
```

For more information on this change, [see the corresponding pull request](https://github.com/microsoft/TypeScript/pull/37195).

### Intersections Reduced By Discriminant Properties

There are a few cases where you might end up with types that describe values that just don't exist.
For example

```ts
declare function smushObjects<T, U>(x: T, y: U): T & U;

interface Circle {
    kind: "circle";
    radius: number;
}

interface Square {
    kind: "square";
    sideLength: number;
}

declare let x: Circle;
declare let y: Square;

let z = smushObjects(x, y);
console.log(z.kind);
```

This code is slightly weird because there's really no way to create an intersection of a `Circle` and a `Square` - they have two incompatible `kind` fields.
In previous versions of TypeScript, this code was allowed and the type of `kind` itself was `never` because `"circle" & "square"` described a set of values that could `never` exist.

In TypeScript 3.9, the type system is more aggressive here - it notices that it's impossible to intersect `Circle` and `Square` because of their `kind` properties.
So instead of collapsing the type of `z.kind` to `never`, it collapses the type of `z` itself (`Circle & Square`) to `never`.
That means the above code now errors with:

```
Property 'kind' does not exist on type 'never'.
```

Most of the breaks we observed seem to correspond with slightly incorrect type declarations.
For more details, [see the original pull request](https://github.com/microsoft/TypeScript/pull/36696).

### Getters/Setters are No Longer Enumerable

In older versions of TypeScript, `get` and `set` accessors in classes were emitted in a way that made them enumerable; however, this wasn't compliant with the ECMAScript specification which states that they must be non-enumerable.
As a result, TypeScript code that targeted ES5 and ES2015 could differ in behavior.

Thanks to [a pull request](https://github.com/microsoft/TypeScript/pull/32264) from GitHub user [pathurs](https://github.com/pathurs), TypeScript 3.9 now conforms more closely with ECMAScript in this regard.

### Type Parameters That Extend `any` No Longer Act as `any`

In previous versions of TypeScript, a type parameter constrained to `any` could be treated as `any`.

```ts
function foo<T extends any>(arg: T) {
    arg.spfjgerijghoied; // no error!
}
```

This was an oversight, so TypeScript 3.9 takes a more conservative approach and issues an error on these questionable operations.

```ts
function foo<T extends any>(arg: T) {
    arg.spfjgerijghoied;
    //  ~~~~~~~~~~~~~~~
    // Property 'spfjgerijghoied' does not exist on type 'T'.
}
```

### `export *` is Always Retained

In previous TypeScript versions, declarations like `export * from "foo"` would be dropped in our JavaScript output if `foo` didn't export any values.
This sort of emit is problematic because it's type-directed and can't be emulated by Babel.
TypeScript 3.9 will always emit these `export *` declarations.
In practice, we don't expect this to break much existing code.


## TypeScript 3.8

* [Type-Only Imports and Exports](#type-only-imports-exports)
* [ECMAScript Private Fields](#ecmascript-private-fields)
* [`export * as ns` Syntax](#export-star-as-namespace-syntax)
* [Top-Level `await`](#top-level-await)
* [JSDoc Property Modifiers](#jsdoc-modifiers)
* [Better Directory Watching on Linux and `watchOptions`](#better-directory-watching)
* ["Fast and Loose" Incremental Checking](#assume-direct-dependencies)

## <span id="type-only-imports-exports" /> Type-Only Imports and Export

This feature is something most users may never have to think about; however, if you've hit issues under `--isolatedModules`, TypeScript's `transpileModule` API, or Babel, this feature might be relevant.

TypeScript 3.8 adds a new syntax for type-only imports and exports.

```ts
import type { SomeThing } from "./some-module.js";

export type { SomeThing };
```

`import type` only imports declarations to be used for type annotations and declarations.
It *always* gets fully erased, so there's no remnant of it at runtime.
Similarly, `export type` only provides an export that can be used for type contexts, and is also erased from TypeScript's output.

It's important to note that classes have a value at runtime and a type at design-time, and the use is context-sensitive.
When using `import type` to import a class, you can't do things like extend from it.

```ts
import type { Component } from "react";

interface ButtonProps {
    // ...
}

class Button extends Component<ButtonProps> {
    //               ~~~~~~~~~
    // error! 'Component' only refers to a type, but is being used as a value here.

    // ...
}
```

If you've used Flow before, the syntax is fairly similar.
One difference is that we've added a few restrictions to avoid code that might appear ambiguous.

```ts
// Is only 'Foo' a type? Or every declaration in the import?
// We just give an error because it's not clear.

import type Foo, { Bar, Baz } from "some-module";
//     ~~~~~~~~~~~~~~~~~~~~~~
// error! A type-only import can specify a default import or named bindings, but not both.
```

In conjunction with `import type`, TypeScript 3.8 also adds a new compiler flag to control what happens with imports that won't be utilized at runtime: `importsNotUsedAsValues`.
This flag takes 3 different values:

* `remove`: this is today's behavior of dropping these imports. It's going to continue to be the default, and is a non-breaking change.
* `preserve`: this *preserves* all imports whose values are never used. This can cause imports/side-effects to be preserved.
* `error`: this preserves all imports (the same as the `preserve` option), but will error when a value import is only used as a type. This might be useful if you want to ensure no values are being accidentally imported, but still make side-effect imports explicit.

For more information about the feature, you can [take a look at the pull request](https://github.com/microsoft/TypeScript/pull/35200), and [relevant changes](https://github.com/microsoft/TypeScript/pull/36092/) around broadening where imports from an `import type` declaration can be used.

## <span id="ecmascript-private-fields" /> ECMAScript Private Fields

TypeScript 3.8 brings support for ECMAScript's private fields, part of the [stage-3 class fields proposal](https://github.com/tc39/proposal-class-fields/).

```ts
class Person {
    #name: string

    constructor(name: string) {
        this.#name = name;
    }

    greet() {
        console.log(`Hello, my name is ${this.#name}!`);
    }
}

let jeremy = new Person("Jeremy Bearimy");

jeremy.#name
//     ~~~~~
// Property '#name' is not accessible outside class 'Person'
// because it has a private identifier.
```

Unlike regular properties (even ones declared with the `private` modifier), private fields have a few rules to keep in mind.
Some of them are:

* Private fields start with a `#` character. Sometimes we call these *private names*.
* Every private field name is uniquely scoped to its containing class.
* TypeScript accessibility modifiers like `public` or `private` can't be used on private fields.
* Private fields can't be accessed or even detected outside of the containing class - even by JS users! Sometimes we call this *hard privacy*.

Apart from "hard" privacy, another benefit of private fields is that uniqueness we just mentioned.
For example, regular property declarations are prone to being overwritten in subclasses.

```ts
class C {
    foo = 10;

    cHelper() {
        return this.foo;
    }
}

class D extends C {
    foo = 20;

    dHelper() {
        return this.foo;
    }
}

let instance = new D();
// 'this.foo' refers to the same property on each instance.
console.log(instance.cHelper()); // prints '20'
console.log(instance.dHelper()); // prints '20'
```

With private fields, you'll never have to worry about this, since each field name is unique to the containing class.

```ts
class C {
    #foo = 10;

    cHelper() {
        return this.#foo;
    }
}

class D extends C {
    #foo = 20;

    dHelper() {
        return this.#foo;
    }
}

let instance = new D();
// 'this.#foo' refers to a different field within each class.
console.log(instance.cHelper()); // prints '10'
console.log(instance.dHelper()); // prints '20'
```

Another thing worth noting is that accessing a private field on any other type will result in a `TypeError`!

```ts
class Square {
    #sideLength: number;

    constructor(sideLength: number) {
        this.#sideLength = sideLength;
    }

    equals(other: any) {
        return this.#sideLength === other.#sideLength;
    }
}

const a = new Square(100);
const b = { sideLength: 100 };

// Boom!
// TypeError: attempted to get private field on non-instance
// This fails because 'b' is not an instance of 'Square'.
console.log(a.equals(b));
```

Finally, for any plain `.js` file users, private fields *always* have to be declared before they're assigned to.

```js
class C {
    // No declaration for '#foo'
    // :(

    constructor(foo: number) {
        // SyntaxError!
        // '#foo' needs to be declared before writing to it.
        this.#foo = foo;
    }
}
```

JavaScript has always allowed users to access undeclared properties, whereas TypeScript has always required declarations for class properties.
With private fields, declarations are always needed regardless of whether we're working in `.js` or `.ts` files.

```js
class C {
    /** @type {number} */
    #foo;

    constructor(foo: number) {
        // This works.
        this.#foo = foo;
    }
}
```

For more information about the implementation, you can [check out the original pull request](https://github.com/Microsoft/TypeScript/pull/30829)

### Which should I use?

We've already received many questions on which type of privates you should use as a TypeScript user: most commonly, "should I use the `private` keyword, or ECMAScript's hash/pound (`#`) private fields?"
It depends!

When it comes to properties, TypeScript's `private` modifiers are fully erased - that means that at runtime, it acts entirely like a normal property and there's no way to tell that it was declared with a `private modifier.
When using the `private` keyword, privacy is only enforced at compile-time/design-time, and for JavaScript consumers it's entirely intent-based.

```ts
class C {
    private foo = 10;
}

// This is an error at compile time,
// but when TypeScript outputs .js files,
// it'll run fine and print '10'.
console.log(new C().foo);    // prints '10'
//                  ~~~
// error! Property 'foo' is private and only accessible within class 'C'.

// TypeScript allows this at compile-time
// as a "work-around" to avoid the error.
console.log(new C()["foo"]); // prints '10'
```

The upside is that this sort of "soft privacy" can help your consumers temporarily work around not having access to some API, and also works in any runtime.

On the other hand, ECMAScript's `#` privates are completely inaccessible outside of the class.

```ts
class C {
    #foo = 10;
}

console.log(new C().#foo); // SyntaxError
//                  ~~~~
// TypeScript reports an error *and*
// this won't work at runtime!

console.log(new C()["#foo"]); // prints undefined
//          ~~~~~~~~~~~~~~~
// TypeScript reports an error under 'noImplicitAny',
// and this prints 'undefined'.
```

This hard privacy is really useful for strictly ensuring that nobody can take use of any of your internals.
If you're a library author, removing or renaming a private field should never cause a breaking change.

As we mentioned, another benefit is that subclassing can be easier with ECMAScript's `#` privates because they *really* are private.
When using ECMAScript `#` private fields, no subclass ever has to worry about collisions in field naming.
When it comes to TypeScript's `private` property declarations, users still have to be careful not to trample over properties declared in superclasses.

One more thing to think about is where you intend for your code to run.
TypeScript currently can't support this feature unless targeting ECMAScript 2015 (ES6) targets or higher.
This is because our downleveled implementation uses `WeakMap`s to enforce privacy, and `WeakMap`s can't be polyfilled in a way that doesn't cause memory leaks.
In contrast, TypeScript's `private`-declared properties work with all targets - even ECMAScript 3!

A final consideration might be speed: `private` properties are no different from any other property, so accessing them is as fast as any other property access no matter which runtime you target.
In contrast, because `#` private fields are downleveled using `WeakMap`s, they may be slower to use.
While some runtimes might optimize their actual implementations of `#` private fields, and even have speedy `WeakMap` implementations, that might not be the case in all runtimes.

## <span id="export-star-as-namespace-syntax" /> `export * as ns` Syntax

It's often common to have a single entry-point that exposes all the members of another module as a single member.

```ts
import * as utilities from "./utilities.js";
export { utilities };
```

This is so common that ECMAScript 2020 recently added a new syntax to support this pattern!

```ts
export * as utilities from "./utilities.js";
```

This is a nice quality-of-life improvement to JavaScript, and TypeScript 3.8 implements this syntax.
When your module target is earlier than `es2020`, TypeScript will output something along the lines of the first code snippet.

## <span id="top-level-await" /> Top-Level `await`

TypeScript 3.8 provides support for a handy upcoming ECMAScript feature called "top-level `await`".

JavaScript users often introduce an `async` function in order to use `await`, and then immediately called the function after defining it.

```js
async function main() {
    const response = await fetch("...");
    const greeting = await response.text();
    console.log(greeting);
}

main()
    .catch(e => console.error(e))
```

This is because previously in JavaScript (along with most other languages with a similar feature), `await` was only allowed within the body of an `async` function.
However, with top-level `await`, we can use `await` at the top level of a module.

```ts
const response = await fetch("...");
const greeting = await response.text();
console.log(greeting);

// Make sure we're a module
export {};
```

Note there's a subtlety: top-level `await` only works at the top level of a *module*, and files are only considered modules when TypeScript finds an `import` or an `export`.
In some basic cases, you might need to write out `export {}` as some boilerplate to make sure of this.

Top level `await` may not work in all environments where you might expect at this point.
Currently, you can only use top level `await` when the `target` compiler option is `es2017` or above, and `module` is `esnext` or `system`.
Support within several environments and bundlers may be limited or may require enabling experimental support.

For more information on our implementation, you can [check out the original pull request](https://github.com/microsoft/TypeScript/pull/35813).

## <span id="es2020-for-target-and-module" /> `es2020` for `target` and `module`

TypeScript 3.8 supports `es2020` as an option for `module` and `target`.
This will preserve newer ECMAScript 2020 features like optional chaining, nullish coalescing, `export * as ns`, and dynamic `import(...)` syntax.
It also means `bigint` literals now have a stable `target` below `esnext`.

## <span id="jsdoc-modifiers" /> JSDoc Property Modifiers

TypeScript 3.8 supports JavaScript files by turning on the `allowJs` flag, and also supports *type-checking* those JavaScript files via the `checkJs` option or by adding a `// @ts-check` comment to the top of your `.js` files.

Because JavaScript files don't have dedicated syntax for type-checking, TypeScript leverages JSDoc.
TypeScript 3.8 understands a few new JSDoc tags for properties.

First are the accessibility modifiers: `@public`, `@private`, and `@protected`.
These tags work exactly like `public`, `private`, and `protected` respectively work in TypeScript.

```js
// @ts-check

class Foo {
    constructor() {
        /** @private */
        this.stuff = 100;
    }

    printStuff() {
        console.log(this.stuff);
    }
}

new Foo().stuff;
//        ~~~~~
// error! Property 'stuff' is private and only accessible within class 'Foo'.
```

* `@public` is always implied and can be left off, but means that a property can be reached from anywhere.
* `@private` means that a property can only be used within the containing class.
* `@protected` means that a property can only be used within the containing class, and all derived subclasses, but not on dissimilar instances of the containing class.

Next, we've also added the `@readonly` modifier to ensure that a property is only ever written to during initialization.

```js
// @ts-check

class Foo {
    constructor() {
        /** @readonly */
        this.stuff = 100;
    }

    writeToStuff() {
        this.stuff = 200;
        //   ~~~~~
        // Cannot assign to 'stuff' because it is a read-only property.
    }
}

new Foo().stuff++;
//        ~~~~~
// Cannot assign to 'stuff' because it is a read-only property.
```

## <span id="better-directory-watching" /> Better Directory Watching on Linux and `watchOptions`

TypeScript 3.8 ships a new strategy for watching directories, which is crucial for efficiently picking up changes to `node_modules`.

For some context, on operating systems like Linux, TypeScript installs directory watchers (as opposed to file watchers) on `node_modules` and many of its subdirectories to detect changes in dependencies.
This is because the number of available file watchers is often eclipsed by the of files in `node_modules`, whereas there are way fewer directories to track.

Older versions of TypeScript would *immediately* install directory watchers on folders, and at startup that would be fine; however, during an npm install, a lot of activity will take place within `node_modules` and that can overwhelm TypeScript, often slowing editor sessions to a crawl.
To prevent this, TypeScript 3.8 waits slightly before installing directory watchers to give these highly volatile directories some time to stabilize.

Because every project might work better under different strategies, and this new approach might not work well for your workflows, TypeScript 3.8 introduces a new `watchOptions` field in `tsconfig.json` and `jsconfig.json` which allows users to tell the compiler/language service which watching strategies should be used to keep track of files and directories.

```json5
{
    // Some typical compiler options
    "compilerOptions": {
        "target": "es2020",
        "moduleResolution": "node",
        // ...
    },

    // NEW: Options for file/directory watching
    "watchOptions": {
        // Use native file system events for files and directories
        "watchFile": "useFsEvents",
        "watchDirectory": "useFsEvents",

        // Poll files for updates more frequently
        // when they're updated a lot.
        "fallbackPolling": "dynamicPriority"
    }
}
```

`watchOptions` contains 4 new options that can be configured:

* `watchFile`: the strategy for how individual files are watched. This can be set to
    * `fixedPollingInterval`: Check every file for changes several times a second at a fixed interval.
    * `priorityPollingInterval`: Check every file for changes several times a second, but use heuristics to check certain types of files less frequently than others.
    * `dynamicPriorityPolling`: Use a dynamic queue where less-frequently modified files will be checked less often.
    * `useFsEvents` (the default): Attempt to use the operating system/file system's native events for file changes.
    * `useFsEventsOnParentDirectory`: Attempt to use the operating system/file system's native events to listen for changes on a file's containing directories. This can use fewer file watchers, but might be less accurate.
* `watchDirectory`: the strategy for how entire directory trees are watched under systems that lack recursive file-watching functionality. This can be set to:
    * `fixedPollingInterval`: Check every directory for changes several times a second at a fixed interval.
    * `dynamicPriorityPolling`: Use a dynamic queue where less-frequently modified directories will be checked less often.
    * `useFsEvents` (the default): Attempt to use the operating system/file system's native events for directory changes.
* `fallbackPolling`: when using file system events, this option specifies the polling strategy that gets used when the system runs out of native file watchers and/or doesn't support native file watchers. This can be set to
    * `fixedPollingInterval`: *(See above.)*
    * `priorityPollingInterval`: *(See above.)*
    * `dynamicPriorityPolling`: *(See above.)*
* `synchronousWatchDirectory`: Disable deferred watching on directories. Deferred watching is useful when lots of file changes might occur at once (e.g. a change in `node_modules` from running `npm install`), but you might want to disable it with this flag for some less-common setups.

For more information on these changes, [head over to GitHub to see the pull request](https://github.com/microsoft/TypeScript/pull/35615) to read more.

## <span id="assume-direct-dependencies" /> "Fast and Loose" Incremental Checking

TypeScript 3.8 introduces a new compiler option called `assumeChangesOnlyAffectDirectDependencies`.
When this option is enabled, TypeScript will avoid rechecking/rebuilding all truly possibly-affected files, and only recheck/rebuild files that have changed as well as files that directly import them.

For example, consider a file `fileD.ts` that imports `fileC.ts` that imports `fileB.ts` that imports `fileA.ts` as follows:

```
fileA.ts <- fileB.ts <- fileC.ts <- fileD.ts
```

In `--watch` mode, a change in `fileA.ts` would typically mean that TypeScript would need to at least re-check `fileB.ts`, `fileC.ts`, and `fileD.ts`.
Under `assumeChangesOnlyAffectDirectDependencies`, a change in `fileA.ts` means that only `fileA.ts` and `fileB.ts` need to be re-checked.

In a codebase like Visual Studio Code, this reduced rebuild times for changes in certain files from about 14 seconds to about 1 second.
While we don't necessarily recommend this option for all codebases, you might be interested if you have an extremely large codebase and are willing to defer full project errors until later (e.g. a dedicated build via a `tsconfig.fullbuild.json` or in CI).

For more details, you can [see the original pull request](https://github.com/microsoft/TypeScript/pull/35711).


## TypeScript 3.7

## Optional Chaining

[Playground](/play/#example/optional-chaining)

Optional chaining is [issue #16](https://github.com/microsoft/TypeScript/issues/16) on our issue tracker. For context, there have been over 23,000 issues on the TypeScript issue tracker since then. 

At its core, optional chaining lets us write code where TypeScript can immediately stop running some expressions if we run into a `null` or `undefined`.
The star of the show in optional chaining is the new `?.` operator for *optional property accesses*.
When we write code like

```ts
let x = foo?.bar.baz();
```

this is a way of saying that when `foo` is defined, `foo.bar.baz()` will be computed; but when `foo` is `null` or `undefined`, stop what we're doing and just return `undefined`."

More plainly, that code snippet is the same as writing the following.

```ts
let x = (foo === null || foo === undefined) ?
    undefined :
    foo.bar.baz();
```

Note that if `bar` is `null` or `undefined`, our code will still hit an error accessing `baz`.
Likewise, if `baz` is `null` or `undefined`, we'll hit an error at the call site.
`?.` only checks for whether the value on the *left* of it is `null` or `undefined` - not any of the subsequent properties.

You might find yourself using `?.` to replace a lot of code that performs repetitive nullish checks using the `&&` operator.

```ts
// Before
if (foo && foo.bar && foo.bar.baz) {
    // ...
}

// After-ish
if (foo?.bar?.baz) {
    // ...
}
```

Keep in mind that `?.` acts differently than those `&&` operations since `&&` will act specially on "falsy" values (e.g. the empty string, `0`, `NaN`, and, well, `false`), but this is an intentional feature of the construct.
It doesn't short-circuit on valid data like `0` or empty strings.

Optional chaining also includes two other operations.
First there's the *optional element access* which acts similarly to optional property accesses, but allows us to access non-identifier properties (e.g. arbitrary strings, numbers, and symbols):

```ts
/**
 * Get the first element of the array if we have an array.
 * Otherwise return undefined.
 */
function tryGetFirstElement<T>(arr?: T[]) {
    return arr?.[0];
    // equivalent to
    //   return (arr === null || arr === undefined) ?
    //       undefined :
    //       arr[0];
}
```

There's also *optional call*, which allows us to conditionally call expressions if they're not `null` or `undefined`.

```ts
async function makeRequest(url: string, log?: (msg: string) => void) {
    log?.(`Request started at ${new Date().toISOString()}`);
    // roughly equivalent to
    //   if (log != null) {
    //       log(`Request started at ${new Date().toISOString()}`);
    //   }

    const result = (await fetch(url)).json();

    log?.(`Request finished at at ${new Date().toISOString()}`);

    return result;
}
```

The "short-circuiting" behavior that optional chains have is limited property accesses, calls, element accesses - it doesn't expand any further out from these expressions.
In other words,

```ts
let result = foo?.bar / someComputation()
```

doesn't stop the division or `someComputation()` call from occurring.
It's equivalent to

```ts
let temp = (foo === null || foo === undefined) ?
    undefined :
    foo.bar;

let result = temp / someComputation();
```

That might result in dividing `undefined`, which is why in `strictNullChecks`, the following is an error.

```ts
function barPercentage(foo?: { bar: number }) {
    return foo?.bar / 100;
    //     ~~~~~~~~
    // Error: Object is possibly undefined.
}
```

More more details, you can [read up on the proposal](https://github.com/tc39/proposal-optional-chaining/) and [view the original pull request](https://github.com/microsoft/TypeScript/pull/33294).

## Nullish Coalescing

[Playground](/play/#example/nullish-coalescing)

The *nullish coalescing operator* is another upcoming ECMAScript feature that goes hand-in-hand with optional chaining, and which our team has been involved with championing in TC39.

You can think of this feature - the `??` operator - as a way to "fall back" to a default value when dealing with `null` or `undefined`.
When we write code like

```ts
let x = foo ?? bar();
```

this is a new way to say that the value `foo` will be used when it's "present";
but when it's `null` or `undefined`, calculate `bar()` in its place.

Again, the above code is equivalent to the following.

```ts
let x = (foo !== null && foo !== undefined) ?
    foo :
    bar();
```

The `??` operator can replace uses of `||` when trying to use a default value.
For example, the following code snippet tries to fetch the volume that was last saved in [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (if it ever was);
however, it has a bug because it uses `||`.

```ts
function initializeAudio() {
    let volume = localStorage.volume || 0.5

    // ...
}
```

When `localStorage.volume` is set to `0`, the page will set the volume to `0.5` which is unintended.
`??` avoids some unintended behavior from `0`, `NaN` and `""` being treated as falsy values.

We owe a large thanks to community members [Wenlu Wang](https://github.com/Kingwl) and [Titian Cernicova Dragomir](https://github.com/dragomirtitian) for implementing this feature!
For more details, [check out their pull request](https://github.com/microsoft/TypeScript/pull/32883) and [the nullish coalescing proposal repository](https://github.com/tc39/proposal-nullish-coalescing/).

## Assertion Functions

[Playground](/play/#example/assertion-functions)

There's a specific set of functions that `throw` an error if something unexpected happened.
They're called "assertion" functions.
As an example, Node.js has a dedicated function for this called `assert`.

```js
assert(someValue === 42);
```

In this example if `someValue` isn't equal to `42`, then `assert` will throw an `AssertionError`.

Assertions in JavaScript are often used to guard against improper types being passed in.
For example,

```js
function multiply(x, y) {
    assert(typeof x === "number");
    assert(typeof y === "number");

    return x * y;
}
```

Unfortunately in TypeScript these checks could never be properly encoded.
For loosely-typed code this meant TypeScript was checking less, and for slightly conservative code it often forced users to use type assertions.

```ts
function yell(str) {
    assert(typeof str === "string");

    return str.toUppercase();
    // Oops! We misspelled 'toUpperCase'.
    // Would be great if TypeScript still caught this!
}
```

The alternative was to instead rewrite the code so that the language could analyze it, but this isn't convenient.

```ts
function yell(str) {
    if (typeof str !== "string") {
        throw new TypeError("str should have been a string.")
    }
    // Error caught!
    return str.toUppercase();
}
```

Ultimately the goal of TypeScript is to type existing JavaScript constructs in the least disruptive way.
For that reason, TypeScript 3.7 introduces a new concept called "assertion signatures" which model these assertion functions.

The first type of assertion signature models the way that Node's `assert` function works.
It ensures that whatever condition is being checked must be true for the remainder of the containing scope.

```ts
function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new AssertionError(msg)
    }
}
```

`asserts condition` says that whatever gets passed into the `condition` parameter must be true if the `assert` returns (because otherwise it would throw an error).
That means that for the rest of the scope, that condition must be truthy.
As an example, using this assertion function means we *do* catch our original `yell` example.

```ts
function yell(str) {
    assert(typeof str === "string");

    return str.toUppercase();
    //         ~~~~~~~~~~~
    // error: Property 'toUppercase' does not exist on type 'string'.
    //        Did you mean 'toUpperCase'?
}

function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new AssertionError(msg)
    }
}
```

The other type of assertion signature doesn't check for a condition, but instead tells TypeScript that a specific variable or property has a different type.

```ts
function assertIsString(val: any): asserts val is string {
    if (typeof val !== "string") {
        throw new AssertionError("Not a string!");
    }
}
```

Here `asserts val is string` ensures that after any call to `assertIsString`, any variable passed in will be known to be a `string`.

```ts
function yell(str: any) {
    assertIsString(str);

    // Now TypeScript knows that 'str' is a 'string'.

    return str.toUppercase();
    //         ~~~~~~~~~~~
    // error: Property 'toUppercase' does not exist on type 'string'.
    //        Did you mean 'toUpperCase'?
}
```

These assertion signatures are very similar to writing type predicate signatures:

```ts
function isString(val: any): val is string {
    return typeof val === "string";
}

function yell(str: any) {
    if (isString(str)) {
        return str.toUppercase();
    }
    throw "Oops!";
}
```

And just like type predicate signatures, these assertion signatures are incredibly expressive.
We can express some fairly sophisticated ideas with these.

```ts
function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
    if (val === undefined || val === null) {
        throw new AssertionError(
            `Expected 'val' to be defined, but received ${val}`
        );
    }
}
```

To read up more about assertion signatures, [check out the original pull request](https://github.com/microsoft/TypeScript/pull/32695).

## Better Support for `never`-Returning Functions

As part of the work for assertion signatures, TypeScript needed to encode more about where and which functions were being called.
This gave us the opportunity to expand support for another class of functions: functions that return `never`.

The intent of any function that returns `never` is that it never returns.
It indicates that an exception was thrown, a halting error condition occurred, or that the program exited.
For example, [`process.exit(...)` in `@types/node`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5299d372a220584e75a031c13b3d555607af13f8/types/node/globals.d.ts#l874) is specified to return `never`.

In order to ensure that a function never potentially returned `undefined` or effectively returned from all code paths, TypeScript needed some syntactic signal - either a `return` or `throw` at the end of a function.
So users found themselves `return`-ing their failure functions.

```ts
function dispatch(x: string | number): SomeType {
    if (typeof x === "string") {
        return doThingWithString(x);
    }
    else if (typeof x === "number") {
        return doThingWithNumber(x);
    }
    return process.exit(1);
}
```

Now when these `never`-returning functions are called, TypeScript recognizes that they affect the control flow graph and accounts for them.

```ts
function dispatch(x: string | number): SomeType {
    if (typeof x === "string") {
        return doThingWithString(x);
    }
    else if (typeof x === "number") {
        return doThingWithNumber(x);
    }
    process.exit(1);
}
```

As with assertion functions, you can [read up more at the same pull request](https://github.com/microsoft/TypeScript/pull/32695).

## (More) Recursive Type Aliases

[Playground](/play/#example/recursive-type-references)

Type aliases have always had a limitation in how they could be "recursively" referenced.
The reason is that any use of a type alias needs to be able to substitute itself with whatever it aliases.
In some cases, that's not possible, so the compiler rejects certain recursive aliases like the following:

```ts
type Foo = Foo;
```

This is a reasonable restriction because any use of `Foo` would need to be replaced with `Foo` which would need to be replaced with `Foo` which would need to be replaced with `Foo` which... well, hopefully you get the idea!
In the end, there isn't a type that makes sense in place of `Foo`.

This is fairly [consistent with how other languages treat type aliases](https://en.wikipedia.org/w/index.php?title=Recursive_data_type&oldid=913091335#in_type_synonyms), but it does give rise to some slightly surprising scenarios for how users leverage the feature.
For example, in TypeScript 3.6 and prior, the following causes an error.

```ts
type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
//   ~~~~~~~~~~~~
// error: Type alias 'ValueOrArray' circularly references itself.
```

This is strange because there is technically nothing wrong with any use  users could always write what was effectively the same code by introducing an interface.

```ts
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>;

interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
```

Because interfaces (and other object types) introduce a level of indirection and their full structure doesn't need to be eagerly built out, TypeScript has no problem working with this structure.

But workaround of introducing the interface wasn't intuitive for users.
And in principle there really wasn't anything wrong with the original version of `ValueOrArray` that used `Array` directly.
If the compiler was a little bit "lazier" and only calculated the type arguments to `Array` when necessary, then TypeScript could express these correctly.

That's exactly what TypeScript 3.7 introduces.
At the "top level" of a type alias, TypeScript will defer resolving type arguments to permit these patterns.

This means that code like the following that was trying to represent JSON...

```ts
type Json =
    | string
    | number
    | boolean
    | null
    | JsonObject
    | JsonArray;

interface JsonObject {
    [property: string]: Json;
}

interface JsonArray extends Array<Json> {}
```

can finally be rewritten without helper interfaces.

```ts
type Json =
    | string
    | number
    | boolean
    | null
    | { [property: string]: Json }
    | Json[];
```

This new relaxation also lets us recursively reference type aliases in tuples as well.
The following code which used to error is now valid TypeScript code.

```ts
type VirtualNode =
    | string
    | [string, { [key: string]: any }, ...VirtualNode[]];

const myNode: VirtualNode =
    ["div", { id: "parent" },
        ["div", { id: "first-child" }, "I'm the first child"],
        ["div", { id: "second-child" }, "I'm the second child"]
    ];
```

For more information, you can [read up on the original pull request](https://github.com/microsoft/TypeScript/pull/33050).

## `--declaration` and `--allowJs`

The `--declaration` flag in TypeScript allows us to generate `.d.ts` files (declaration files) from TypeScript source files (i.e. `.ts` and `.tsx` files).
These `.d.ts` files are important for a couple of reasons.

First of all, they're important because they allow TypeScript to type-check against other projects without re-checking the original source code.
They're also important because they allow TypeScript to interoperate with existing JavaScript libraries that weren't built with TypeScript in mind.
Finally, a benefit that is often underappreciated: both TypeScript *and* JavaScript users can benefit from these files when using editors powered by TypeScript to get things like better auto-completion.

Unfortunately, `--declaration` didn't work with the `--allowJs` flag which allows mixing TypeScript and JavaScript input files.
This was a frustrating limitation because it meant users couldn't use the `--declaration` flag when migrating codebases, even if they were JSDoc-annotated.
TypeScript 3.7 changes that, and allows the two options to be used together!

The most impactful outcome of this feature might a bit subtle: with TypeScript 3.7, users can write libraries in JSDoc annotated JavaScript and support TypeScript users.

The way that this works is that when using `allowJs`, TypeScript has some best-effort analyses to understand common JavaScript patterns; however, the way that some patterns are expressed in JavaScript don't necessarily look like their equivalents in TypeScript.
When `declaration` emit is turned on, TypeScript figures out the best way to transform JSDoc comments and CommonJS exports into valid type declarations and the like in the output `.d.ts` files.

As an example, the following code snippet

```js
const assert = require("assert")

module.exports.blurImage = blurImage;

/**
 * Produces a blurred image from an input buffer.
 * 
 * @param input {Uint8Array}
 * @param width {number}
 * @param height {number}
 */
function blurImage(input, width, height) {
    const numPixels = width * height * 4;
    assert(input.length === numPixels);
    const result = new Uint8Array(numPixels);

    // TODO

    return result;
}
```

Will produce a `.d.ts` file like

```ts
/**
 * Produces a blurred image from an input buffer.
 *
 * @param input {Uint8Array}
 * @param width {number}
 * @param height {number}
 */
export function blurImage(input: Uint8Array, width: number, height: number): Uint8Array;
```

This can go beyond basic functions with `@param` tags too, where the following example:

```js
/**
 * @callback Job
 * @returns {void}
 */

/** Queues work */
export class Worker {
    constructor(maxDepth = 10) {
        this.started = false;
        this.depthLimit = maxDepth;
        /**
         * NOTE: queued jobs may add more items to queue
         * @type {Job[]}
         */
        this.queue = [];
    }
    /**
     * Adds a work item to the queue
     * @param {Job} work 
     */
    push(work) {
        if (this.queue.length + 1 > this.depthLimit) throw new Error("Queue full!");
        this.queue.push(work);
    }
    /**
     * Starts the queue if it has not yet started
     */
    start() {
        if (this.started) return false;
        this.started = true;
        while (this.queue.length) {
            /** @type {Job} */(this.queue.shift())();
        }
        return true;
    }
}
```

will be transformed into the following `.d.ts` file:

```ts
/**
 * @callback Job
 * @returns {void}
 */
/** Queues work */
export class Worker {
    constructor(maxDepth?: number);
    started: boolean;
    depthLimit: number;
    /**
     * NOTE: queued jobs may add more items to queue
     * @type {Job[]}
     */
    queue: Job[];
    /**
     * Adds a work item to the queue
     * @param {Job} work
     */
    push(work: Job): void;
    /**
     * Starts the queue if it has not yet started
     */
    start(): boolean;
}
export type Job = () => void;
```

Note that when using these flags together, TypeScript doesn't necessarily have to downlevel `.js` files.
If you simply want TypeScript to create `.d.ts` files, you can use the `--emitDeclarationOnly` compiler option.

For more details, you can [check out the original pull request](https://github.com/microsoft/TypeScript/pull/32372).

## The `useDefineForClassFields` Flag and The `declare` Property Modifier

Back when TypeScript implemented public class fields, we assumed to the best of our abilities that the following code

```ts
class C {
    foo = 100;
    bar: string;
}
```

would be equivalent to a similar assignment within a constructor body.

```ts
class C {
    constructor() {
        this.foo = 100;
    }
}
```

Unfortunately, while this seemed to be the direction that the proposal moved towards in its earlier days, there is an extremely strong chance that public class fields will be standardized differently.
Instead, the original code sample might need to de-sugar to something closer to the following:

```ts
class C {
    constructor() {
        Object.defineProperty(this, "foo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "bar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
```

While TypeScript 3.7 isn't changing any existing emit by default, we've been rolling out changes incrementally to help users mitigate potential future breakage.
We've provided a new flag called `useDefineForClassFields` to enable this emit mode with some new checking logic.

The two biggest changes are the following:

* Declarations are initialized with `Object.defineProperty`.
* Declarations are *always* initialized to `undefined`, even if they have no initializer.

This can cause quite a bit of fallout for existing code that use inheritance. First of all, `set` accessors from base classes won't get triggered - they'll be completely overwritten.

```ts
class Base {
    set data(value: string) {
        console.log("data changed to " + value);
    }
}

class Derived extends Base {
    // No longer triggers a 'console.log' 
    // when using 'useDefineForClassFields'.
    data = 10;
}
```

Secondly, using class fields to specialize properties from base classes also won't work.

```ts
interface Animal { animalStuff: any }
interface Dog extends Animal { dogStuff: any }

class AnimalHouse {
    resident: Animal;
    constructor(animal: Animal) {
        this.resident = animal;
    }
}

class DogHouse extends AnimalHouse {
    // Initializes 'resident' to 'undefined'
    // after the call to 'super()' when
    // using 'useDefineForClassFields'!
    resident: Dog;

    constructor(dog: Dog) {
        super(dog);
    }
}
```

What these two boil down to is that mixing properties with accessors is going to cause issues, and so will re-declaring properties with no initializers.

To detect the issue around accessors, TypeScript 3.7 will now emit `get`/`set` accessors in `.d.ts` files so that in TypeScript can check for overridden accessors.

Code that's impacted by the class fields change can get around the issue by converting field initializers to assignments in constructor bodies.

```ts
class Base {
    set data(value: string) {
        console.log("data changed to " + value);
    }
}

class Derived extends Base {
    constructor() {
        data = 10;
    }
}
```

To help mitigate the second issue, you can either add an explicit initializer or add a `declare` modifier to indicate that a property should have no emit.

```ts
interface Animal { animalStuff: any }
interface Dog extends Animal { dogStuff: any }

class AnimalHouse {
    resident: Animal;
    constructor(animal: Animal) {
        this.resident = animal;
    }
}

class DogHouse extends AnimalHouse {
    declare resident: Dog;
//  ^^^^^^^
// 'resident' now has a 'declare' modifier,
// and won't produce any output code.

    constructor(dog: Dog) {
        super(dog);
    }
}
```

Currently `useDefineForClassFields` is only available when targeting ES5 and upwards, since `Object.defineProperty` doesn't exist in ES3.
To achieve similar checking for issues, you can create a seperate project that targets ES5 and uses `--noEmit` to avoid a full build.

For more information, you can [take a look at the original pull request for these changes](https://github.com/microsoft/TypeScript/pull/33509).

We strongly encourage users to try the `useDefineForClassFields` flag and report back on our issue tracker or in the comments below.
This includes feedback on difficulty of adopting the flag so we can understand how we can make migration easier.

## Build-Free Editing with Project References

TypeScript's project references provide us with an easy way to break codebases up to give us faster compiles.
Unfortunately, editing a project whose dependencies hadn't been built (or whose output was out of date) meant that the editing experience wouldn't work well.

In TypeScript 3.7, when opening a project with dependencies, TypeScript will automatically use the source `.ts`/`.tsx` files instead.
This means projects using project references will now see an improved editing experience where semantic operations are up-to-date and "just work".
You can disable this behavior with the compiler option `disableSourceOfProjectReferenceRedirect` which may be appropriate when working in very large projects where this change may impact editing performance.

You can [read up more about this change by reading up on its pull request](https://github.com/microsoft/TypeScript/pull/32028).

## Uncalled Function Checks

[Playground](/play/#example/uncalled-function-checks)

A common and dangerous error is to forget to invoke a function, especially if the function has zero arguments or is named in a way that implies it might be a property rather than a function.

```ts
interface User {
    isAdministrator(): boolean;
    notify(): void;
    doNotDisturb?(): boolean;
}

// later...

// Broken code, do not use!
function doAdminThing(user: User) {
    // oops!
    if (user.isAdministrator) {
        sudo();
        editTheConfiguration();
    }
    else {
        throw new AccessDeniedError("User is not an admin");
    }
}
```

Here, we forgot to call `isAdministrator`, and the code incorrectly allows non-adminstrator users to edit the configuration!

In TypeScript 3.7, this is identified as a likely error:

```ts
function doAdminThing(user: User) {
    if (user.isAdministrator) {
    //  ~~~~~~~~~~~~~~~~~~~~
    // error! This condition will always return true since the function is always defined.
    //        Did you mean to call it instead?
```

This check is a breaking change, but for that reason the checks are very conservative.
This error is only issued in `if` conditions, and it is not issued on optional properties, if `strictNullChecks` is off, or if the function is later called within the body of the `if`:

```ts
interface User {
    isAdministrator(): boolean;
    notify(): void;
    doNotDisturb?(): boolean;
}

function issueNotification(user: User) {
    if (user.doNotDisturb) {
        // OK, property is optional
    }
    if (user.notify) {
        // OK, called the function
        user.notify();
    }
}
```

If you intended to test the function without calling it, you can correct the definition of it to include `undefined`/`null`, or use `!!` to write something like `if (!!user.isAdministrator)` to indicate that the coercion is intentional.

We owe a big thanks to GitHub user [@jwbay](https://github.com/jwbay) who took the initiative to create a [proof-of-concept](https://github.com/microsoft/TypeScript/pull/32802) and iterated to provide us with with [the current version](https://github.com/microsoft/TypeScript/pull/33178).

## `// @ts-nocheck` in TypeScript Files

TypeScript 3.7 allows us to add `// @ts-nocheck` comments to the top of TypeScript files to disable semantic checks.
Historically this comment was only respected in JavaScript source files in the presence of `checkJs`, but we've expanded support to TypeScript files to make migrations easier for all users.

## Semicolon Formatter Option

TypeScript's built-in formatter now supports semicolon insertion and removal at locations where a trailing semicolon is optional due to JavaScript's automatic semicolon insertion (ASI) rules. The setting is available now in [Visual Studio Code Insiders](https://code.visualstudio.com/insiders/), and will be available in Visual Studio 16.4 Preview 2 in the Tools Options menu.

<img width="833" alt="New semicolon formatter option in VS Code" src="https://user-images.githubusercontent.com/3277153/65913194-10066e80-e395-11e9-8a3a-4f7305c397d5.png">

Choosing a value of "insert" or "remove" also affects the format of auto-imports, extracted types, and other generated code provided by TypeScript services. Leaving the setting on its default value of "ignore" makes generated code match the semicolon preference detected in the current file.

## 3.7 Breaking Changes

### DOM Changes

[Types in `lib.dom.d.ts` have been updated](https://github.com/microsoft/TypeScript/pull/33627).
These changes are largely correctness changes related to nullability, but impact will ultimately depend on your codebase.

### Class Field Mitigations

[As mentioned above](#the-usedefineforclassfields-flag-and-the-declare-property-modifier), TypeScript 3.7 emits `get`/`set` accessors in `.d.ts` files which can cause breaking changes for consumers on older versions of TypeScript like 3.5 and prior.
TypeScript 3.6 users will not be impacted, since that version was future-proofed for this feature.

While not a breakage per se, opting in to the `useDefineForClassFields` flag can cause breakage when:

* overriding an accessor in a derived class with a property declaration
* re-declaring a property declaration with no initializer

To understand the full impact, read [the section above on the `useDefineForClassFields` flag](#the-usedefineforclassfields-flag-and-the-declare-property-modifier).

### Function Truthy Checks

As mentioned above, TypeScript now errors when functions appear to be uncalled within `if` statement conditions.
An error is issued when a function type is checked in `if` conditions unless any of the following apply:

* the checked value comes from an optional property
* `strictNullChecks` is disabled
* the function is later called within the body of the `if`

### Local and Imported Type Declarations Now Conflict

Due to a bug, the following construct was previously allowed in TypeScript:

```ts
// ./someOtherModule.ts
interface SomeType {
    y: string;
}

// ./myModule.ts
import { SomeType } from "./someOtherModule";
export interface SomeType {
    x: number;
}

function fn(arg: SomeType) {
    console.log(arg.x); // Error! 'x' doesn't exist on 'SomeType'
}
```

Here, `SomeType` appears to originate in both the `import` declaration and the local `interface` declaration.
Perhaps surprisingly, inside the module, `SomeType` refers exclusively to the `import`ed definition, and the local declaration `SomeType` is only usable when imported from another file.
This is very confusing and our review of the very small number of cases of code like this in the wild showed that developers usually thought something different was happening.

In TypeScript 3.7, [this is now correctly identified as a duplicate identifier error](https://github.com/microsoft/TypeScript/pull/31231).
The correct fix depends on the original intent of the author and should be addressed on a case-by-case basis.
Usually, the naming conflict is unintentional and the best fix is to rename the imported type.
If the intent was to augment the imported type, a proper module augmentation should be written instead.

### 3.7 API Changes

To enable the recursive type alias patterns described above, the `typeArguments` property has been removed from the `TypeReference` interface. Users should instead use the `getTypeArguments` function on `TypeChecker` instances.

## TypeScript 3.6

## Stricter Generators

TypeScript 3.6 introduces stricter checking for iterators and generator functions.
In earlier versions, users of generators had no way to differentiate whether a value was yielded or returned from a generator.

```ts
function* foo() {
    if (Math.random() < 0.5) yield 100;
    return "Finished!"
}

let iter = foo();
let curr = iter.next();
if (curr.done) {
    // TypeScript 3.5 and prior thought this was a 'string | number'.
    // It should know it's 'string' since 'done' was 'true'!
    curr.value
}
```

Additionally, generators just assumed the type of `yield` was always `any`.

```ts
function* bar() {
    let x: { hello(): void } = yield;
    x.hello();
}

let iter = bar();
iter.next();
iter.next(123); // oops! runtime error!
```

In TypeScript 3.6, the checker now knows that the correct type for `curr.value` should be `string` in our first example, and will correctly error on our call to `next()` in our last example.
This is thanks to some changes in the `Iterator` and `IteratorResult` type declarations to include a few new type parameters, and to a new type that TypeScript uses to represent generators called the `Generator` type.

The `Iterator` type now allows users to specify the yielded type, the returned type, and the type that `next` can accept.

```ts
interface Iterator<T, TReturn = any, TNext = undefined> {
    // Takes either 0 or 1 arguments - doesn't accept 'undefined'
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    return?(value?: TReturn): IteratorResult<T, TReturn>;
    throw?(e?: any): IteratorResult<T, TReturn>;
}
```

Building on that work, the new `Generator` type is an `Iterator` that always has both the `return` and `throw` methods present, and is also iterable.

```ts
interface Generator<T = unknown, TReturn = any, TNext = unknown>
        extends Iterator<T, TReturn, TNext> {
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    return(value: TReturn): IteratorResult<T, TReturn>;
    throw(e: any): IteratorResult<T, TReturn>;
    [Symbol.iterator](): Generator<T, TReturn, TNext>;
}
```

To allow differentiation between returned values and yielded values, TypeScript 3.6 converts the `IteratorResult` type to a discriminated union type:

```ts
type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;

interface IteratorYieldResult<TYield> {
    done?: false;
    value: TYield;
}

interface IteratorReturnResult<TReturn> {
    done: true;
    value: TReturn;
}
```

In short, what this means is that you'll be able to appropriately narrow down values from iterators when dealing with them directly.

To correctly represent the types that can be passed in to a generator from calls to `next()`, TypeScript 3.6 also infers certain uses of `yield` within the body of a generator function.

```ts
function* foo() {
    let x: string = yield;
    console.log(x.toUpperCase());
}

let x = foo();
x.next(); // first call to 'next' is always ignored
x.next(42); // error! 'number' is not assignable to 'string'
```

If you'd prefer to be explicit, you can also enforce the type of values that can be returned, yielded, and evaluated from `yield` expressions using an explicit return type.
Below, `next()` can only be called with `boolean`s, and depending on the value of `done`, `value` is either a `string` or a `number`.

```ts
/**
 * - yields numbers
 * - returns strings
 * - can be passed in booleans
 */
function* counter(): Generator<number, string, boolean> {
    let i = 0;
    while (true) {
        if (yield i++) {
            break;
        }
    }
    return "done!";
}

var iter = counter();
var curr = iter.next()
while (!curr.done) {
    console.log(curr.value);
    curr = iter.next(curr.value === 5)
}
console.log(curr.value.toUpperCase());

// prints:
//
// 0
// 1
// 2
// 3
// 4
// 5
// DONE!
```

For more details on the change, [see the pull request here](https://github.com/Microsoft/TypeScript/issues/2983).

## More Accurate Array Spread

In pre-ES2015 targets, the most faithful emit for constructs like `for`/`of` loops and array spreads can be a bit heavy.
For this reason, TypeScript uses a simpler emit by default that only supports array types, and supports iterating on other types using the `--downlevelIteration` flag.
The looser default without `--downlevelIteration` works fairly well; however, there were some common cases where the transformation of array spreads had observable differences.
For example, the following array containing a spread

```ts
[...Array(5)]
```

can be rewritten as the following array literal

```js
[undefined, undefined, undefined, undefined, undefined]
```

However, TypeScript would instead transform the original code into this code:

```ts
Array(5).slice();
```

which is slightly different.
`Array(5)` produces an array with a length of 5, but with no defined property slots.

TypeScript 3.6 introduces a new `__spreadArrays` helper to accurately model what happens in ECMAScript 2015 in older targets outside of `--downlevelIteration`.
`__spreadArrays` is also available in [tslib](https://github.com/Microsoft/tslib/).

For more information, [see the relevant pull request](https://github.com/microsoft/TypeScript/pull/31166).

## Improved UX Around Promises

TypeScript 3.6 introduces some improvements for when `Promise`s are mis-handled.

For example, it's often very common to forget to `.then()` or `await` the contents of a `Promise` before passing it to another function.
TypeScript's error messages are now specialized, and inform the user that perhaps they should consider using the `await` keyword.

```ts
interface User {
    name: string;
    age: number;
    location: string;
}

declare function getUserData(): Promise<User>;
declare function displayUser(user: User): void;

async function f() {
    displayUser(getUserData());
//              ~~~~~~~~~~~~~
// Argument of type 'Promise<User>' is not assignable to parameter of type 'User'.
//   ...
// Did you forget to use 'await'?
}
```

It's also common to try to access a method before `await`-ing or `.then()`-ing a `Promise`.
This is another example, among many others, where we're able to do better.

```ts
async function getCuteAnimals() {
    fetch("https://reddit.com/r/aww.json")
        .json()
    //   ~~~~
    // Property 'json' does not exist on type 'Promise<Response>'.
    //
    // Did you forget to use 'await'?
}
```

For more details, [see the originating issue](https://github.com/microsoft/TypeScript/issues/30646), as well as the pull requests that link back to it.

## Better Unicode Support for Identifiers

TypeScript 3.6 contains better support for Unicode characters in identifiers when emitting to ES2015 and later targets.

```ts
const 𝓱𝓮𝓵𝓵𝓸 = "world"; // previously disallowed, now allowed in '--target es2015'
```

## `import.meta` Support in SystemJS

TypeScript 3.6 supports transforming `import.meta` to `context.meta` when your `module` target is set to `system`.

```ts
// This module:

console.log(import.meta.url)

// gets turned into the following:

System.register([], function (exports, context) {
  return {
    setters: [],
    execute: function () {
      console.log(context.meta.url);
    }
  };
});
```

## `get` and `set` Accessors Are Allowed in Ambient Contexts

In previous versions of TypeScript, the language didn't allow `get` and `set` accessors in ambient contexts (like in `declare`-d classes, or in `.d.ts` files in general).
The rationale was that accessors weren't distinct from properties as far as writing and reading to these properties;
however, [because ECMAScript's class fields proposal may have differing behavior from in existing versions of TypeScript](https://github.com/tc39/proposal-class-fields/issues/248), we realized we needed a way to communicate this different behavior to provide appropriate errors in subclasses.

As a result, users can write getters and setters in ambient contexts in TypeScript 3.6.

```ts
declare class Foo {
    // Allowed in 3.6+.
    get x(): number;
    set x(val: number): void;
}
```

In TypeScript 3.7, the compiler itself will take advantage of this feature so that generated `.d.ts` files will also emit `get`/`set` accessors.

## Ambient Classes and Functions Can Merge

In previous versions of TypeScript, it was an error to merge classes and functions under any circumstances.
Now, ambient classes and functions (classes/functions with the `declare` modifier, or in `.d.ts` files) can merge.
This means that now you can write the following:

```ts
export declare function Point2D(x: number, y: number): Point2D;
export declare class Point2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
```

instead of needing to use 

```ts
export interface Point2D {
    x: number;
    y: number;
}
export declare var Point2D: {
    (x: number, y: number): Point2D;
    new (x: number, y: number): Point2D;
}
```

One advantage of this is that the callable constructor pattern can be easily expressed while also allowing namespaces to merge with these declarations (since `var` declarations can't merge with `namespace`s).

In TypeScript 3.7, the compiler will take advantage of this feature so that `.d.ts` files generated from `.js` files can appropriately capture both the callability and constructability of a class-like function.

For more details, [see the original PR on GitHub](https://github.com/microsoft/TypeScript/pull/32584).

## APIs to Support `--build` and `--incremental`

TypeScript 3.0 introduced support for referencing other and building them incrementally using the `--build` flag.
Additionally, TypeScript 3.4 introduced the `--incremental` flag for saving information about previous compilations to only rebuild certain files.
These flags were incredibly useful for structuring projects more flexibly and speeding builds up.
Unfortunately, using these flags didn't work with 3rd party build tools like Gulp and Webpack.
TypeScript 3.6 now exposes two sets of APIs to operate on project references and incremental program building.

For creating `--incremental` builds, users can leverage the `createIncrementalProgram` and `createIncrementalCompilerHost` APIs.
Users can also re-hydrate old program instances from `.tsbuildinfo` files generated by this API using the newly exposed `readBuilderProgram` function, which is only meant to be used as for creating new programs (i.e. you can't modify the returned instance - it's only meant to be used for the `oldProgram` parameter in other `create*Program` functions).

For leveraging project references, a new `createSolutionBuilder` function has been exposed, which returns an instance of the new type `SolutionBuilder`.

For more details on these APIs, you can [see the original pull request](https://github.com/microsoft/TypeScript/pull/31432).

## Semicolon-Aware Code Edits

Editors like Visual Studio and Visual Studio Code can automatically apply quick fixes, refactorings, and other transformations like automatically importing values from other modules.
These transformations are powered by TypeScript, and older versions of TypeScript unconditionally added semicolons to the end of every statement; unfortunately, this disagreed with many users' style guidelines, and many users were displeased with the editor inserting semicolons.

TypeScript is now smart enough to detect whether your file uses semicolons when applying these sorts of edits.
If your file generally lacks semicolons, TypeScript won't add one.

For more details, [see the corresponding pull request](https://github.com/microsoft/TypeScript/pull/31801).

## Smarter Auto-Import Syntax

JavaScript has a lot of different module syntaxes or conventions: the one in the ECMAScript standard, the one Node already supports (CommonJS), AMD, System.js, and more!
For the most part, TypeScript would default to auto-importing using ECMAScript module syntax, which was often inappropriate in certain TypeScript projects with different compiler settings, or in Node projects with plain JavaScript and `require` calls.

TypeScript 3.6 is now a bit smarter about looking at your existing imports before deciding on how to auto-import other modules.
You can [see more details in the original pull request here](https://github.com/microsoft/TypeScript/pull/32684).

## `await` Completions on Promises

## New TypeScript Playground

The TypeScript playground has received a much-needed refresh with handy new functionality!
The new playground is largely a fork of [Artem Tyurin](https://github.com/agentcooper)'s [TypeScript playground](https://github.com/agentcooper/typescript-play) which community members have been using more and more.
We owe Artem a big thanks for helping out here!

The new playground now supports many new options including:

* The `target` option (allowing users to switch out of `es5` to `es3`, `es2015`, `esnext`, etc.)
* All the strictness flags (including just `strict`)
* Support for plain JavaScript files (using `allowJS` and optionally `checkJs`)

These options also persist when sharing links to playground samples, allowing users to more reliably share examples without having to tell the recipient "oh, don't forget to turn on the `noImplicitAny` option!".

In the near future, we're going to be refreshing the playground samples, adding JSX support, and polishing automatic type acquisition, meaning that you'll be able to see the same experience on the playground as you'd get in your personal editor.

As we improve the playground and the website, [we welcome feedback and pull requests on GitHub](https://github.com/microsoft/TypeScript-Website/)!

## TypeScript 3.5

## Speed improvements

TypeScript 3.5 introduces several optimizations around type-checking and incremental builds.

### Type-checking speed-ups

TypeScript 3.5 contains certain optimizations over TypeScript 3.4 for type-checking more efficiently.
These improvements are significantly more pronounced in editor scenarios where type-checking drives operations like code completion lists.

### `--incremental` improvements

TypeScript 3.5 improves on 3.4's `--incremental` build mode, by saving information about how the state of the world was calculated - compiler settings, why files were looked up, where files were found, etc.
In scenarios involving hundreds of projects using TypeScript's project references in `--build` mode, [we've found that the amount of time rebuilding can be reduced by as much as 68% compared to TypeScript 3.4](https://github.com/Microsoft/TypeScript/pull/31101)!

For more details, you can see the pull requests to

* [cache module resolution](https://github.com/Microsoft/TypeScript/pull/31100)
* [cache settings calculated from `tsconfig.json`](https://github.com/Microsoft/TypeScript/pull/31101)

## The `Omit` helper type

TypeScript 3.5 introduces the new `Omit` helper type, which creates a new type with some properties dropped from the original.

```ts
type Person = {
    name: string;
    age: number;
    location: string;
};

type QuantumPerson = Omit<Person, "location">;

// equivalent to
type QuantumPerson = {
    name: string;
    age: number;
};
```

Here we were able to copy over all the properties of `Person` except for `location` using the `Omit` helper.

For more details, [see the pull request on GitHub to add `Omit`](https://github.com/Microsoft/TypeScript/pull/30552), as well as [the change to use `Omit` for object rest](https://github.com/microsoft/TypeScript/pull/31134).

### Improved excess property checks in union types

In TypeScript 3.4 and earlier, certain excess properties were allowed in situations where they really shouldn't have been.
For instance, TypeScript 3.4 permitted the incorrect `name` property in the object literal even though its types don't match between `Point` and `Label`.

```ts
type Point = {
    x: number;
    y: number;
};

type Label = {
    name: string;
};

const thing: Point | Label = {
    x: 0,
    y: 0,
    name: true // uh-oh!
};
```

Previously, a non-disciminated union wouldn't have *any* excess property checking done on its members, and as a result, the incorrectly typed `name` property slipped by.

In TypeScript 3.5, the type-checker at least verifies that all the provided properties belong to *some* union member and have the appropriate type, meaning that the sample above correctly issues an error.

Note that partial overlap is still permitted as long as the property types are valid.

```ts
const pl: Point | Label = {
    x: 0,
    y: 0,
    name: "origin" // okay
};
```

## The `--allowUmdGlobalAccess` flag

In TypeScript 3.5, you can now reference UMD global declarations like

```
export as namespace foo;
```

from anywhere - even modules - using the new `--allowUmdGlobalAccess` flag.

This mode adds flexibility for mixing and matching the way 3rd party libraries, where globals that libraries declare can always be consumed, even from within modules.

For more details, [see the pull request on GitHub](https://github.com/Microsoft/TypeScript/pull/30776/files).

## Smarter union type checking

In TypeScript 3.4 and prior, the following example would fail:

```ts
type S = { done: boolean, value: number }
type T =
    | { done: false, value: number }
    | { done: true, value: number };

declare let source: S;
declare let target: T;

target = source;
```

That's because `S` isn't assignable to `{ done: false, value: number }` nor `{ done: true, value: number }`.
Why?
Because the `done` property in `S` isn't specific enough - it's `boolean` whereas each constituent of `T` has a `done` property that's specifically `true` or `false`.
That's what we meant by each constituent type being checked in isolation: TypeScript doesn't just union each property together and see if `S` is assignable to that.
If it did, some bad code could get through like the following:

```ts
interface Foo {
    kind: "foo";
    value: string;
}

interface Bar {
    kind: "bar";
    value: number;
}

function doSomething(x: Foo | Bar) {
    if (x.kind === "foo") {
        x.value.toLowerCase();
    }
}

// uh-oh - luckily TypeScript errors here!
doSomething({
    kind: "foo",
    value: 123,
});
```

However, this was a bit overly strict for the original example.
If you figure out the precise type of any possible value of `S`, you can actually see that it matches the types in `T` exactly.

In TypeScript 3.5, when assigning to types with discriminant properties like in `T`, the language actually *will* go further and decompose types like `S` into a union of every possible inhabitant type.
In this case, since `boolean` is a union of `true` and `false`, `S` will be viewed as a union of `{ done: false, value: number }` and `{ done: true, value: number }`.

For more details, you can [see the original pull request on GitHub](https://github.com/microsoft/TypeScript/pull/30779).

## Higher order type inference from generic constructors

In TypeScript 3.4, we improved inference for when generic functions that return functions like so:

```ts
function compose<T, U, V>(
    f: (x: T) => U, g: (y: U) => V): (x: T) => V {
    
    return x => g(f(x))
}
```

took other generic functions as arguments, like so:

```ts
function arrayify<T>(x: T): T[] {
    return [x];
}

type Box<U> = { value: U }
function boxify<U>(y: U): Box<U> {
    return { value: y };
}

let newFn = compose(arrayify, boxify);
```

Instead of a relatively useless type like `(x: {}) => Box<{}[]>`, which older versions of the language would infer, TypeScript 3.4's inference allows `newFn` to be generic.
Its new type is `<T>(x: T) => Box<T[]>`.

TypeScript 3.5 generalizes this behavior to work on constructor functions as well.

```ts
class Box<T> {
    kind: "box";
    value: T;
    constructor(value: T) {
        this.value = value;
    }
}

class Bag<U> {
    kind: "bag";
    value: U;
    constructor(value: U) {
        this.value = value;
    }
}


function composeCtor<T, U, V>(
    F: new (x: T) => U, G: new (y: U) => V): (x: T) => V {
    
    return x => new G(new F(x))
}

let f = composeCtor(Box, Bag); // has type '<T>(x: T) => Bag<Box<T>>'
let a = f(1024); // has type 'Bag<Box<number>>'
```

In addition to compositional patterns like the above, this new inference on generic constructors means that functions that operate on class components in certain UI libraries like React can more correctly operate on generic class components.

```ts
type ComponentClass<P> = new (props: P) => Component<P>;
declare class Component<P> {
    props: P;
    constructor(props: P);
}

declare function myHoc<P>(C: ComponentClass<P>): ComponentClass<P>;

type NestedProps<T> = { foo: number, stuff: T };

declare class GenericComponent<T> extends Component<NestedProps<T>> {
}

// type is 'new <T>(props: NestedProps<T>) => Component<NestedProps<T>>'
const GenericComponent2 = myHoc(GenericComponent);
```

To learn more, [check out the original pull request on GitHub](https://github.com/microsoft/TypeScript/pull/31116).

## TypeScript 3.4

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

```
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

The same way that ordinary tuples are types that extend from `Array` - a tuple with elements of type `T`<sub>`1`</sub>, `T`<sub>`2`</sub>, ... `T`<sub>`n`</sub> extends from `Array<` `T`<sub>`1`</sub> | `T`<sub>`2`</sub> | ... `T`<sub>`n`</sub> `>` - `readonly` tuples are types that extend from `ReadonlyArray`. So a `readonly` tuple with elements `T`<sub>`1`</sub>, `T`<sub>`2`</sub>, ... `T`<sub>`n`</sub> extends from `ReadonlyArray<` `T`<sub>`1`</sub> | `T`<sub>`2`</sub> | ... `T`<sub>`n`</sub> `>`.

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

## TypeScript 3.3

## Improved behavior for calling union types

In prior versions of TypeScript, unions of callable types could *only* be invoked if they had identical parameter lists.

```ts
type Fruit = "apple" | "orange";
type Color = "red" | "orange";

type FruitEater = (fruit: Fruit) => number;     // eats and ranks the fruit
type ColorConsumer = (color: Color) => string;  // consumes and describes the colors

declare let f: FruitEater | ColorConsumer;

// Cannot invoke an expression whose type lacks a call signature.
//   Type 'FruitEater | ColorConsumer' has no compatible call signatures.ts(2349)
f("orange");
```

However, in the above example, both `FruitEater`s and `ColorConsumer`s should be able to take the string `"orange"`, and return either a `number` or a `string`.

In TypeScript 3.3, this is no longer an error.

```ts
type Fruit = "apple" | "orange";
type Color = "red" | "orange";

type FruitEater = (fruit: Fruit) => number;     // eats and ranks the fruit
type ColorConsumer = (color: Color) => string;  // consumes and describes the colors

declare let f: FruitEater | ColorConsumer;

f("orange"); // It works! Returns a 'number | string'.

f("apple");  // error - Argument of type '"red"' is not assignable to parameter of type '"orange"'.

f("red");    // error - Argument of type '"red"' is not assignable to parameter of type '"orange"'.
```

In TypeScript 3.3, the parameters of these signatures are *intersected* together to create a new signature.

In the example above, the parameters `fruit` and `color` are intersected together to a new parameter of type `Fruit & Color`.
`Fruit & Color` is really the same as `("apple" | "orange") & ("red" | "orange")` which is equivalent to `("apple" & "red") | ("apple" & "orange") | ("orange" & "red") | ("orange" & "orange")`.
Each of those impossible intersections reduces to `never`, and we're left with `"orange" & "orange"` which is just `"orange"`.

### Caveats

This new behavior only kicks in when at most one type in the union has multiple overloads, and at most one type in the union has a generic signature.
That means methods on `number[] | string[]` like `map` (which is generic) still won't be callable.

On the other hand, methods like `forEach` will now be callable, but under `noImplicitAny` there may be some issues.

```ts
interface Dog {
    kind: "dog"
    dogProp: any;
}
interface Cat {
    kind: "cat"
    catProp: any;
}

const catOrDogArray: Dog[] | Cat[] = [];

catOrDogArray.forEach(animal => {
    //                ~~~~~~ error!
    // Parameter 'animal' implicitly has an 'any' type.
});
```

This is still strictly more capable in TypeScript 3.3, and adding an explicit type annotation will work.

```ts
interface Dog {
    kind: "dog"
    dogProp: any;
}
interface Cat {
    kind: "cat"
    catProp: any;
}

const catOrDogArray: Dog[] | Cat[] = [];
catOrDogArray.forEach((animal: Dog | Cat) => {
    if (animal.kind === "dog") {
        animal.dogProp;
        // ...
    }
    else if (animal.kind === "cat") {
        animal.catProp;
        // ...
    }
});
```

## Incremental file watching for composite projects in `--build --watch`

TypeScript 3.0 introduced a new feature for structuring builds called "composite projects".
Part of the goal here was to ensure users could break up large projects into smaller parts that build quickly and preserve project structure, without compromising the existing TypeScript experience.
Thanks to composite projects, TypeScript can use `--build` mode to recompile only the set of projects and dependencies.
You can think of this as optimizing *inter*-project builds.

TypeScript 2.7 also introduced `--watch` mode builds via a new incremental "builder" API.
In a similar vein, the entire idea is that this mode only re-checks and re-emits changed files or files whose dependencies might impact type-checking.
You can think of this as optimizing *intra*-project builds.

Prior to 3.3, building composite projects using `--build --watch` actually didn't use this incremental file watching infrastructure.
An update in one project under `--build --watch` mode would force a full build of that project, rather than determining which files within that project were affected.

In TypeScript 3.3, `--build` mode's `--watch` flag *does* leverage incremental file watching as well.
That can mean signficantly faster builds under `--build --watch`.
In our testing, this functionality has resulted in **a reduction of 50% to 75% in build times** of the original `--build --watch` times.
[You can read more on the original pull request for the change](https://github.com/Microsoft/TypeScript/pull/29161) to see specific numbers, but we believe most composite project users will see significant wins here.

## TypeScript 3.2

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

### Caveats

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

### Caveats

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

## TypeScript 3.1

## Mapped types on tuples and arrays

In TypeScript 3.1, mapped object types<sup>[[1]](#ts-3-1-only-homomorphic)</sup> over tuples and arrays now produce new tuples/arrays, rather than creating a new type where members like `push()`, `pop()`, and `length` are converted.
For example:

```ts
type MapToPromise<T> = { [K in keyof T]: Promise<T[K]> };

type Coordinate = [number, number]

type PromiseCoordinate = MapToPromise<Coordinate>; // [Promise<number>, Promise<number>]
```

`MapToPromise` takes a type `T`, and when that type is a tuple like `Coordinate`, only the numeric properties are converted.
In `[number, number]`, there are two numerically named properties: `0` and `1`.
When given a tuple like that, `MapToPromise` will create a new tuple where the `0` and `1` properties are `Promise`s of the original type.
So the resulting type `PromiseCoordinate` ends up with the type `[Promise<number>, Promise<number>]`.

## Properties declarations on functions

TypeScript 3.1 brings the ability to define properties on function declarations and `const`-declared functons, simply by assigning to properties on these functions in the same scope.
This allows us to write canonical JavaScript code without resorting to `namespace` hacks.
For example:

```ts
function readImage(path: string, callback: (err: any, image: Image) => void) {
    // ...
}

readImage.sync = (path: string) => {
    const contents = fs.readFileSync(path);
    return decodeImageSync(contents);
}
```

Here, we have a function `readImage` which reads an image in a non-blocking asynchronous way.
In addition to `readImage`, we've provided a convenience function on `readImage` itself called `readImage.sync`.

While ECMAScript exports are often a better way of providing this functionality, this new support allows code written in this style to "just work" TypeScript.
Additionaly, this approach for property declarations allows us to express common patterns like `defaultProps` and `propTypes` on React stateless function components (SFCs).

```ts
export const FooComponent = ({ name }) => (
    <div>Hello! I am {name}</div>
);

FooComponent.defaultProps = {
    name: "(anonymous)",
};
```

<!--
fs.readFile(path, (err, data) => {
        if (err) callback(err, undefined);
        else decodeImage(data, (err, image) => {
            if (err) callback(err, undefined);
            else callback(undefined, image);
        });
    });
-->

------

<sup id="ts-3-1-only-homomorphic">[1]</sup> More specifically, homomorphic mapped types like in the above form.

## Version selection with `typesVersions`

Feedback from our community, as well as our own experience, has shown us that leveraging the newest TypeScript features while also accomodating users on the older versions are difficult.
TypeScript introduces a new feature called `typesVersions` to help accomodate these scenarios.

When using Node module resolution in TypeScript 3.1, when TypeScript cracks open a `package.json` file to figure out which files it needs to read, it first looks at a new field called `typesVersions`.
A `package.json` with a `typesVersions` field might look like this:

```json
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

This `package.json` tells TypeScript to check whether the current version of TypeScript is running.
If it's 3.1 or later, it figures out the path you've imported relative to the package, and reads from the package's `ts3.1` folder.
That's what that `{ "*": ["ts3.1/*"] }` means - if you're familiar with path mapping today, it works exactly like that.

So in the above example, if we're importing from `"package-name"`, we'll try to resolve from `[...]/node_modules/package-name/ts3.1/index.d.ts` (and other relevant paths) when running in TypeScript 3.1.
If we import from `package-name/foo`, we'll try to look for `[...]/node_modules/package-name/ts3.1/foo.d.ts` and `[...]/node_modules/package-name/ts3.1/foo/index.d.ts`.

What if we're not running in TypeScript 3.1 in this example?
Well, if none of the fields in `typesVersions` get matched, TypeScript falls back to the `types` field, so here TypeScript 3.0 and earlier will be redirected to `[...]/node_modules/package-name/index.d.ts`.

### Matching behavior

The way that TypeScript decides on whether a version of the compiler & language matches is by using Node's [semver ranges](https://github.com/npm/node-semver#ranges).

### Multiple fields

`typesVersions` can support multiple fields where each field name is specified by the range to match on.

```json
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.2": { "*": ["ts3.2/*"] },
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

Since ranges have the potential to overlap, determining which redirect applies is order-specific.
That means in the above example, even though both the `>=3.2` and the `>=3.1` matchers support TypeScript 3.2 and above, reversing the order could have different behavior, so the above sample would not be equivalent to the following.

```json5
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    // NOTE: this doesn't work!
    ">=3.1": { "*": ["ts3.1/*"] },
    ">=3.2": { "*": ["ts3.2/*"] }
  }
}
```

## TypeScript 3.0

## Tuples in rest parameters and spread expressions

TypeScript 3.0 adds support to multiple new capabilities to interact with function parameter lists as tuple types.
TypeScript 3.0 adds support for:

* [Expansion of rest parameters with tuple types into discrete parameters.](#rest-parameters-with-tuple-types)
* [Expansion of spread expressions with tuple types into discrete arguments.](#spread-expressions-with-tuple-types)
* [Generic rest parameters and corresponding inference of tuple types.](#generic-rest-parameters)
* [Optional elements in tuple types.](#optional-elements-in-tuple-types)
* [Rest elements in tuple types.](#rest-elements-in-tuple-types)

With these features it becomes possible to strongly type a number of higher-order functions that transform functions and their parameter lists.

### Rest parameters with tuple types

When a rest parameter has a tuple type, the tuple type is expanded into a sequence of discrete parameters.
For example the following two declarations are equivalent:

```ts
declare function foo(...args: [number, string, boolean]): void;
```

```ts
declare function foo(args_0: number, args_1: string, args_2: boolean): void;
```

### Spread expressions with tuple types

When a function call includes a spread expression of a tuple type as the last argument, the spread expression corresponds to a sequence of discrete arguments of the tuple element types.

Thus, the following calls are equivalent:

```ts
const args: [number, string, boolean] = [42, "hello", true];
foo(42, "hello", true);
foo(args[0], args[1], args[2]);
foo(...args);
```

### Generic rest parameters

A rest parameter is permitted to have a generic type that is constrained to an array type, and type inference can infer tuple types for such generic rest parameters. This enables higher-order capturing and spreading of partial parameter lists:

##### Example

```ts
declare function bind<T, U extends any[], V>(f: (x: T, ...args: U) => V, x: T): (...args: U) => V;

declare function f3(x: number, y: string, z: boolean): void;

const f2 = bind(f3, 42);  // (y: string, z: boolean) => void
const f1 = bind(f2, "hello");  // (z: boolean) => void
const f0 = bind(f1, true);  // () => void

f3(42, "hello", true);
f2("hello", true);
f1(true);
f0();
```

In the declaration of `f2` above, type inference infers types `number`, `[string, boolean]` and `void` for `T`, `U` and `V` respectively.

Note that when a tuple type is inferred from a sequence of parameters and later expanded into a parameter list, as is the case for `U`, the original parameter names are used in the expansion (however, the names have no semantic meaning and are not otherwise observable).

### Optional elements in tuple types

Tuple types now permit a `?` postfix on element types to indicate that the element is optional:

##### Example

```ts
let t: [number, string?, boolean?];
t = [42, "hello", true];
t = [42, "hello"];
t = [42];
```

In `--strictNullChecks` mode, a `?` modifier automatically includes `undefined` in the element type, similar to optional parameters.

A tuple type permits an element to be omitted if it has a postfix `?` modifier on its type and all elements to the right of it also have `?` modifiers.

When tuple types are inferred for rest parameters, optional parameters in the source become optional tuple elements in the inferred type.

The `length` property of a tuple type with optional elements is a union of numeric literal types representing the possible lengths.
For example, the type of the `length` property in the tuple type `[number, string?, boolean?]` is `1 | 2 | 3`.

### Rest elements in tuple types

The last element of a tuple type can be a rest element of the form `...X`, where `X` is an array type.
A rest element indicates that the tuple type is open-ended and may have zero or more additional elements of the array element type.
For example, `[number, ...string[]]` means tuples with a `number` element followed by any number of `string` elements.

##### Example

```ts
function tuple<T extends any[]>(...args: T): T {
    return args;
}

const numbers: number[] = getArrayOfNumbers();
const t1 = tuple("foo", 1, true);  // [string, number, boolean]
const t2 = tuple("bar", ...numbers);  // [string, ...number[]]
```

The type of the `length` property of a tuple type with a rest element is `number`.

## New `unknown` top type

TypeScript 3.0 introduces a new top type `unknown`.
`unknown` is the type-safe counterpart of `any`.
Anything is assignable to `unknown`, but `unknown` isn't assignable to anything but itself and `any` without a type assertion or a control flow based narrowing.
Likewise, no operations are permitted on an `unknown` without first asserting or narrowing to a more specific type.

##### Example

```ts
// In an intersection everything absorbs unknown

type T00 = unknown & null;  // null
type T01 = unknown & undefined;  // undefined
type T02 = unknown & null & undefined;  // null & undefined (which becomes never)
type T03 = unknown & string;  // string
type T04 = unknown & string[];  // string[]
type T05 = unknown & unknown;  // unknown
type T06 = unknown & any;  // any

// In a union an unknown absorbs everything

type T10 = unknown | null;  // unknown
type T11 = unknown | undefined;  // unknown
type T12 = unknown | null | undefined;  // unknown
type T13 = unknown | string;  // unknown
type T14 = unknown | string[];  // unknown
type T15 = unknown | unknown;  // unknown
type T16 = unknown | any;  // any

// Type variable and unknown in union and intersection

type T20<T> = T & {};  // T & {}
type T21<T> = T | {};  // T | {}
type T22<T> = T & unknown;  // T
type T23<T> = T | unknown;  // unknown

// unknown in conditional types

type T30<T> = unknown extends T ? true : false;  // Deferred
type T31<T> = T extends unknown ? true : false;  // Deferred (so it distributes)
type T32<T> = never extends T ? true : false;  // true
type T33<T> = T extends never ? true : false;  // Deferred

// keyof unknown

type T40 = keyof any;  // string | number | symbol
type T41 = keyof unknown;  // never

// Only equality operators are allowed with unknown

function f10(x: unknown) {
    x == 5;
    x !== 10;
    x >= 0;  // Error
    x + 1;  // Error
    x * 2;  // Error
    -x;  // Error
    +x;  // Error
}

// No property accesses, element accesses, or function calls

function f11(x: unknown) {
    x.foo;  // Error
    x[5];  // Error
    x();  // Error
    new x();  // Error
}

// typeof, instanceof, and user defined type predicates

declare function isFunction(x: unknown): x is Function;

function f20(x: unknown) {
    if (typeof x === "string" || typeof x === "number") {
        x;  // string | number
    }
    if (x instanceof Error) {
        x;  // Error
    }
    if (isFunction(x)) {
        x;  // Function
    }
}

// Homomorphic mapped type over unknown

type T50<T> = { [P in keyof T]: number };
type T51 = T50<any>;  // { [x: string]: number }
type T52 = T50<unknown>;  // {}

// Anything is assignable to unknown

function f21<T>(pAny: any, pNever: never, pT: T) {
    let x: unknown;
    x = 123;
    x = "hello";
    x = [1, 2, 3];
    x = new Error();
    x = x;
    x = pAny;
    x = pNever;
    x = pT;
}

// unknown assignable only to itself and any

function f22(x: unknown) {
    let v1: any = x;
    let v2: unknown = x;
    let v3: object = x;  // Error
    let v4: string = x;  // Error
    let v5: string[] = x;  // Error
    let v6: {} = x;  // Error
    let v7: {} | null | undefined = x;  // Error
}

// Type parameter 'T extends unknown' not related to object

function f23<T extends unknown>(x: T) {
    let y: object = x;  // Error
}

// Anything but primitive assignable to { [x: string]: unknown }

function f24(x: { [x: string]: unknown }) {
    x = {};
    x = { a: 5 };
    x = [1, 2, 3];
    x = 123;  // Error
}

// Locals of type unknown always considered initialized

function f25() {
    let x: unknown;
    let y = x;
}

// Spread of unknown causes result to be unknown

function f26(x: {}, y: unknown, z: any) {
    let o1 = { a: 42, ...x };  // { a: number }
    let o2 = { a: 42, ...x, ...y };  // unknown
    let o3 = { a: 42, ...x, ...y, ...z };  // any
}

// Functions with unknown return type don't need return expressions

function f27(): unknown {
}

// Rest type cannot be created from unknown

function f28(x: unknown) {
    let { ...a } = x;  // Error
}

// Class properties of type unknown don't need definite assignment

class C1 {
    a: string;  // Error
    b: unknown;
    c: any;
}
```



## Support for `defaultProps` in JSX

TypeScript 2.9 and earlier didn’t leverage [React `defaultProps`](https://reactjs.org/docs/typechecking-with-proptypes.html#default-prop-values) declarations inside JSX components.
Users would often have to declare properties optional and use non-null assertions inside of `render`, or they'd use type-assertions to fix up the type of the component before exporting it.

TypeScript 3.0 adds supports a new type alias in the `JSX` namespace called `LibraryManagedAttributes`.
This helper type defines a transformation on the component's `Props` type, before using to check a JSX expression targeting it; thus allowing customization like: how conflicts between provided props and inferred props are handled, how inferences are mapped, how optionality is handled, and how inferences from differing places should be combined.

In short using this general type, we can model React's specific behavior for things like `defaultProps` and, to some extent, `propTypes`.

```tsx
export interface Props {
    name: string;
}

export class Greet extends React.Component<Props> {
    render() {
        const { name } = this.props;
        return <div>Hello ${name.toUpperCase()}!</div>;
    }
    static defaultProps = { name: "world"};
}

// Type-checks! No type assertions needed!
let el = <Greet />
```

### Caveats

#### Explicit types on `defaultProps`

The default-ed properties are inferred from the `defaultProps` property type. If an explicit type annotation is added, e.g. `static defaultProps: Partial<Props>;` the compiler will not be able to identify which properties have defaults (since the type of `defaultProps` include all properties of `Props`).

Use `static defaultProps: Pick<Props, "name">;` as an explicit type annotation instead, or do not add a type annotation as done in the example above.

For stateless function components (SFCs) use ES2015 default initializers for SFCs:

```tsx
function Greet({ name = "world" }: Props) {
    return <div>Hello ${name.toUpperCase()}!</div>;
}
```

##### Changes to `@types/React`

Corresponding changes to add `LibraryManagedAttributes` definition to the `JSX` namespace in `@types/React` are still needed.
Keep in mind that there are some limitations.

## `/// <reference lib="..." />` reference directives

TypeScript adds a new triple-slash-reference directive (`/// <reference lib="name" />`), allowing a file to explicitly include an existing built-in _lib_ file.

Built-in _lib_ files are referenced in the same fashion as the `"lib"` compiler option in _tsconfig.json_ (e.g. use `lib="es2015"` and not `lib="lib.es2015.d.ts"`, etc.).

For declaration file authors who rely on built-in types, e.g. DOM APIs or built-in JS run-time constructors like `Symbol` or `Iterable`, triple-slash-reference lib directives are the recommended. Previously these .d.ts files had to add forward/duplicate declarations of such types.

##### Example

Using `/// <reference lib="es2017.string" />` to one of the files in a compilation is equivalent to compiling with `--lib es2017.string`.

```ts
/// <reference lib="es2017.string" />

"foo".padStart(4);
```

## TypeScript 2.9

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

#### Example

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

type KE = keyof typeof enumToStringMap;   // Enum (i.e. Enum.A | Enum.B | Enum.C)
type KS = keyof typeof symbolToNumberMap; // typeof sym1 | typeof sym2 | typeof sym3

function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

let x1 = getValue(enumToStringMap, Enum.C);  // Returns "Name C"
let x2 = getValue(symbolToNumberMap, sym3);  // Returns 3
```

This is a breaking change; previously, the `keyof` operator and mapped types only supported `string` named properties.
Code that assumed values typed with `keyof T` were always `string`s, will now be flagged as error.

#### Example

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

#### Example

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

#### Example

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

#### Example

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

#### Example

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

#### Example

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

## TypeScript 2.8

## Conditional Types

TypeScript 2.8 introduces *conditional types* which add the ability to express non-uniform type mappings.
A conditional type selects one of two possible types based on a condition expressed as a type relationship test:

```ts
T extends U ? X : Y
```

The type above means when `T` is assignable to `U` the type is `X`, otherwise the type is `Y`.

A conditional type `T extends U ? X : Y` is either *resolved* to `X` or `Y`, or *deferred* because the condition depends on one or more type variables.
Whether to resolve or defer is determined as follows:

* First, given types `T'` and `U'` that are instantiations of `T` and `U` where all occurrences of type parameters are replaced with `any`, if `T'` is not assignable to `U'`, the conditional type is resolved to `Y`. Intuitively, if the most permissive instantiation of `T` is not assignable to the most permissive instantiation of `U`, we know that no instantiation will be and we can just resolve to `Y`.
* Next, for each type variable introduced by an `infer` (more later) declaration within `U` collect a set of candidate types by inferring from `T` to `U` (using the same inference algorithm as type inference for generic functions). For a given `infer` type variable `V`, if any candidates were inferred from co-variant positions, the type inferred for `V` is a union of those candidates. Otherwise, if any candidates were inferred from contra-variant positions, the type inferred for `V` is an intersection of those candidates. Otherwise, the type inferred for `V` is `never`.
* Then, given a type `T''` that is an instantiation of `T` where all `infer` type variables are replaced with the types inferred in the previous step, if `T''` is *definitely assignable* to `U`, the conditional type is resolved to `X`. The definitely assignable relation is the same as the regular assignable relation, except that type variable constraints are not considered. Intuitively, when a type is definitely assignable to another type, we know that it will be assignable for *all instantiations* of those types.
* Otherwise, the condition depends on one or more type variables and the conditional type is deferred.

#### Example

```ts
type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";

type T0 = TypeName<string>;  // "string"
type T1 = TypeName<"a">;  // "string"
type T2 = TypeName<true>;  // "boolean"
type T3 = TypeName<() => void>;  // "function"
type T4 = TypeName<string[]>;  // "object"
```

### Distributive conditional types

Conditional types in which the checked type is a naked type parameter are called *distributive conditional types*.
Distributive conditional types are automatically distributed over union types during instantiation.
For example, an instantiation of `T extends U ? X : Y` with the type argument `A | B | C` for `T` is resolved as `(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`.

#### Example

```ts
type T10 = TypeName<string | (() => void)>;  // "string" | "function"
type T12 = TypeName<string | string[] | undefined>;  // "string" | "object" | "undefined"
type T11 = TypeName<string[] | number[]>;  // "object"
```

In instantiations of a distributive conditional type `T extends U ? X : Y`, references to `T` within the conditional type are resolved to individual constituents of the union type (i.e. `T` refers to the individual constituents *after* the conditional type is distributed over the union type).
Furthermore, references to `T` within `X` have an additional type parameter constraint `U` (i.e. `T` is considered assignable to `U` within `X`).

#### Example

```ts
type BoxedValue<T> = { value: T };
type BoxedArray<T> = { array: T[] };
type Boxed<T> = T extends any[] ? BoxedArray<T[number]> : BoxedValue<T>;

type T20 = Boxed<string>;  // BoxedValue<string>;
type T21 = Boxed<number[]>;  // BoxedArray<number>;
type T22 = Boxed<string | number[]>;  // BoxedValue<string> | BoxedArray<number>;
```

Notice that `T` has the additional constraint `any[]` within the true branch of `Boxed<T>` and it is therefore possible to refer to the element type of the array as `T[number]`. Also, notice how the conditional type is distributed over the union type in the last example.

The distributive property of conditional types can conveniently be used to *filter* union types:

```ts
type Diff<T, U> = T extends U ? never : T;  // Remove types from T that are assignable to U
type Filter<T, U> = T extends U ? T : never;  // Remove types from T that are not assignable to U

type T30 = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"
type T31 = Filter<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "a" | "c"
type T32 = Diff<string | number | (() => void), Function>;  // string | number
type T33 = Filter<string | number | (() => void), Function>;  // () => void

type NonNullable<T> = Diff<T, null | undefined>;  // Remove null and undefined from T

type T34 = NonNullable<string | number | undefined>;  // string | number
type T35 = NonNullable<string | string[] | null | undefined>;  // string | string[]

function f1<T>(x: T, y: NonNullable<T>) {
    x = y;  // Ok
    y = x;  // Error
}

function f2<T extends string | undefined>(x: T, y: NonNullable<T>) {
    x = y;  // Ok
    y = x;  // Error
    let s1: string = x;  // Error
    let s2: string = y;  // Ok
}
```

Conditional types are particularly useful when combined with mapped types:

```ts
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

interface Part {
    id: number;
    name: string;
    subparts: Part[];
    updatePart(newName: string): void;
}

type T40 = FunctionPropertyNames<Part>;  // "updatePart"
type T41 = NonFunctionPropertyNames<Part>;  // "id" | "name" | "subparts"
type T42 = FunctionProperties<Part>;  // { updatePart(newName: string): void }
type T43 = NonFunctionProperties<Part>;  // { id: number, name: string, subparts: Part[] }
```

Similar to union and intersection types, conditional types are not permitted to reference themselves recursively. For example the following is an error.

#### Example

```ts
type ElementType<T> = T extends any[] ? ElementType<T[number]> : T;  // Error
```

### Type inference in conditional types

Within the `extends` clause of a conditional type, it is now possible to have `infer` declarations that introduce a type variable to be inferred.
Such inferred type variables may be referenced in the true branch of the conditional type.
It is possible to have multiple `infer` locations for the same type variable.

For example, the following extracts the return type of a function type:

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

Conditional types can be nested to form a sequence of pattern matches that are evaluated in order:

```ts
type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

type T0 = Unpacked<string>;  // string
type T1 = Unpacked<string[]>;  // string
type T2 = Unpacked<() => string>;  // string
type T3 = Unpacked<Promise<string>>;  // string
type T4 = Unpacked<Promise<string>[]>;  // Promise<string>
type T5 = Unpacked<Unpacked<Promise<string>[]>>;  // string
```

The following example demonstrates how multiple candidates for the same type variable in co-variant positions causes a union type to be inferred:

```ts
type Foo<T> = T extends { a: infer U, b: infer U } ? U : never;
type T10 = Foo<{ a: string, b: string }>;  // string
type T11 = Foo<{ a: string, b: number }>;  // string | number
```

Likewise, multiple candidates for the same type variable in contra-variant positions causes an intersection type to be inferred:

```ts
type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;
type T20 = Bar<{ a: (x: string) => void, b: (x: string) => void }>;  // string
type T21 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
```

When inferring from a type with multiple call signatures (such as the type of an overloaded function), inferences are made from the *last* signature (which, presumably, is the most permissive catch-all case).
It is not possible to perform overload resolution based on a list of argument types.

```ts
declare function foo(x: string): number;
declare function foo(x: number): string;
declare function foo(x: string | number): string | number;
type T30 = ReturnType<typeof foo>;  // string | number
```

It is not possible to use `infer` declarations in constraint clauses for regular type parameters:

```ts
type ReturnType<T extends (...args: any[]) => infer R> = R;  // Error, not supported
```

However, much the same effect can be obtained by erasing the type variables in the constraint and instead specifying a conditional type:

```ts
type AnyFunction = (...args: any[]) => any;
type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R ? R : any;
```


### Predefined conditional types

TypeScript 2.8 adds several predefined conditional types to `lib.d.ts`:

* `Exclude<T, U>` -- Exclude from `T` those types that are assignable to `U`.
* `Extract<T, U>` -- Extract from `T` those types that are assignable to `U`.
* `NonNullable<T>` -- Exclude `null` and `undefined` from `T`.
* `ReturnType<T>` -- Obtain the return type of a function type.
* `InstanceType<T>` -- Obtain the instance type of a constructor function type.

#### Example

```ts
type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "a" | "c"

type T02 = Exclude<string | number | (() => void), Function>;  // string | number
type T03 = Extract<string | number | (() => void), Function>;  // () => void

type T04 = NonNullable<string | number | undefined>;  // string | number
type T05 = NonNullable<(() => string) | string[] | null | undefined>;  // (() => string) | string[]

function f1(s: string) {
    return { a: 1, b: s };
}

class C {
    x = 0;
    y = 0;
}

type T10 = ReturnType<() => string>;  // string
type T11 = ReturnType<(s: string) => void>;  // void
type T12 = ReturnType<(<T>() => T)>;  // {}
type T13 = ReturnType<(<T extends U, U extends number[]>() => T)>;  // number[]
type T14 = ReturnType<typeof f1>;  // { a: number, b: string }
type T15 = ReturnType<any>;  // any
type T16 = ReturnType<never>;  // any
type T17 = ReturnType<string>;  // Error
type T18 = ReturnType<Function>;  // Error

type T20 = InstanceType<typeof C>;  // C
type T21 = InstanceType<any>;  // any
type T22 = InstanceType<never>;  // any
type T23 = InstanceType<string>;  // Error
type T24 = InstanceType<Function>;  // Error
```

> Note: The `Exclude` type is a proper implementation of the `Diff` type suggested [here](https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-307871458). We've used the name `Exclude` to avoid breaking existing code that defines a `Diff`, plus we feel that name better conveys the semantics of the type. We did not include the `Omit<T, K>` type because it is trivially written as `Pick<T, Exclude<keyof T, K>>`.

## Improved control over mapped type modifiers

Mapped types support adding a `readonly` or `?` modifier to a mapped property, but they did not provide support the ability to *remove* modifiers.
This matters in [*homomorphic mapped types*](https://github.com/Microsoft/TypeScript/pull/12563) which by default preserve the modifiers of the underlying type.

TypeScript 2.8 adds the ability for a mapped type to either add or remove a particular modifier.
Specifically, a `readonly` or `?` property modifier in a mapped type can now be prefixed with either `+` or `-` to indicate that the modifier should be added or removed.

#### Example

```ts
type MutableRequired<T> = { -readonly [P in keyof T]-?: T[P] };  // Remove readonly and ?
type ReadonlyPartial<T> = { +readonly [P in keyof T]+?: T[P] };  // Add readonly and ?
```

A modifier with no `+` or `-` prefix is the same as a modifier with a `+` prefix. So, the `ReadonlyPartial<T>` type above corresponds to

```ts
type ReadonlyPartial<T> = { readonly [P in keyof T]?: T[P] };  // Add readonly and ?
```

Using this ability, `lib.d.ts` now has a new  `Required<T>` type.
This type strips `?` modifiers from all properties of `T`, thus making all properties required.

#### Example

```ts
type Required<T> = { [P in keyof T]-?: T[P] };
```

Note that in `--strictNullChecks` mode, when a homomorphic mapped type removes a `?` modifier from a property in the underlying type it also removes `undefined` from the type of that property:

#### Example

```ts
type Foo = { a?: string };  // Same as { a?: string | undefined }
type Bar = Required<Foo>;  // Same as { a: string }
```

## Improved `keyof` with intersection types

With TypeScript 2.8 `keyof` applied to an intersection type is transformed to a union of `keyof` applied to each intersection constituent.
In other words, types of the form `keyof (A & B)` are transformed to be `keyof A | keyof B`.
This change should address inconsistencies with inference from `keyof` expressions.

#### Example

```ts
type A = { a: string };
type B = { b: string };

type T1 = keyof (A & B);  // "a" | "b"
type T2<T> = keyof (T & B);  // keyof T | "b"
type T3<U> = keyof (A & U);  // "a" | keyof U
type T4<T, U> = keyof (T & U);  // keyof T | keyof U
type T5 = T2<A>;  // "a" | "b"
type T6 = T3<B>;  // "a" | "b"
type T7 = T4<A, B>;  // "a" | "b"
```

## Better handling for namespace patterns in `.js` files

TypeScript 2.8 adds support for understanding more namespace patterns in `.js` files.
Empty object literals declarations on top level, just like functions and classes, are now recognized as as namespace declarations in JavaScript.

```js
var ns = {};     // recognized as a declaration for a namespace `ns`
ns.constant = 1; // recognized as a declaration for var `constant`
```

Assignments at the top-level should behave the same way; in other words, a `var` or `const` declaration is not required.

```js
app = {}; // does NOT need to be `var app = {}`
app.C = class {
};
app.f = function() {
};
app.prop = 1;
```

### IIFEs as namespace declarations

An IIFE returning a function, class or empty object literal, is also recognized as a namespace:

```js
var C = (function () {
  function C(n) {
    this.p = n;
  }
  return C;
})();
C.staticProperty = 1;
```

### Defaulted declarations

"Defaulted declarations" allow initializers that reference the declared name in the left side of a logical or:

```js
my = window.my || {};
my.app = my.app || {};
```

### Prototype assignment

You can assign an object literal directly to the prototype property. Individual prototype assignments still work too:

```ts
var C = function (p) {
  this.p = p;
};
C.prototype = {
  m() {
    console.log(this.p);
  }
};
C.prototype.q = function(r) {
  return this.p === r;
};
```

### Nested and merged declarations

Nesting works to any level now, and merges correctly across files. Previously neither was the case.

```js
var app = window.app || {};
app.C = class { };
```

## Per-file JSX factories

TypeScript 2.8 adds support for a per-file configurable JSX factory name using `@jsx dom` paragma.
JSX factory can be configured for a compilation using `--jsxFactory` (default is `React.createElement`). With TypeScript 2.8 you can override this on a per-file-basis by adding a comment to the beginning of the file.

#### Example

```ts
/** @jsx dom */
import { dom } from "./renderer"
<h></h>
```

Generates:

```js
var renderer_1 = require("./renderer");
renderer_1.dom("h", null);
```

## Locally scoped JSX namespaces

JSX type checking is driven by definitions in a JSX namespace, for instance `JSX.Element` for the type of a JSX element, and `JSX.IntrinsicElements` for built-in elements.
Before TypeScript 2.8 the `JSX` namespace was expected to be in the global namespace, and thus only allowing one to be defined in a project.
Starting with TypeScript 2.8 the `JSX` namespace will be looked under the `jsxNamespace` (e.g. `React`) allowing for multiple jsx factories in one compilation.
For backward compatibility the global `JSX` namespace is used as a fallback if none was defined on the factory function.
Combined with the per-file `@jsx` pragma, each file can have a different JSX factory.

## New `--emitDeclarationsOnly`

`--emitDeclarationsOnly` allows for *only* generating declaration files; `.js`/`.jsx` output generation will be skipped with this flag. The flag is useful when the `.js` output generation is handled by a different transpiler like Babel.

## TypeScript 2.7

## Constant-named properties

TypeScript 2.7 adds support for declaring const-named properties on types including ECMAScript symbols.

#### Example

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

#### Example

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

### `unique symbol`

To enable treating symbols as unique literals  a new type `unique symbol` is available.
`unique symbol` is are subtype of `symbol`, and are produced only from calling `Symbol()` or `Symbol.for()`, or from explicit type annotations.
The new type is only allowed on `const` declarations and `readonly static` properties, and in order to reference a specific unique symbol, you'll have to use the `typeof` operator.
Each reference to a `unique symbol` implies a completely unique identity that's tied to a given declaration.

#### Example

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

#### Example

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

For example:

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

#### Example

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

#### Example:

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

#### Example

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

## Support for `import d from "cjs"` form CommonJS modules with `--esModuleInterop`

TypeScript 2.7 updates CommonJS/AMD/UMD module emit to synthesize namespace records based on the presence of an `__esModule` indicator under `--esModuleInterop`.
The change brings the generated output from TypeScript closer to that generated by Babel.

Previously CommonJS/AMD/UMD modules were treated in the same way as ES6 modules, resulting in a couple of problems. Namely:

* TypeScript treats a namespace import (i.e. `import * as foo from "foo"`) for a CommonJS/AMD/UMD module as equivalent to `const foo = require("foo")`.
Things are simple here, but they don't work out if the primary object being imported is a primitive or a class or a function.
ECMAScript spec stipulates that a namespace record is a plain object, and that a namespace import (`foo` in the example above) is not callable, though allowed by TypeScript

* Similarly a default import (i.e. `import d from "foo"`) for a CommonJS/AMD/UMD module as equivalent to `const d = require("foo").default`.
Most of the CommonJS/AMD/UMD modules available today do not have a `default` export, making this import pattern practically unusable to import non-ES modules (i.e. CommonJS/AMD/UMD). For instance `import fs from "fs"` or `import express from "express"` are not allowed.

Under the new `--esModuleInterop` these two issues should be addressed:
* A namespace import (i.e. `import * as foo from "foo"`) is now correctly flagged as uncallabale. Calling it will result in an error.
* Default imports to CommonJS/AMD/UMD are now allowed (e.g. `import fs from "fs"`), and should work as expected.

> Note: The new behavior is added under a flag to avoid unwarranted breaks to existing code bases. We highly recommend applying it both to new and existing projects.
> For existing projects, namespace imports (`import * as express from "express"; express();`) will need to be converted to default imports (`import express from "express"; express();`).

#### Example

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
const milion = 1_000_000;
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


## TypeScript 2.6

## Strict function types

TypeScript 2.6 introduces a new strict checking flag, `--strictFunctionTypes`.
The `--strictFunctionTypes` switch is part of the `--strict` family of switches, meaning that it defaults to on in `--strict` mode.
You can opt-out by setting `--strictFunctionTypes false` on your command line or in your tsconfig.json.

Under `--strictFunctionTypes` function type parameter positions are checked _contravariantly_ instead of _bivariantly_.
For some background on what variance means for function types check out [What are covariance and contravariance?](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance).

The stricter checking applies to all function types, *except* those originating in method or constructor declarations.
Methods are excluded specifically to ensure generic classes and interfaces (such as `Array<T>`) continue to mostly relate covariantly.

Consider the following example in which `Animal` is the supertype of `Dog` and `Cat`:

```ts
declare let f1: (x: Animal) => void;
declare let f2: (x: Dog) => void;
declare let f3: (x: Cat) => void;
f1 = f2;  // Error with --strictFunctionTypes
f2 = f1;  // Ok
f2 = f3;  // Error
```

The first assignment is permitted in default type checking mode, but flagged as an error in strict function types mode.
Intuitively, the default mode permits the assignment because it is _possibly_ sound, whereas strict function types mode makes it an error because it isn't _provably_ sound.
In either mode the third assignment is an error because it is _never_ sound.

Another way to describe the example is that the type `(x: T) => void` is _bivariant_ (i.e. covariant _or_ contravariant) for `T` in default type checking mode, but _contravariant_ for `T` in strict function types mode.

#### Example

```ts
interface Comparer<T> {
    compare: (a: T, b: T) => number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer;  // Error
dogComparer = animalComparer;  // Ok
```

The first assignment is now an error. Effectively, `T` is contravariant in `Comparer<T>` because it is used only in function type parameter positions.

By the way, note that whereas some languages (e.g. C# and Scala) require variance annotations (`out`/`in` or `+`/`-`), variance emerges naturally from the actual use of a type parameter within a generic type due to TypeScript's structural type system.

#### Note:

Under `--strictFunctionTypes` the first assignment is still permitted if `compare` was declared as a method.
Effectively, `T` is bivariant in `Comparer<T>` because it is used only in method parameter positions.

```ts
interface Comparer<T> {
    compare(a: T, b: T): number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer;  // Ok because of bivariance
dogComparer = animalComparer;  // Ok
```

TypeScript 2.6 also improves type inference involving contravariant positions:

```ts
function combine<T>(...funcs: ((x: T) => void)[]): (x: T) => void {
    return x => {
        for (const f of funcs) f(x);
    }
}

function animalFunc(x: Animal) {}
function dogFunc(x: Dog) {}

let combined = combine(animalFunc, dogFunc);  // (x: Dog) => void
```

Above, all inferences for `T` originate in contravariant positions, and we therefore infer the *best common subtype* for `T`.
This contrasts with inferences from covariant positions, where we infer the *best common supertype*.

## Support for JSX Fragment Syntax

TypeScript 2.6.2 adds support for the new `<>...</>` syntax for fragments in JSX.
It is frequently desirable to return multiple children from a component.
However, this is invalid, so the usual approach has been to wrap the text in an extra element, such as a `<div>` or `<span>` as shown below.

```tsx
render() {
    return (
        <div>
            Some text.
            <h2>A heading</h2>
            More text.
        </div>
    );
}
```

To address this pattern, React introduced the `React.Fragment` component, which provides a dedicated way to wrap such elements without adding an element to the DOM.
Correspondingly, the `<>...</>` syntax was added to JSX to facilitate this new construct. Therefore, the above scenario becomes:
```tsx
render() {
    return (
        <>
            Some text.
            <h2>A heading</h2>
            More text.
        </>
    );
}
```

Under `--jsx preserve`, the new syntax is left untouched for TypeScript emit. Otherwise, for `--jsx react`, `<>...</>` is compiled to `React.createElement(React.Fragment, null, ...)`, where `React.createElement` respects `--jsxFactory`.
Note that it is an error to use `<>...</>` when `--jsx react` and `--jsxFactory` are both enabled.

Please refer to [the React blog](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html) for more details on fragments and the new syntax.

## Cache tagged template objects in modules

TypeScript 2.6 fixes the tagged string template emit to align better with the ECMAScript spec.
As per the [ECMAScript spec](https://tc39.github.io/ecma262/#sec-gettemplateobject), every time a template tag is evaluated, the _same_ template strings object (the same `TemplateStringsArray`) should be passed as the first argument.
Before TypeScript 2.6, the generated output was a completely new template object each time.
Though the string contents are the same, this emit affects libraries that use the identity of the string for cache invalidation purposes, e.g. [lit-html](https://github.com/PolymerLabs/lit-html/issues/58).

#### Example

```ts
export function id(x: TemplateStringsArray) {
    return x;
}

export function templateObjectFactory() {
    return id`hello world`;
}

let result = templateObjectFactory() === templateObjectFactory(); // true in TS 2.6
```

Results in the following generated code:

```js
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function id(x) {
    return x;
}

var _a;
function templateObjectFactory() {
    return id(_a || (_a = __makeTemplateObject(["hello world"], ["hello world"])));
}

var result = templateObjectFactory() === templateObjectFactory();
```

> Note: This change brings a new emit helper, `__makeTemplateObject`;
if you are using `--importHelpers` with [`tslib`](https://github.com/Microsoft/tslib), an updated to version 1.8 or later.

## Localized diagnostics on the command line

TypeScript 2.6 npm package ships with localized versions of diagnostic messages for 13 languages.
The localized messages are available when using `--locale` flag on the command line.

#### Example

Error messages in Russian:

```sh
c:\ts>tsc --v
Version 2.6.0-dev.20171003

c:\ts>tsc --locale ru --pretty c:\test\a.ts

../test/a.ts(1,5): error TS2322: Тип ""string"" не может быть назначен для типа "number".

1 var x: number = "string";
      ~
```

And help in Japanese:

```sh
PS C:\ts> tsc --v
Version 2.6.0-dev.20171003

PS C:\ts> tsc --locale ja-jp
バージョン 2.6.0-dev.20171003
構文: tsc [オプション] [ファイル ...]

例:  tsc hello.ts
    tsc --outFile file.js file.ts
    tsc @args.txt

オプション:
 -h, --help                                 このメッセージを表示します。
 --all                                      コンパイラ オプションをすべて表示します。
 -v, --version                              コンパイラのバージョンを表示します。
 --init                                     TypeScript プロジェクトを初期化して、tsconfig.json ファイルを作成します。
 -p ファイルまたはディレクトリ, --project ファイルまたはディレクトリ  構成ファイルか、'tsconfig.json' を含むフォルダーにパスが指定されたプロジェクトをコ
ンパイルします。
 --pretty                                   色とコンテキストを使用してエラーとメッセージにスタイルを適用します (試験的)。
 -w, --watch                                入力ファイルを監視します。
 -t バージョン, --target バージョン                   ECMAScript のターゲット バージョンを指定します: 'ES3' (既定)、'ES5'、'ES2015'、'ES2016'、'ES2017'、'ES
NEXT'。
 -m 種類, --module 種類                         モジュール コード生成を指定します: 'none'、'commonjs'、'amd'、'system'、'umd'、'es2015'、'ESNext'。
 --lib                                      コンパイルに含めるライブラリ ファイルを指定します:
                                              'es5' 'es6' 'es2015' 'es7' 'es2016' 'es2017' 'esnext' 'dom' 'dom.iterable' 'webworker' 'scripthost' 'es201
5.core' 'es2015.collection' 'es2015.generator' 'es2015.iterable' 'es2015.promise' 'es2015.proxy' 'es2015.reflect' 'es2015.symbol' 'es2015.symbol.wellkno
wn' 'es2016.array.include' 'es2017.object' 'es2017.sharedmemory' 'es2017.string' 'es2017.intl' 'esnext.asynciterable'
 --allowJs                                  javascript ファイルのコンパイルを許可します。
 --jsx 種類                                   JSX コード生成を指定します: 'preserve'、'react-native'、'react'。
 -d, --declaration                          対応する '.d.ts' ファイルを生成します。
 --sourceMap                                対応する '.map' ファイルを生成します。
 --outFile ファイル                             出力を連結して 1 つのファイルを生成します。
 --outDir ディレクトリ                            ディレクトリへ出力構造をリダイレクトします。
 --removeComments                           コメントを出力しないでください。
 --noEmit                                   出力しないでください。
 --strict                                   strict 型チェックのオプションをすべて有効にします。
 --noImplicitAny                            暗黙的な 'any' 型を含む式と宣言に関するエラーを発生させます。
 --strictNullChecks                         厳格な null チェックを有効にします。
 --noImplicitThis                           暗黙的な 'any' 型を持つ 'this' 式でエラーが発生します。
 --alwaysStrict                             厳格モードで解析してソース ファイルごとに "use strict" を生成します。
 --noUnusedLocals                           使用されていないローカルに関するエラーを報告します。
 --noUnusedParameters                       使用されていないパラメーターに関するエラーを報告します。
 --noImplicitReturns                        関数の一部のコード パスが値を返さない場合にエラーを報告します。
 --noFallthroughCasesInSwitch               switch ステートメントに case のフォールスルーがある場合にエラーを報告します。
 --types                                    コンパイルに含む型宣言ファイル。
 @<ファイル>
```

## Suppress errors in .ts files using '// @ts-ignore' comments

TypeScript 2.6 support suppressing errors in .js files using `// @ts-ignore` comments placed above the offending lines.

#### Example

```ts
if (false) {
    // @ts-ignore: Unreachable code error
    console.log("hello");
}
```

A `// @ts-ignore` comment suppresses all errors that originate on the following line.
It is recommended practice to have the remainder of the comment following `@ts-ignore` explain which error is being suppressed.

Please note that this comment only suppresses the error reporting, and we recommend you use this comments _very sparingly_.

## Faster `tsc --watch`

TypeScript 2.6 brings a faster `--watch` implementation.
The new version optimizes code generation and checking for code bases using ES modules.
Changes detected in a module file will result in _only_ regenerating the changed module, and files that depend on it, instead of the whole project.
Projects with large number of files should reap the most benefit from this change.

The new implementation also brings performance enhancements to watching in tsserver.
The watcher logic has been completely rewritten to respond faster to change events.

## Write-only references now flagged as unused

TypeScript 2.6 adds revised implementation  the `--noUnusedLocals` and `--noUnusedParameters` [compiler options](/docs/handbook/compiler-options.html).
Declarations are only written to but never read from are now flagged as unused.

#### Example

Bellow both `n` and `m` will be marked as unused, because their values are never *read*. Previously TypeScript would only check whether their values were *referenced*.

```ts
function f(n: number) {
    n = 0;
}

class C {
    private m: number;
    constructor() {
        this.m = 0;
    }
}
```

Also functions that are only called within their own bodies are considered unused.

#### Example

```ts
function f() {
    f(); // Error: 'f' is declared but its value is never read
}
```

## TypeScript 2.5

## Optional `catch` clause variables

Thanks to work done by [@tinganho](https://github.com/tinganho), TypeScript 2.5 implements a new ECMAScript feature that allows users to omit the variable in `catch` clauses.
For example, when using `JSON.parse` you may need to wrap calls to the function with a `try`/`catch`, but you may not end up using the `SyntaxError` that gets thrown when input is erroneous.

```ts
let input = "...";
try {
    JSON.parse(input);
}
catch {
    // ^ Notice that our `catch` clause doesn't declare a variable.
    console.log("Invalid JSON given\n\n" + input)
}
```

## Type assertion/cast syntax in `checkJs`/`@ts-check` mode

TypeScript 2.5 introduces the ability to [assert the type of expressions when using plain JavaScript in your projects](https://github.com/Microsoft/TypeScript/issues/5158).
The syntax is an `/** @type {...} */` annotation comment followed by a parenthesized expression whose type needs to be re-evaluated.
For example:

```ts
var x = /** @type {SomeType} */ (AnyParenthesizedExpression);
```

## Deduplicated and redirected packages

When importing using the `Node` module resolution strategy in TypeScript 2.5, the compiler will now check whether files originate from "identical" packages.
If a file originates from a package with a `package.json` containing the same `name` and `version` fields as a previously encountered package, then TypeScript will redirect itself to the top-most package.
This helps resolve problems where two packages might contain identical declarations of classes, but which contain `private` members that cause them to be structurally incompatible.

As a nice bonus, this can also reduce the memory and runtime footprint of the compiler and language service by avoiding loading `.d.ts` files from duplicate packages.

## The `--preserveSymlinks` compiler flag

TypeScript 2.5 brings the `preserveSymlinks` flag, which parallels the behavior of [the `--preserve-symlinks` flag in Node.js](https://nodejs.org/api/cli.html#cli_preserve_symlinks).
This flag also exhibits the opposite behavior to Webpack's `resolve.symlinks` option (i.e. setting TypeScript's `preserveSymlinks` to `true` parallels setting Webpack's `resolve.symlinks` to `false`, and vice-versa).

In this mode, references to modules and packages (e.g. `import`s and `/// <reference type="..." />` directives) are all resolved relative to the location of the symbolic link file, rather than relative to the path that the symbolic link resolves to.
For a more concrete example, we'll defer to [the documentation on the Node.js website](https://nodejs.org/api/cli.html#cli_preserve_symlinks).

## TypeScript 2.4

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
    data?: string;
    timeout?: number;
    maxRetries?: number;
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

## TypeScript 2.3

## Generators and Iteration for ES5/ES3

*First some ES2016 terminology:*

#### Iterators

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

#### Generators

[ES2015 also introduced "Generators"](http://www.ecma-international.org/ecma-262/6.0/#sec-generatorfunction-objects), which are functions that can be used to yield partial computation results via the `Iterator` interface and the `yield` keyword.
Generators can also internally delegate calls to another iterable through `yield *`. For example:

```ts
function* f() {
  yield 1;
  yield* [2, 3];
}
```

#### New `--downlevelIteration`

Previously generators were only supported if the target is ES6/ES2015 or later.
Moreover, constructs that operate on the Iterator protocol, e.g. `for..of` were only supported if they operate on arrays for targets below ES6/ES2015.

TypeScript 2.3 adds full support for generators and the Iterator protocol for ES3 and ES5 targets with `--downlevelIteration` flag.

With `--downlevelIteration`, the compiler uses new type check and emit behavior that attempts to call a `[Symbol.iterator]()` method on the iterated object if it is found, and creates a synthetic array iterator over the object if it is not.

> Please note that this requires a native `Symbol.iterator` or `Symbol.iterator` shim at runtime for any non-array values.

`for..of` statements,  Array Destructuring, and Spread elements in Array, Call, and New expressions support `Symbol.iterator` in ES5/E3 if available when using `--downlevelIteration`, but can be used on an Array even if it does not define `Symbol.iterator` at run time or design time.


## Async Iteration

TypeScript 2.3 adds support for the async iterators and generators as described by the current [TC39 proposal](https://github.com/tc39/proposal-async-iteration).


#### Async iterators

The Async Iteration introduces an `AsyncIterator`, which is similar to `Iterator`.
The difference lies in the fact that the `next`, `return`, and `throw` methods of an `AsyncIterator` return a `Promise` for the iteration result, rather than the result itself. This allows the caller to enlist in an asynchronous notification for the time at which the `AsyncIterator` has advanced to the point of yielding a value.
An `AsyncIterator` has the following shape:

```ts
interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}
```

An object that supports async iteration is said to be "iterable" if it has a `Symbol.asyncIterator` method that returns an `AsyncIterator` object.


#### Async Generators

The [Async Iteration proposal](https://github.com/tc39/proposal-async-iteration) introduces "Async Generators", which are async functions that also can be used to yield partial computation results. Async Generators can also delegate calls via `yield*` to either an iterable or async iterable:

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

As with Generators, Async Generators can only be function declarations, function expressions, or methods of classes or object literals. Arrow functions cannot be Async Generators. Async Generators require a valid, global `Promise` implementation (either native or an ES2015-compatible polyfill), in addition to a valid `Symbol.asyncIterator` reference (either a native symbol or a shim).

#### The `for-await-of` Statement

With ES2015, ECMAScript introduced the `for..of` statement as a means of iterating over an iterable.
Similarly, the Async Iteration proposal introduces the `for..await..of` statement to iterate over an async iterable:

```ts
async function f() {
  for await (const x of g()) {
     console.log(x);
  }
}
```

The `for..await..of` statement is only legal within an Async Function or Async Generator.

#### Caveats

* Keep in mind that our support for async iterators relies on support for `Symbol.asyncIterator` to exist at runtime.
You may need to polyfill `Symbol.asyncIterator`, which for simple purposes can be as simple as: `(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.from("Symbol.asyncIterator");`
* You also need to include `esnext` in your `--lib` option, to get the `AsyncIterator` declaration if you do not already have it.
* Finally, if your target is ES5 or ES3, you'll also need to set the `--downlevelIterators` flag.

## Generic parameter defaults

TypeScript 2.3 adds support for declaring defaults for generic type parameters.

#### Example

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
* If a default type is specified and inference cannot chose a candidate, the default type is inferred.
* A class or interface declaration that merges with an existing class or interface declaration may introduce a default for an existing type parameter.
* A class or interface declaration that merges with an existing class or interface declaration may introduce a new type parameter as long as it specifies a default.

## New `--strict` master option

New checks added to TypeScript are often off by default to avoid breaking existing projects. While avoiding breakage is a good thing, this strategy has the drawback of making it increasingly complex to choose the highest level of type safety, and doing so requires explicit opt-in action on every TypeScript release. With the `--strict` option it becomes possible to choose maximum type safety with the understanding that additional errors might be reported by newer versions of the compiler as improved type checking features are added.

The new `--strict` compiler option represents the recommended setting of a number of type checking options. Specifically, specifying `--strict` corresponds to specifying all of the following options (and may in the future include more options):

* `--strictNullChecks`
* `--noImplicitAny`
* `--noImplicitThis`
* `--alwaysStrict`


In exact terms, the `--strict` option sets the *default* value for the compiler options listed above. This means it is still possible to individually control the options. For example,

```
--strict --noImplicitThis false
```

has the effect of turning on all strict options *except* the `--noImplicitThis` option. Using this scheme it is possible to express configurations consisting of *all* strict options except some explicitly listed options. In other words, it is now possible to default to the highest level of type safety but opt out of certain checks.

Starting with TypeScript 2.3, the default `tsconfig.json` generated by `tsc --init` includes a `"strict": true` setting in the `"compilerOptions"` section. Thus, new projects started with `tsc --init` will by default have the highest level of type safety enabled.

## Enhanced `--init` output

Along with setting `--strict` on by default, `tsc --init` has an enhanced output. Default `tsconfig.json` files generated by `tsc --init` now include a set of the common compiler options along with their descriptions commented out. Just un-comment the configuration you like to set to get the desired behavior; we hope the new output simplifies the setting up new projects and keeps configuration files readable as projects grow.

## Errors in .js files with `--checkJs`

By default the TypeScript compiler does not report any errors in .js files including using `--allowJs`. With TypeScript 2.3 type-checking errors can also be reported in `.js` files with `--checkJs`.

You can skip checking some files by adding `// @ts-nocheck` comment to them; conversely you can choose to check only a few `.js` files by adding `// @ts-check` comment to them without setting `--checkJs`. You can also ignore errors on specific lines by adding `// @ts-ignore` on the preceding line.

`.js` files are still checked to ensure that they only include standard ECMAScript features; type annotations are only allowed in `.ts` files and are flagged as errors in `.js` files. JSDoc comments can be used to add some type information to your JavaScript code, see [JSDoc Support documentation](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript) for more details about the supported JSDoc constructs.

See [Type checking JavaScript Files documentation](https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files) for more details.

## TypeScript 2.2

## Support for Mix-in classes

TypeScript 2.2 adds support for the ECMAScript 2015 mixin class pattern (see [MDN Mixin description](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Mix-ins) and ["Real" Mixins with JavaScript Classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) for more details) as well as rules for combining mixin construct signatures with regular construct signatures in intersection types.

##### First some terminology:

- A **mixin constructor type** refers to a type that has a single construct signature with a single rest argument of type `any[]` and an object-like return type. For example, given an object-like type `X`, `new (...args: any[]) => X` is a mixin constructor type with an instance type `X`.

- A **mixin class** is a class declaration or expression that `extends` an expression of a type parameter type. The following rules apply to mixin class declarations:

 * The type parameter type of the `extends` expression must be constrained to a mixin constructor type.
 * The constructor of a mixin class (if any) must have a single rest parameter of type `any[]` and must use the spread operator to pass those parameters as arguments in a `super(...args)` call.

Given an expression `Base` of a parametric type `T` with a constraint `X`, a mixin class `class C extends Base {...}` is processed as if `Base` had type `X` and the resulting type is the intersection `typeof C & T`. In other words, a mixin class is represented as an intersection between the mixin class constructor type and the parametric base class constructor type.

When obtaining the construct signatures of an intersection type that contains mixin constructor types, the mixin construct signatures are discarded and their instance types are mixed into the return types of the other construct signatures in the intersection type. For example, the intersection type `{ new(...args: any[]) => A } & { new(s: string) => B }` has a single construct signature `new(s: string) => A & B`.

##### Putting all of the above rules together in an example:

```ts
class Point {
    constructor(public x: number, public y: number) {}
}

class Person {
    constructor(public name: string) {}
}

type Constructor<T> = new(...args: any[]) => T;

function Tagged<T extends Constructor<{}>>(Base: T) {
    return class extends Base {
        _tag: string;
        constructor(...args: any[]) {
            super(...args);
            this._tag = "";
        }
    }
}

const TaggedPoint = Tagged(Point);

let point = new TaggedPoint(10, 20);
point._tag = "hello";

class Customer extends Tagged(Person) {
    accountBalance: number;
}

let customer = new Customer("Joe");
customer._tag = "test";
customer.accountBalance = 0;
```

Mixin classes can constrain the types of classes they can mix into by specifying a construct signature return type in the constraint for the type parameter. For example, the following `WithLocation` function implements a subclass factory that adds a `getLocation` method to any class that satisfies the `Point` interface (i.e. that has `x` and `y` properties of type `number`).

```ts
interface Point {
    x: number;
    y: number;
}

const WithLocation = <T extends Constructor<Point>>(Base: T) =>
    class extends Base {
        getLocation(): [number, number] {
            return [this.x, this.y];
        }
    }
```

## `object` type

TypeScript did not have a type that represents the non-primitive type, i.e. any thing that is not `number` | `string` | `boolean` | `symbol` | `null` | `undefined`. Enter the new `object` type.

With `object` type, APIs like `Object.create` can be better represented. For example:
```ts
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

## Support for `new.target`

The `new.target` meta-property is new syntax introduced in ES2015. When an instance of a constructor is created via `new`, the value of `new.target` is set to be a reference to the constructor function initially used to allocate the instance. If a function is called rather than constructed via `new`, `new.target` is set to `undefined`.

`new.target` comes in handy when `Object.setPrototypeOf` or `__proto__` needs to be set in a class constructor. One such use case is inheriting from `Error` in NodeJS v4 and higher.

#### Example

```ts
class CustomError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
```
This results in the generated JS

```js
var CustomError = (function (_super) {
  __extends(CustomError, _super);
  function CustomError() {
    var _newTarget = this.constructor;
    var _this = _super.apply(this, arguments);  // 'Error' breaks prototype chain here
    _this.__proto__ = _newTarget.prototype; // restore prototype chain
    return _this;
  }
  return CustomError;
})(Error);
```

`new.target` also comes in handy for writing constructable functions, for example:

```ts
function f() {
  if (new.target) { /* called via 'new' */ }
}
```

Which translates to:

```js
function f() {
  var _newTarget = this && this instanceof f ? this.constructor : void 0;
  if (_newTarget) { /* called via 'new' */ }
}
```

## Better checking for `null`/`undefined` in operands of expressions

TypeScript 2.2 improves checking of nullable operands in expressions. Specifically, these are now flagged as errors:

* If either operand of a `+` operator is nullable, and neither operand is of type `any` or `string`.
* If either operand of a `-`, `*`, `**`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `|`, or `^` operator is nullable.
* If either operand of a `<`, `>`, `<=`, `>=`, or `in` operator is nullable.
* If the right operand of an `instanceof` operator is nullable.
* If the operand of a `+`, `-`, `~`, `++`, or `--` unary operator is nullable.

An operand is considered nullable if the type of the operand is `null` or `undefined` or a union type that includes `null` or `undefined`. Note that the union type case only only occurs in `--strictNullChecks` mode because `null` and `undefined` disappear from unions in classic type checking mode.


## Dotted property for types with string index signatures

Types with a string index signature can be indexed using the `[]` notation, but were not allowed to use the `.`. Starting with TypeScript 2.2 using either should be allowed.

```ts
interface StringMap<T> {
    [x: string]: T;
}

const map: StringMap<number>;

map["prop1"] = 1;
map.prop2 = 2;

```

This only apply to types with an *explicit* string index signature. It is still an error to access unknown properties on a type using `.` notation.

## Support for spread operator on JSX element children

TypeScript 2.2 adds support for using spread on a JSX element children. Please see [facebook/jsx#57](https://github.com/facebook/jsx/issues/57) for more details.

#### Example

```ts
function Todo(prop: { key: number, todo: string }) {
    return <div>{prop.key.toString() + prop.todo}</div>;
}

function TodoList({ todos }: TodoListProps) {
    return <div>
        {...todos.map(todo => <Todo key={todo.id} todo={todo.todo} />)}
    </div>;
}

let x: TodoListProps;

<TodoList {...x} />
```

## New `jsx: react-native`

React-native build pipeline expects all files to have a `.js` extensions even if the file contains JSX syntax. The new `--jsx` value `react-native` will persevere the JSX syntax in the output file, but give it a `.js` extension.

## TypeScript 2.1

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
Let's say we have a `Person:

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

TypeScript 2.1 brings support for [ES2017 Spread and Rest](https://github.com/sebmarkbage/ecmascript-rest-spread).

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
obj1; // {x: number, y: number};
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
// Succeeds if `node_modules/asdf/index.js` exists, or if `node_modules/asdf/package.json` defines a valid "main" entry point
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

## TypeScript 2.0

## Null- and undefined-aware types

TypeScript has two special types, Null and Undefined, that have the values `null` and `undefined` respectively.
Previously it was not possible to explicitly name these types, but `null` and `undefined` may now be used as type names regardless of type checking mode.

The type checker previously considered `null` and `undefined` assignable to anything.
Effectively, `null` and `undefined` were valid values of *every* type and it wasn't possible to specifically exclude them (and therefore not possible to detect erroneous use of them).

### `--strictNullChecks`

`--strictNullChecks` switches to a new strict null checking mode.

In strict null checking mode, the `null` and `undefined` values are *not* in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
So, whereas `T` and `T | undefined` are considered synonymous in regular type checking mode (because `undefined` is considered a subtype of any `T`), they are different types in strict type checking mode, and only `T | undefined` permits `undefined` values. The same is true for the relationship of `T` to `T | null`.

#### Example

```ts
// Compiled with --strictNullChecks
let x: number;
let y: number | undefined;
let z: number | null | undefined;
x = 1;  // Ok
y = 1;  // Ok
z = 1;  // Ok
x = undefined;  // Error
y = undefined;  // Ok
z = undefined;  // Ok
x = null;  // Error
y = null;  // Error
z = null;  // Ok
x = y;  // Error
x = z;  // Error
y = x;  // Ok
y = z;  // Error
z = x;  // Ok
z = y;  // Ok
```

### Assigned-before-use checking

In strict null checking mode the compiler requires every reference to a local variable of a type that doesn't include `undefined` to be preceded by an assignment to that variable in every possible preceding code path.

#### Example

```ts
// Compiled with --strictNullChecks
let x: number;
let y: number | null;
let z: number | undefined;
x;  // Error, reference not preceded by assignment
y;  // Error, reference not preceded by assignment
z;  // Ok
x = 1;
y = null;
x;  // Ok
y;  // Ok
```

The compiler checks that variables are definitely assigned by performing *control flow based type analysis*. See later for further details on this topic.

### Optional parameters and properties

Optional parameters and properties automatically have `undefined` added to their types, even when their type annotations don't specifically include `undefined`.
For example, the following two types are identical:

```ts
// Compiled with --strictNullChecks
type T1 = (x?: number) => string;              // x has type number | undefined
type T2 = (x?: number | undefined) => string;  // x has type number | undefined
```

### Non-null and non-undefined type guards

A property access or a function call produces a compile-time error if the object or function is of a type that includes `null` or `undefined`.
However, type guards are extended to support non-null and non-undefined checks.

#### Example

```ts
// Compiled with --strictNullChecks
declare function f(x: number): string;
let x: number | null | undefined;
if (x) {
    f(x);  // Ok, type of x is number here
}
else {
    f(x);  // Error, type of x is number? here
}
let a = x != null ? f(x) : "";  // Type of a is string
let b = x && f(x);  // Type of b is string | 0 | null | undefined
```

Non-null and non-undefined type guards may use the `==`, `!=`, `===`, or `!==` operator to compare to `null` or `undefined`, as in `x != null` or `x === undefined`.
The effects on subject variable types accurately reflect JavaScript semantics (e.g. double-equals operators check for both values no matter which one is specified whereas triple-equals only checks for the specified value).

### Dotted names in type guards

Type guards previously only supported checking local variables and parameters.
Type guards now support checking "dotted names" consisting of a variable or parameter name followed one or more property accesses.

#### Example

```ts
interface Options {
    location?: {
        x?: number;
        y?: number;
    };
}

function foo(options?: Options) {
    if (options && options.location && options.location.x) {
        const x = options.location.x;  // Type of x is number
    }
}
```

Type guards for dotted names also work with user defined type guard functions and the `typeof` and `instanceof` operators and do not depend on the `--strictNullChecks` compiler option.

A type guard for a dotted name has no effect following an assignment to any part of the dotted name.
For example, a type guard for `x.y.z` will have no effect following an assignment to `x`, `x.y`, or `x.y.z`.

### Expression operators

Expression operators permit operand types to include `null` and/or `undefined` but always produce values of non-null and non-undefined types.

```ts
// Compiled with --strictNullChecks
function sum(a: number | null, b: number | null) {
    return a + b;  // Produces value of type number
}
```

The `&&` operator adds `null` and/or `undefined` to the type of the right operand depending on which are present in the type of the left operand, and the `||` operator removes both `null` and `undefined` from the type of the left operand in the resulting union type.

```ts
// Compiled with --strictNullChecks
interface Entity {
    name: string;
}
let x: Entity | null;
let s = x && x.name;  // s is of type string | null
let y = x || { name: "test" };  // y is of type Entity
```

### Type widening

The `null` and `undefined` types are *not* widened to `any` in strict null checking mode.

```ts
let z = null;  // Type of z is null
```

In regular type checking mode the inferred type of `z` is `any` because of widening, but in strict null checking mode the inferred type of `z` is `null` (and therefore, absent a type annotation, `null` is the only possible value for `z`).

### Non-null assertion operator

A new `!` post-fix expression operator may be used to assert that its operand is non-null and non-undefined in contexts where the type checker is unable to conclude that fact.
Specifically, the operation `x!` produces a value of the type of `x` with `null` and `undefined` excluded.
Similar to type assertions of the forms `<T>x` and `x as T`, the `!` non-null assertion operator is simply removed in the emitted JavaScript code.

```ts
// Compiled with --strictNullChecks
function validateEntity(e?: Entity) {
    // Throw exception if e is null or invalid entity
}

function processEntity(e?: Entity) {
    validateEntity(e);
    let s = e!.name;  // Assert that e is non-null and access name
}
```

### Compatibility

The new features are designed such that they can be used in both strict null checking mode and regular type checking mode.
In particular, the `null` and `undefined` types are automatically erased from union types in regular type checking mode (because they are subtypes of all other types), and the `!` non-null assertion expression operator is permitted but has no effect in regular type checking mode. Thus, declaration files that are updated to use null- and undefined-aware types can still be used in regular type checking mode for backwards compatibility.

In practical terms, strict null checking mode requires that all files in a compilation are null- and undefined-aware.

## Control flow based type analysis

TypeScript 2.0 implements a control flow-based type analysis for local variables and parameters.
Previously, the type analysis performed for type guards was limited to `if` statements and `?:` conditional expressions and didn't include effects of assignments and control flow constructs such as `return` and `break` statements.
With TypeScript 2.0, the type checker analyses all possible flows of control in statements and expressions to produce the most specific type possible (the *narrowed type*) at any given location for a local variable or parameter that is declared to have a union type.

#### Example

```ts
function foo(x: string | number | boolean) {
    if (typeof x === "string") {
        x; // type of x is string here
        x = 1;
        x; // type of x is number here
    }
    x; // type of x is number | boolean here
}

function bar(x: string | number) {
    if (typeof x === "number") {
        return;
    }
    x; // type of x is string here
}
```

Control flow based type analysis is particuarly relevant in `--strictNullChecks` mode because nullable types are represented using union types:

```ts
function test(x: string | null) {
    if (x === null) {
        return;
    }
    x; // type of x is string in remainder of function
}
```

Furthermore, in `--strictNullChecks` mode, control flow based type analysis includes *definite assignment analysis* for local variables of types that don't permit the value `undefined`.

```ts
function mumble(check: boolean) {
    let x: number; // Type doesn't permit undefined
    x; // Error, x is undefined
    if (check) {
        x = 1;
        x; // Ok
    }
    x; // Error, x is possibly undefined
    x = 2;
    x; // Ok
}
```

## Tagged union types

TypeScript 2.0 implements support for tagged (or discriminated) union types.
Specifically, the TS compiler now support type guards that narrow union types based on tests of a discriminant property and furthermore extend that capability to `switch` statements.

#### Example

```ts
interface Square {
    kind: "square";
    size: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(s: Shape) {
    // In the following switch statement, the type of s is narrowed in each case clause
    // according to the value of the discriminant property, thus allowing the other properties
    // of that variant to be accessed without a type assertion.
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.width * s.height;
        case "circle": return Math.PI * s.radius * s.radius;
    }
}

function test1(s: Shape) {
    if (s.kind === "square") {
        s;  // Square
    }
    else {
        s;  // Rectangle | Circle
    }
}

function test2(s: Shape) {
    if (s.kind === "square" || s.kind === "rectangle") {
        return;
    }
    s;  // Circle
}
```

A *discriminant property type guard* is an expression of the form `x.p == v`, `x.p === v`, `x.p != v`, or `x.p !== v`, where `p` and `v` are a property and an expression of a string literal type or a union of string literal types.
The discriminant property type guard narrows the type of `x` to those constituent types of `x` that have a discriminant property `p` with one of the possible values of `v`.

Note that we currently only support discriminant properties of string literal types.
We intend to later add support for boolean and numeric literal types.

## The `never` type

TypeScript 2.0 introduces a new primitive type `never`.
The `never` type represents the type of values that never occur.
Specifically, `never` is the return type for functions that never return and `never` is the type of variables under type guards that are never true.

The `never` type has the following characteristics:

* `never` is a subtype of and assignable to every type.
* No type is a subtype of or assignable to `never` (except `never` itself).
* In a function expression or arrow function with no return type annotation, if the function has no `return` statements, or only `return` statements with expressions of type `never`, and if the end point of the function is not reachable (as determined by control flow analysis), the inferred return type for the function is `never`.
* In a function with an explicit `never` return type annotation, all `return` statements (if any) must have expressions of type `never` and the end point of the function must not be reachable.

Because `never` is a subtype of every type, it is always omitted from union types and it is ignored in function return type inference as long as there are other types being returned.

Some examples of functions returning `never`:

```ts
// Function returning never must have unreachable end point
function error(message: string): never {
    throw new Error(message);
}

// Inferred return type is never
function fail() {
    return error("Something failed");
}

// Function returning never must have unreachable end point
function infiniteLoop(): never {
    while (true) {
    }
}
```

Some examples of use of functions returning `never`:

```ts
// Inferred return type is number
function move1(direction: "up" | "down") {
    switch (direction) {
        case "up":
            return 1;
        case "down":
            return -1;
    }
    return error("Should never get here");
}

// Inferred return type is number
function move2(direction: "up" | "down") {
    return direction === "up" ? 1 :
        direction === "down" ? -1 :
        error("Should never get here");
}

// Inferred return type is T
function check<T>(x: T | undefined) {
    return x || error("Undefined value");
}
```

Because `never` is assignable to every type, a function returning `never` can be used when a callback returning a more specific type is required:

```ts
function test(cb: () => string) {
    let s = cb();
    return s;
}

test(() => "hello");
test(() => fail());
test(() => { throw new Error(); })
```

## Read-only properties and index signatures

A property or index signature can now be declared with the `readonly` modifier is considered read-only.

Read-only properties may have initializers and may be assigned to in constructors within the same class declaration, but otherwise assignments to read-only properties are disallowed.

In addition, entities are *implicitly* read-only in several situations:

* A property declared with a `get` accessor and no `set` accessor is considered read-only.
* In the type of an enum object, enum members are considered read-only properties.
* In the type of a module object, exported `const` variables are considered read-only properties.
* An entity declared in an `import` statement is considered read-only.
* An entity accessed through an ES2015 namespace import is considered read-only (e.g. `foo.x` is read-only when `foo` is declared as `import * as foo from "foo"`).

#### Example

```ts
interface Point {
    readonly x: number;
    readonly y: number;
}

var p1: Point = { x: 10, y: 20 };
p1.x = 5;  // Error, p1.x is read-only

var p2 = { x: 1, y: 1 };
var p3: Point = p2;  // Ok, read-only alias for p2
p3.x = 5;  // Error, p3.x is read-only
p2.x = 5;  // Ok, but also changes p3.x because of aliasing
```

```ts
class Foo {
    readonly a = 1;
    readonly b: string;
    constructor() {
        this.b = "hello";  // Assignment permitted in constructor
    }
}
```

```ts
let a: Array<number> = [0, 1, 2, 3, 4];
let b: ReadonlyArray<number> = a;
b[5] = 5;      // Error, elements are read-only
b.push(5);     // Error, no push method (because it mutates array)
b.length = 3;  // Error, length is read-only
a = b;         // Error, mutating methods are missing
```

## Specifying the type of `this` for functions

Following up on specifying the type of `this` in a class or an interface, functions and methods can now declare the type of `this` they expect.

By default the type of `this` inside a function is `any`.
Starting with TypeScript 2.0, you can provide an explicit `this` parameter.
`this` parameters are fake parameters that come first in the parameter list of a function:

```ts
function f(this: void) {
    // make sure `this` is unusable in this standalone function
}
```

### `this` parameters in callbacks

Libraries can also use `this` parameters to declare how callbacks will be invoked.

#### Example

```ts
interface UIElement {
    addClickListener(onclick: (this: void, e: Event) => void): void;
}
```

`this: void` means that `addClickListener` expects `onclick` to be a function that does not require a `this` type.

Now if you annotate calling code with `this`:

```ts
class Handler {
    info: string;
    onClickBad(this: Handler, e: Event) {
        // oops, used this here. using this callback would crash at runtime
        this.info = e.message;
    };
}
let h = new Handler();
uiElement.addClickListener(h.onClickBad); // error!
```

### `--noImplicitThis`

A new flag is also added in TypeScript 2.0 to flag all uses of `this` in functions without an explicit type annotation.

## Glob support in `tsconfig.json`

Glob support is here!! Glob support has been [one of the most requested features](https://github.com/Microsoft/TypeScript/issues/1927).

Glob-like file patterns are supported two properties `"include"` and `"exclude"`.

#### Example

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "outFile": "../../built/local/tsc.js",
        "sourceMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "**/*.spec.ts"
    ]
}
```

The supported glob wildcards are:

* `*` matches zero or more characters (excluding directory separators)
* `?` matches any one character (excluding directory separators)
* `**/` recursively matches any subdirectory

If a segment of a glob pattern includes only `*` or `.*`, then only files with supported extensions are included (e.g. `.ts`, `.tsx`, and `.d.ts` by default with `.js` and `.jsx` if `allowJs` is set to true).

If the `"files"` and `"include"` are both left unspecified, the compiler defaults to including all TypeScript (`.ts`, `.d.ts` and `.tsx`) files in the containing directory and subdirectories except those excluded using the `"exclude"` property. JS files (`.js` and `.jsx`) are also included if `allowJs` is set to true.

If the `"files"` or `"include"` properties are specified, the compiler will instead include the union of the files included by those two properties.
Files in the directory specified using the `"outDir"` compiler option are always excluded unless explicitly included via the `"files"` property (even when the "`exclude`" property is specified).

Files included using `"include"` can be filtered using the `"exclude"` property.
However, files included explicitly using the `"files"` property are always included regardless of `"exclude"`.
The `"exclude"` property defaults to excluding the `node_modules`, `bower_components`, and `jspm_packages` directories when not specified.

## Module resolution enhancements: BaseUrl, Path mapping, rootDirs and tracing

TypeScript 2.0 provides a set of additional module resolution knops to *inform* the compiler where to find declarations for a given module.

See [Module Resolution](http://www.typescriptlang.org/docs/handbook/module-resolution.html) documentation for more details.

### Base URL

Using a `baseUrl` is a common practice in applications using AMD module loaders where modules are "deployed" to a single folder at run-time.
All module imports with non-relative names are assumed to be relative to the `baseUrl`.

#### Example

```json
{
  "compilerOptions": {
    "baseUrl": "./modules"
  }
}
```

Now imports to `"moduleA"` would be looked up in `./modules/moduleA`

```ts
import A from "moduleA";
```

### Path mapping

Sometimes modules are not directly located under *baseUrl*.
Loaders use a mapping configuration to map module names to files at run-time, see [RequireJs documentation](http://requirejs.org/docs/api.html#config-paths) and [SystemJS documentation](https://github.com/systemjs/systemjs/blob/master/docs/overview.md#map-config).

The TypeScript compiler supports the declaration of such mappings using `"paths"` property in `tsconfig.json` files.

#### Example

For instance, an import to a module `"jquery"` would be translated at runtime to `"node_modules/jquery/dist/jquery.slim.min.js"`.

```json
{
  "compilerOptions": {
    "baseUrl": "./node_modules",
    "paths": {
      "jquery": ["jquery/dist/jquery.slim.min"]
    }
}
```

Using `"paths"` also allow for more sophisticated mappings including multiple fall back locations.
Consider a project configuration where only some modules are available in one location, and the rest are in another.

### Virtual Directories with `rootDirs`

Using 'rootDirs', you can inform the compiler of the *roots* making up this "virtual" directory;
and thus the compiler can resolve relative modules imports within these "virtual" directories *as if* were merged together in one directory.

#### Example

Given this project structure:

```tree
 src
 └── views
     └── view1.ts (imports './template1')
     └── view2.ts

 generated
 └── templates
         └── views
             └── template1.ts (imports './view2')
```

A build step will copy the files in `/src/views` and `/generated/templates/views` to the same directory in the output.
At run-time, a view can expect its template to exist next to it, and thus should import it using a relative name as `"./template"`.

`"rootDirs"` specify a list of *roots* whose contents are expected to merge at run-time.
So following our example, the `tsconfig.json` file should look like:

```json
{
  "compilerOptions": {
    "rootDirs": [
      "src/views",
      "generated/templates/views"
    ]
  }
}
```

### Tracing module resolution

`--traceResolution` offers a handy way to understand how modules have been resolved by the compiler.

```shell
tsc --traceResolution
```

## Shorthand ambient module declarations

If you don't want to take the time to write out declarations before using a new module, you can now just use a shorthand declaration to get started quickly.

#### declarations.d.ts
```ts
declare module "hot-new-module";
```

All imports from a shorthand module will have the any type.

```ts
import x, {y} from "hot-new-module";
x(y);
```

## Wildcard character in module names

Importing none-code resources using module loaders extension (e.g. [AMD](https://github.com/amdjs/amdjs-api/blob/master/LoaderPlugins.md) or [SystemJS](https://github.com/systemjs/systemjs/blob/master/docs/creating-plugins.md)) has not been easy before;
previously an ambient module declaration had to be defined for each resource.

TypeScript 2.0 supports the use of the wildcard character (`*`) to declare a "family" of module names;
this way, a declaration is only required once for an extension, and not for every resource.

#### Example

```ts
declare module "*!text" {
    const content: string;
    export default content;
}
// Some do it the other way around.
declare module "json!*" {
    const value: any;
    export default value;
}
```

Now you can import things that match `"*!text"` or `"json!*"`.

```ts
import fileContent from "./xyz.txt!text";
import data from "json!http://example.com/data.json";
console.log(data, fileContent);
```

Wildcard module names can be even more useful when migrating from an un-typed code base.
Combined with Shorthand ambient module declarations, a set of modules can be easily declared as `any`.

#### Example

```ts
declare module "myLibrary/*";
```

All imports to any module under `myLibrary` would be considered to have the type `any` by the compiler;
thus, shutting down any checking on the shapes or types of these modules.

```ts
import { readFile } from "myLibrary/fileSystem/readFile";

readFile(); // readFile is 'any'
```

## Support for UMD module definitions

Some libraries are designed to be used in many module loaders, or with no module loading (global variables).
These are known as [UMD](https://github.com/umdjs/umd) or [Isomorphic](http://isomorphic.net) modules.
These libraries can be accessed through either an import or a global variable.

For example:

##### math-lib.d.ts

```ts
export const isPrime(x: number): boolean;
export as namespace mathLib;
```

The library can then be used as an import within modules:

```ts
import { isPrime } from "math-lib";
isPrime(2);
mathLib.isPrime(2); // ERROR: can't use the global definition from inside a module
```

It can also be used as a global variable, but only inside of a script.
(A script is a file with no imports or exports.)

```ts
mathLib.isPrime(2);
```

## Optional class properties

Optional properties and methods can now be declared in classes, similar to what is already permitted in interfaces.

#### Example

```ts
class Bar {
    a: number;
    b?: number;
    f() {
        return 1;
    }
    g?(): number;  // Body of optional method can be omitted
    h?() {
        return 2;
    }
}
```

When compiled in `--strictNullChecks` mode, optional properties and methods automatically have `undefined` included in their type. Thus, the `b` property above is of type `number | undefined` and the `g` method above is of type `(() => number) | undefined`.
Type guards can be used to strip away the `undefined` part of the type:

```ts
function test(x: Bar) {
    x.a;  // number
    x.b;  // number | undefined
    x.f;  // () => number
    x.g;  // (() => number) | undefined
    let f1 = x.f();            // number
    let g1 = x.g && x.g();     // number | undefined
    let g2 = x.g ? x.g() : 0;  // number
}
```

## Private and Protected Constructors

A class constructor may be marked `private` or `protected`.
A class with private constructor cannot be instantiated outside the class body, and cannot be extended.
A class with protected constructor cannot be instantiated outside the class body, but can be extended.

#### Example

```ts
class Singleton {
    private static instance: Singleton;

    private constructor() { }

    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}

let e = new Singleton(); // Error: constructor of 'Singleton' is private.
let v = Singleton.getInstance();
```

## Abstract properties and accessors

An abstract class can declare abstract properties and/or accessors.
Any sub class will need to declare the abstract properties or be marked as abstract.
Abstract properties cannot have an initializer.
Abstract accessors cannot have bodies.

#### Example

```ts
abstract class Base {
    abstract name: string;
    abstract get value();
    abstract set value(v: number);
}

class Derived extends Base {
    name = "derived";

    value = 1;
}
```

## Implicit index signatures

An object literal type is now assignable to a type with an index signature if all known properties in the object literal are assignable to that index signature. This makes it possible to pass a variable that was initialized with an object literal as parameter to a function that expects a map or dictionary:

```ts
function httpService(path: string, headers: { [x: string]: string }) { }

const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
};

httpService("", { "Content-Type": "application/x-www-form-urlencoded" });  // Ok
httpService("", headers);  // Now ok, previously wasn't
```

## Including built-in type declarations with `--lib`

Getting to ES6/ES2015 built-in API declarations were only limited to `target: ES6`.
Enter `--lib`; with `--lib` you can specify a list of built-in API declaration groups that you can chose to include in your project.
For instance, if you expect your runtime to have support for `Map`, `Set` and `Promise` (e.g. most evergreen browsers today), just include `--lib es2015.collection,es2015.promise`.
Similarly you can exclude declarations you do not want to include in your project, e.g. DOM if you are working on a node project using `--lib es5,es6`.

Here is a list of available API groups:

* dom
* webworker
* es5
* es6 / es2015
* es2015.core
* es2015.collection
* es2015.iterable
* es2015.promise
* es2015.proxy
* es2015.reflect
* es2015.generator
* es2015.symbol
* es2015.symbol.wellknown
* es2016
* es2016.array.include
* es2017
* es2017.object
* es2017.sharedmemory
* scripthost


#### Example

```bash
tsc --target es5 --lib es5,es2015.promise
```

```json
"compilerOptions": {
    "lib": ["es5", "es2015.promise"]
}
```

## Flag unused declarations with `--noUnusedParameters` and `--noUnusedLocals`

TypeScript 2.0 has two new flags to help you maintain a clean code base.
`--noUnusedParameters` flags any unused function or method parameters errors.
`--noUnusedLocals` flags any unused local (un-exported) declaration like variables, functions, classes, imports, etc...
Also, unused private members of a class would be flagged as errors under `--noUnusedLocals`.


#### Example
```ts
import B, { readFile } from "./b";
//     ^ Error: `B` declared but never used
readFile();


export function write(message: string, args: string[]) {
    //                                 ^^^^  Error: 'arg' declared but never used.
    console.log(message);
}
```

Parameters declaration with names starting with `_` are exempt from the unused parameter checking.
e.g.:

```ts
function returnNull(_a) { // OK
    return null;
}
```

## Module identifiers allow for `.js` extension

Before TypeScript 2.0, a module identifier was always assumed to be extension-less;
for instance, given an import as `import d from "./moduleA.js"`, the compiler looked up the definition of `"moduleA.js"` in `./moduleA.js.ts` or `./moduleA.js.d.ts`.
This made it hard to use bundling/loading tools like [SystemJS](https://github.com/systemjs/systemjs) that expect URI's in their module identifier.

With TypeScript 2.0, the compiler will look up definition of `"moduleA.js"` in  `./moduleA.ts` or `./moduleA.d.ts`.

## Support 'target : es5' with 'module: es6'

Previously flagged as an invalid flag combination, `target: es5` and 'module: es6' is now supported.
This should facilitate using ES2015-based tree shakers like [rollup](https://github.com/rollup/rollup).

## Trailing commas in function parameter and argument lists

Trailing comma in function parameter and argument lists are now allowed.
This is an implementation for a [Stage-3 ECMAScript proposal](https://jeffmo.github.io/es-trailing-function-commas/) that emits down to valid ES3/ES5/ES6.

#### Example
```ts
function foo(
  bar: Bar,
  baz: Baz, // trailing commas are OK in parameter lists
) {
  // Implementation...
}

foo(
  bar,
  baz, // and in argument lists
);
```

## New `--skipLibCheck`

TypeScript 2.0 adds a new `--skipLibCheck` compiler option that causes type checking of declaration files (files with extension `.d.ts`) to be skipped.
When a program includes large declaration files, the compiler spends a lot of time type checking declarations that are already known to not contain errors, and compile times may be significantly shortened by skipping declaration file type checks.

Since declarations in one file can affect type checking in other files, some errors may not be detected when `--skipLibCheck` is specified.
For example, if a non-declaration file augments a type declared in a declaration file, errors may result that are only reported when the declaration file is checked.
However, in practice such situations are rare.

## Allow duplicate identifiers across declarations

This has been one common source of duplicate definition errors.
Multiple declaration files defining the same members on interfaces.

TypeScript 2.0 relaxes this constraint and allows duplicate identifiers across blocks, as long as they have *identical* types.

Within the same block duplicate definitions are still disallowed.

#### Example

```ts
interface Error {
    stack?: string;
}


interface Error {
    code?: string;
    path?: string;
    stack?: string;  // OK
}

```

## New `--declarationDir`

`--declarationDir` allows for generating declaration files in a different location than JavaScript files.


## TypeScript 1.8

## Type parameters as constraints

With TypeScript 1.8 it becomes possible for a type parameter constraint to reference type parameters from the same type parameter list. Previously this was an error. This capability is usually referred to as [F-Bounded Polymorphism](https://en.wikipedia.org/wiki/Bounded_quantification#F-bounded_quantification).

##### Example

```ts
function assign<T extends U, U>(target: T, source: U): T {
    for (let id in source) {
        target[id] = source[id];
    }
    return target;
}

let x = { a: 1, b: 2, c: 3, d: 4 };
assign(x, { b: 10, d: 20 });
assign(x, { e: 0 });  // Error
```

## Control flow analysis errors

TypeScript 1.8 introduces control flow analysis to help catch common errors that users tend to run into.
Read on to get more details, and check out these errors in action:

![cfa](https://cloud.githubusercontent.com/assets/8052307/5210657/c5ae0f28-7585-11e4-97d8-86169ef2a160.gif)

### Unreachable code

Statements guaranteed to not be executed at run time are now correctly flagged as unreachable code errors. For instance, statements following unconditional `return`, `throw`, `break` or `continue` statements are considered unreachable. Use `--allowUnreachableCode` to disable unreachable code detection and reporting.

##### Example

Here's a simple example of an unreachable code error:

```ts
function f(x) {
    if (x) {
       return true;
    }
    else {
       return false;
    }

    x = 0; // Error: Unreachable code detected.
}
```

A more common error that this feature catches is adding a newline after a `return` statement:

```ts
function f() {
    return            // Automatic Semicolon Insertion triggered at newline
    {
        x: "string"   // Error: Unreachable code detected.
    }
}
```

Since JavaScript automatically terminates the `return` statement at the end of the line, the object literal becomes a block.


### Unused labels

Unused labels are also flagged. Just like unreachable code checks, these are turned on by default; use `--allowUnusedLabels` to stop reporting these errors.

##### Example

```ts
loop: while (x > 0) {  // Error: Unused label.
    x++;
}
```

### Implicit returns

Functions with code paths that do not return a value in JS implicitly return `undefined`. These can now be flagged by the compiler as implicit returns. The check is turned *off* by default; use `--noImplicitReturns` to turn it on.

##### Example

```ts
function f(x) { // Error: Not all code paths return a value.
    if (x) {
        return false;
    }

    // implicitly returns `undefined`
}
```

### Case clause fall-throughs

TypeScript can reports errors for fall-through cases in switch statement where the case clause is non-empty.
This check is turned *off* by default, and can be enabled using `--noFallthroughCasesInSwitch`.

##### Example

With `--noFallthroughCasesInSwitch`, this example will trigger an error:

```ts
switch (x % 2) {
    case 0: // Error: Fallthrough case in switch.
        console.log("even");

    case 1:
        console.log("odd");
        break;
}
```

However, in the following example, no error will be reported because the fall-through case is empty:

```ts
switch (x % 3) {
    case 0:
    case 1:
        console.log("Acceptable");
        break;

    case 2:
        console.log("This is *two much*!");
        break;
}
```


## Stateless Function Components in React

TypeScript now supports [Stateless Function components](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions).
These are lightweight components that easily compose other components:

```ts
// Use parameter destructuring and defaults for easy definition of 'props' type
const Greeter = ({name = 'world'}) => <div>Hello, {name}!</div>;

// Properties get validated
let example = <Greeter name='TypeScript 1.8' />;
```

For this feature and simplified props, be sure to be use the [latest version of react.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/react).

## Simplified `props` type management in React

In TypeScript 1.8 with the latest version of react.d.ts (see above), we've also greatly simplified the declaration of `props` types.

Specifically:
 * You no longer need to either explicitly declare `ref` and `key` or `extend React.Props`
 * The `ref` and `key` properties will appear with correct types on all components
 * The `ref` property is correctly disallowed on instances of Stateless Function components

## Augmenting global/module scope from modules

Users can now declare any augmentations that they want to make, or that any other consumers already have made, to an existing module.
Module augmentations look like plain old ambient module declarations (i.e. the `declare module "foo" { }` syntax), and are directly nested either your own modules, or in another top level ambient external module.

Furthermore, TypeScript also has the notion of *global* augmentations of the form `declare global { }`.
This allows modules to augment global types such as `Array` if necessary.

The name of a module augmentation is resolved using the same set of rules as module specifiers in `import` and `export` declarations.
The declarations in a module augmentation are merged with any existing declarations the same way they would if they were declared in the same file.

Neither module augmentations nor global augmentations can add new items to the top level scope - they can only "patch" existing declarations.

##### Example

Here `map.ts` can declare that it will internally patch the `Observable` type from `observable.ts` and add the `map` method to it.

```ts
// observable.ts
export class Observable<T> {
    // ...
}
```

```ts
// map.ts
import { Observable } from "./observable";

// Create an augmentation for "./observable"
declare module "./observable" {

    // Augment the 'Observable' class definition with interface merging
    interface Observable<T> {
        map<U>(proj: (el: T) => U): Observable<U>;
    }

}

Observable.prototype.map = /*...*/;
```

```ts
// consumer.ts
import { Observable } from "./observable";
import "./map";

let o: Observable<number>;
o.map(x => x.toFixed());
```

Similarly, the global scope can be augmented from modules using a `declare global` declarations:

##### Example

```ts
// Ensure this is treated as a module.
export {};

declare global {
    interface Array<T> {
        mapToNumbers(): number[];
    }
}

Array.prototype.mapToNumbers = function () { /* ... */ }
```

## String literal types

It's not uncommon for an API to expect a specific set of strings for certain values.
For instance, consider a UI library that can move elements across the screen while controlling the ["easing" of the animation.](https://en.wikipedia.org/wiki/Inbetweening)

```ts
declare class UIElement {
    animate(options: AnimationOptions): void;
}

interface AnimationOptions {
    deltaX: number;
    deltaY: number;
    easing: string; // Can be "ease-in", "ease-out", "ease-in-out"
}
```

However, this is error prone - there is nothing stopping a user from accidentally misspelling one of the valid easing values:

```ts
// No errors
new UIElement().animate({ deltaX: 100, deltaY: 100, easing: "ease-inout" });
```

With TypeScript 1.8, we've introduced string literal types.
These types are written the same way string literals are, but in type positions.

Users can now ensure that the type system will catch such errors.
Here's our new `AnimationOptions` using string literal types:

```ts
interface AnimationOptions {
    deltaX: number;
    deltaY: number;
    easing: "ease-in" | "ease-out" | "ease-in-out";
}

// Error: Type '"ease-inout"' is not assignable to type '"ease-in" | "ease-out" | "ease-in-out"'
new UIElement().animate({ deltaX: 100, deltaY: 100, easing: "ease-inout" });
```

## Improved union/intersection type inference

TypeScript 1.8 improves type inference involving source and target sides that are both union or intersection types.
For example, when inferring from `string | string[]` to `string | T`, we reduce the types to `string[]` and `T`, thus inferring `string[]` for `T`.

##### Example

```ts
type Maybe<T> = T | void;

function isDefined<T>(x: Maybe<T>): x is T {
    return x !== undefined && x !== null;
}

function isUndefined<T>(x: Maybe<T>): x is void {
    return x === undefined || x === null;
}

function getOrElse<T>(x: Maybe<T>, defaultValue: T): T {
    return isDefined(x) ? x : defaultValue;
}

function test1(x: Maybe<string>) {
    let x1 = getOrElse(x, "Undefined");         // string
    let x2 = isDefined(x) ? x : "Undefined";    // string
    let x3 = isUndefined(x) ? "Undefined" : x;  // string
}

function test2(x: Maybe<number>) {
    let x1 = getOrElse(x, -1);         // number
    let x2 = isDefined(x) ? x : -1;    // number
    let x3 = isUndefined(x) ? -1 : x;  // number
}
```

## Concatenate `AMD` and `System` modules with `--outFile`

Specifying `--outFile` in conjunction with `--module amd` or `--module system` will concatenate all modules in the compilation into a single output file containing multiple module closures.

A module name will be computed for each module based on its relative location to `rootDir`.

##### Example
```ts
// file src/a.ts
import * as B from "./lib/b";
export function createA() {
    return B.createB();
}
```

```ts
// file src/lib/b.ts
export function createB() {
    return { };
}
```

Results in:

```js
define("lib/b", ["require", "exports"], function (require, exports) {
    "use strict";
    function createB() {
        return {};
    }
    exports.createB = createB;
});
define("a", ["require", "exports", "lib/b"], function (require, exports, B) {
    "use strict";
    function createA() {
        return B.createB();
    }
    exports.createA = createA;
});
```

## Support for `default` import interop with SystemJS

Module loaders like SystemJS wrap CommonJS modules and expose then as a `default` ES6 import. This makes it impossible to share the definition files between the SystemJS and CommonJS implementation of the module as the module shape looks different based on the loader.

Setting the new compiler flag `--allowSyntheticDefaultImports` indicates that the module loader performs some kind of synthetic default import member creation not indicated in the imported .ts or .d.ts. The compiler will infer the existence of a `default` export that has the shape of the entire module itself.

System modules have this flag on by default.

## Allow captured `let`/`const` in loops

Previously an error, now supported in TypeScript 1.8.
`let`/`const` declarations within loops and captured in functions are now emitted to correctly match `let`/`const` freshness semantics.

##### Example

```ts
let list = [];
for (let i = 0; i < 5; i++) {
    list.push(() => i);
}

list.forEach(f => console.log(f()));
```

is compiled to:

```js
var list = [];
var _loop_1 = function(i) {
    list.push(function () { return i; });
};
for (var i = 0; i < 5; i++) {
    _loop_1(i);
}
list.forEach(function (f) { return console.log(f()); });
```

And results in

```cmd
0
1
2
3
4
```

## Improved checking for `for..in` statements

Previously the type of a `for..in` variable is inferred to `any`; that allowed the compiler to ignore invalid uses within the `for..in` body.

Starting with TypeScript 1.8,:
* The type of a variable declared in a `for..in` statement is implicitly `string`.
* When an object with a numeric index signature of type `T` (such as an array) is indexed by a `for..in` variable of a containing `for..in` statement for an object *with* a numeric index signature and *without* a string index signature (again such as an array), the value produced is of type `T`.

##### Example

```ts
var a: MyObject[];
for (var x in a) {   // Type of x is implicitly string
    var obj = a[x];  // Type of obj is MyObject
}
```

## Modules are now emitted with a `"use strict";` prologue

Modules were always parsed in strict mode as per ES6, but for non-ES6 targets this was not respected in the generated code. Starting with TypeScript 1.8, emitted modules are always in strict mode. This shouldn't have any visible changes in most code as TS considers most strict mode errors as errors at compile time, but it means that some things which used to silently fail at runtime in your TS code, like assigning to `NaN`, will now loudly fail. You can reference the [MDN Article](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) on strict mode for a detailed list of the differences between strict mode and non-strict mode.

## Including `.js` files with `--allowJs`

Often there are external source files in your project that may not be authored in TypeScript.
Alternatively, you might be in the middle of converting a JS code base into TS, but still want to bundle all your JS code into a single file with the output of your new TS code.

`.js` files are now allowed as input to `tsc`.
The TypeScript compiler checks the input `.js` files for syntax errors, and emits valid output based on the `--target` and `--module` flags.
The output can be combined with other `.ts` files as well.
Source maps are still generated for `.js` files just like with `.ts` files.

## Custom JSX factories using `--reactNamespace`

Passing `--reactNamespace <JSX factory Name>` along with `--jsx react` allows for using a different JSX factory from the default `React`.

The new factory name will be used to call `createElement` and `__spread` functions.

##### Example

```ts
import {jsxFactory} from "jsxFactory";

var div = <div>Hello JSX!</div>
```

Compiled with:

```shell
tsc --jsx react --reactNamespace jsxFactory --m commonJS
```

Results in:

```js
"use strict";
var jsxFactory_1 = require("jsxFactory");
var div = jsxFactory_1.jsxFactory.createElement("div", null, "Hello JSX!");
```

## `this`-based type guards

TypeScript 1.8 extends [user-defined type guard functions](#user-defined-type-guard-functions) to class and interface methods.

`this is T` is now valid return type annotation for methods in classes and interfaces.
When used in a type narrowing position (e.g. `if` statement), the type of the call expression target object would be narrowed to `T`.

##### Example

```ts

class FileSystemObject {
    isFile(): this is File { return this instanceof File; }
    isDirectory(): this is Directory { return this instanceof Directory;}
    isNetworked(): this is (Networked & this) { return this.networked; }
    constructor(public path: string, private networked: boolean) {}
}

class File extends FileSystemObject {
    constructor(path: string, public content: string) { super(path, false); }
}
class Directory extends FileSystemObject {
    children: FileSystemObject[];
}
interface Networked {
    host: string;
}

let fso: FileSystemObject = new File("foo/bar.txt", "foo");
if (fso.isFile()) {
    fso.content; // fso is File
}
else if (fso.isDirectory()) {
    fso.children; // fso is Directory
}
else if (fso.isNetworked()) {
    fso.host; // fso is networked
}
```

## Official TypeScript NuGet package

Starting with TypeScript 1.8, official NuGet packages are available for the Typescript Compiler (`tsc.exe`) as well as the MSBuild integration (`Microsoft.TypeScript.targets` and `Microsoft.TypeScript.Tasks.dll`).

Stable packages are available here:
* [Microsoft.TypeScript.Compiler](https://www.nuget.org/packages/Microsoft.TypeScript.Compiler/)
* [Microsoft.TypeScript.MSBuild](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild/)

Also, a nightly NuGet package to match the [nightly npm package](http://blogs.msdn.com/b/typescript/archive/2015/07/27/introducing-typescript-nightlies.aspx) is available on https://myget.org:

* [TypeScript-Preview](https://www.myget.org/gallery/typescript-preview)

## Prettier error messages from `tsc`

We understand that a ton of monochrome output can be a little difficult on the eyes.
Colors can help discern where a message starts and ends, and these visual clues are important when error output gets overwhelming.

By just passing the `--pretty` command line option, TypeScript gives more colorful output with context about where things are going wrong.

![Showing off pretty error messages in ConEmu](https://raw.githubusercontent.com/wiki/Microsoft/TypeScript/images/new-in-typescript/pretty01.png)

## Colorization of JSX code in VS 2015

With TypeScript 1.8, JSX tags are now classified and colorized in Visual Studio 2015.

![jsx](https://cloud.githubusercontent.com/assets/8052307/12271404/b875c502-b90f-11e5-93d8-c6740be354d1.png)

The classification can be further customized by changing the font and color settings for the `VB XML` color and font settings through `Tools`->`Options`->`Environment`->`Fonts and Colors` page.

## The `--project` (`-p`) flag can now take any file path

The `--project` command line option originally could only take paths to a folder containing a `tsconfig.json`.
Given the different scenarios for build configurations, it made sense to allow `--project` to point to any other compatible JSON file.
For instance, a user might want to target ES2015 with CommonJS modules for Node 5, but ES5 with AMD modules for the browser.
With this new work, users can easily manage two separate build targets using `tsc` alone without having to perform hacky workarounds like placing `tsconfig.json` files in separate directories.

The old behavior still remains the same if given a directory - the compiler will try to find a file in the directory named `tsconfig.json`.

## Allow comments in tsconfig.json

It's always nice to be able to document your configuration!
`tsconfig.json` now accepts single and multi-line comments.

```ts
{
    "compilerOptions": {
        "target": "ES2015", // running on node v5, yaay!
        "sourceMap": true   // makes debugging easier
    },
    /*
     * Excluded files
      */
    "exclude": [
        "file.d.ts"
    ]
}
```

## Support output to IPC-driven files

TypeScript 1.8 allows users to use the `--outFile` argument with special file system entities like named pipes, devices, etc.

As an example, on many Unix-like systems, the standard output stream is accessible by the file `/dev/stdout`.

```shell
tsc foo.ts --outFile /dev/stdout
```

This can be used to pipe output between commands as well.

As an example, we can pipe our emitted JavaScript into a pretty printer like [pretty-js](https://www.npmjs.com/package/pretty-js):

```shell
tsc foo.ts --outFile /dev/stdout | pretty-js
```

## Improved support for `tsconfig.json` in Visual Studio 2015

TypeScript 1.8 allows `tsconfig.json` files in all project types.
This includes ASP.NET v4 projects, *Console Application*, and the *Html Application with TypeScript* project types.
Further, you are no longer limited to a single `tsconfig.json` file but can add multiple, and each will be built as part of the project.
This allows you to separate the configuration for different parts of your application without having to use multiple different projects.

![Showing off tsconfig.json in Visual Studio](https://raw.githubusercontent.com/wiki/Microsoft/TypeScript/images/new-in-typescript/tsconfig-in-vs.png)

We also disable the project properties page when you add a `tsconfig.json` file.
This means that all configuration changes have to be made in the `tsconfig.json` file itself.

### A couple of limitations:

* If you add a `tsconfig.json` file, TypeScript files that are not considered part of that context are not compiled.
* Apache Cordova Apps still have the existing limitation of a single `tsconfig.json` file, which must be in either the root or the `scripts` folder.
* There is no template for `tsconfig.json` in most project types.

## TypeScript 1.7

## `async`/`await` support in ES6 targets (Node v4+)

TypeScript now supports asynchronous functions for engines that have native support for ES6 generators, e.g. Node v4 and above.
Asynchronous functions are prefixed with the `async` keyword; `await` suspends the execution until an asynchronous function return promise is fulfilled and unwraps the value from the `Promise` returned.

##### Example

In the following example, each input element will be printed out one at a time with a 200ms delay:

```ts
"use strict";

// printDelayed is a 'Promise<void>'
async function printDelayed(elements: string[]) {
    for (const element of elements) {
        await delay(200);
        console.log(element);
    }
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

printDelayed(["Hello", "beautiful", "asynchronous", "world"]).then(() => {
    console.log();
    console.log("Printed every element!");
});
```

For more information see [Async Functions](http://blogs.msdn.com/b/typescript/archive/2015/11/03/what-about-async-await.aspx) blog post.

## Support for `--target ES6` with `--module`

TypeScript 1.7 adds `ES6` to the list of options available for the `--module` flag and allows you to specify the module output when targeting `ES6`. This provides more flexibility to target exactly the features you want in specific runtimes.

##### Example

```json
{
    "compilerOptions": {
        "module": "amd",
        "target": "es6"
    }
}
```

## `this`-typing

It is a common pattern to return the current object (i.e. `this`) from a method to create [fluent-style APIs](https://en.wikipedia.org/wiki/Fluent_interface).
For instance, consider the following `BasicCalculator` module:

```ts
export default class BasicCalculator {
    public constructor(protected value: number = 0) { }

    public currentValue(): number {
        return this.value;
    }

    public add(operand: number) {
        this.value += operand;
        return this;
    }

    public subtract(operand: number) {
        this.value -= operand;
        return this;
    }

    public multiply(operand: number) {
        this.value *= operand;
        return this;
    }

    public divide(operand: number) {
        this.value /= operand;
        return this;
    }
}
```

A user could express `2 * 5 + 1` as

```ts
import calc from "./BasicCalculator";

let v = new calc(2)
    .multiply(5)
    .add(1)
    .currentValue();
```

This often opens up very elegant ways of writing code; however, there was a problem for classes that wanted to extend from `BasicCalculator`.
Imagine a user wanted to start writing a `ScientificCalculator`:

```ts
import BasicCalculator from "./BasicCalculator";

export default class ScientificCalculator extends BasicCalculator {
    public constructor(value = 0) {
        super(value);
    }

    public square() {
        this.value = this.value ** 2;
        return this;
    }

    public sin() {
        this.value = Math.sin(this.value);
        return this;
    }
}
```

Because TypeScript used to infer the type `BasicCalculator` for each method in `BasicCalculator` that returned `this`, the type system would forget that it had `ScientificCalculator` whenever using a `BasicCalculator` method.

For instance:

```ts
import calc from "./ScientificCalculator";

let v = new calc(0.5)
    .square()
    .divide(2)
    .sin()    // Error: 'BasicCalculator' has no 'sin' method.
    .currentValue();
```

This is no longer the case - TypeScript now infers `this` to have a special type called `this` whenever inside an instance method of a class.
The `this` type is written as so, and basically means "the type of the left side of the dot in a method call".

The `this` type is also useful with intersection types in describing libraries (e.g. Ember.js) that use mixin-style patterns to describe inheritance:

```ts
interface MyType {
    extend<T>(other: T): this & T;
}
```

## ES7 exponentiation operator

TypeScript 1.7 supports upcoming [ES7/ES2016 exponentiation operators](https://github.com/rwaldron/exponentiation-operator): `**` and `**=`. The operators will be transformed in the output to ES3/ES5 using `Math.pow`.

##### Example

```ts
var x = 2 ** 3;
var y = 10;
y **= 2;
var z =  -(4 ** 3);
```

Will generate the following JavaScript output:

```js
var x = Math.pow(2, 3);
var y = 10;
y = Math.pow(y, 2);
var z = -(Math.pow(4, 3));
```

## Improved checking for destructuring object literal

TypeScript 1.7 makes checking of destructuring patterns with an object literal or array literal initializers less rigid and more intuitive.

When an object literal is contextually typed by the implied type of an object binding pattern:
* Properties with default values in the object binding pattern become optional in the object literal.
* Properties in the object binding pattern that have no match in the object literal are required to have a default value in the object binding pattern and are automatically added to the object literal type.
* Properties in the object literal that have no match in the object binding pattern are an error.

When an array literal is contextually typed by the implied type of an array binding pattern:

* Elements in the array binding pattern that have no match in the array literal are required to have a default value in the array binding pattern and are automatically added to the array literal type.

##### Example

```ts
// Type of f1 is (arg?: { x?: number, y?: number }) => void
function f1({ x = 0, y = 0 } = {}) { }

// And can be called as:
f1();
f1({});
f1({ x: 1 });
f1({ y: 1 });
f1({ x: 1, y: 1 });

// Type of f2 is (arg?: (x: number, y?: number) => void
function f2({ x, y = 0 } = { x: 0 }) { }

f2();
f2({});        // Error, x not optional
f2({ x: 1 });
f2({ y: 1 });  // Error, x not optional
f2({ x: 1, y: 1 });
```

## Support for decorators when targeting ES3

Decorators are now allowed when targeting ES3. TypeScript 1.7 removes the ES5-specific use of `reduceRight` from the `__decorate` helper. The changes also inline calls to `Object.getOwnPropertyDescriptor` and `Object.defineProperty` in a backwards-compatible fashion that allows for clean up of the emit for ES5 and later by removing various repetitive calls to the aforementioned `Object` methods.


## TypeScript 1.6

## JSX support

JSX is an embeddable XML-like syntax. It is meant to be transformed into valid JavaScript, but the semantics of that transformation are implementation-specific. JSX came to popularity with the React library but has since seen other applications. TypeScript 1.6 supports embedding, type checking, and optionally compiling JSX directly into JavaScript.

#### New `.tsx` file extension and `as` operator

TypeScript 1.6 introduces a new `.tsx` file extension.  This extension does two things: it enables JSX inside of TypeScript files, and it makes the new `as` operator the default way to cast (removing any ambiguity between JSX expressions and the TypeScript prefix cast operator). For example:

```ts
var x = <any> foo;
// is equivalent to:
var x = foo as any;
```

#### Using React

To use JSX-support with React you should use the [React typings](https://github.com/borisyankov/DefinitelyTyped/tree/master/react). These typings define the `JSX` namespace so that TypeScript can correctly check JSX expressions for React. For example:

```ts
/// <reference path="react.d.ts" />

interface Props {
  name: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>
  }
}

<MyComponent name="bar" />; // OK
<MyComponent name={0} />; // error, `name` is not a number
```

#### Using other JSX frameworks

JSX element names and properties are validated against the `JSX` namespace. Please see the [[JSX]] wiki page for defining the `JSX` namespace for your framework.

#### Output generation

TypeScript ships with two JSX modes: `preserve` and `react`.
- The `preserve` mode will keep JSX expressions as part of the output to be further consumed by another transform step. *Additionally the output will have a `.jsx` file extension.*
- The `react` mode will emit `React.createElement`, does not need to go through a JSX transformation before use, and the output will have a `.js` file extension.

See the [[JSX]] wiki page for more information on using JSX in TypeScript.

## Intersection types

TypeScript 1.6 introduces intersection types, the logical complement of union types. A union type `A | B` represents an entity that is either of type `A` or type `B`, whereas an intersection type `A & B` represents an entity that is both of type `A` *and* type `B`.

##### Example

```ts
function extend<T, U>(first: T, second: U): T & U {
    let result = <T & U> {};
    for (let id in first) {
        result[id] = first[id];
    }
    for (let id in second) {
        if (!result.hasOwnProperty(id)) {
            result[id] = second[id];
        }
    }
    return result;
}

var x = extend({ a: "hello" }, { b: 42 });
var s = x.a;
var n = x.b;
```

```ts
type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
    name: string;
}

var people: LinkedList<Person>;
var s = people.name;
var s = people.next.name;
var s = people.next.next.name;
var s = people.next.next.next.name;
```

```ts
interface A { a: string }
interface B { b: string }
interface C { c: string }

var abc: A & B & C;
abc.a = "hello";
abc.b = "hello";
abc.c = "hello";
```

See [issue #1256](https://github.com/Microsoft/TypeScript/issues/1256) for more information.

## Local type declarations

Local class, interface, enum, and type alias declarations can now appear inside function declarations. Local types are block scoped, similar to variables declared with `let` and `const`. For example:

```ts
function f() {
    if (true) {
        interface T { x: number }
        let v: T;
        v.x = 5;
    }
    else {
        interface T { x: string }
        let v: T;
        v.x = "hello";
    }
}
```

The inferred return type of a function may be a type declared locally within the function. It is not possible for callers of the function to reference such a local type, but it can of course be matched structurally. For example:

```ts
interface Point {
    x: number;
    y: number;
}

function getPointFactory(x: number, y: number) {
    class P {
        x = x;
        y = y;
    }
    return P;
}

var PointZero = getPointFactory(0, 0);
var PointOne = getPointFactory(1, 1);
var p1 = new PointZero();
var p2 = new PointZero();
var p3 = new PointOne();
```

Local types may reference enclosing type parameters and local class and interfaces may themselves be generic. For example:

```ts
function f3() {
    function f<X, Y>(x: X, y: Y) {
        class C {
            public x = x;
            public y = y;
        }
        return C;
    }
    let C = f(10, "hello");
    let v = new C();
    let x = v.x;  // number
    let y = v.y;  // string
}
```

## Class expressions

TypeScript 1.6 adds support for ES6 class expressions. In a class expression, the class name is optional and, if specified, is only in scope in the class expression itself. This is similar to the optional name of a function expression. It is not possible to refer to the class instance type of a class expression outside the class expression, but the type can of course be matched structurally. For example:

```ts
let Point = class {
    constructor(public x: number, public y: number) { }
    public length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
};
var p = new Point(3, 4);  // p has anonymous class type
console.log(p.length());
```

## Extending expressions

TypeScript 1.6 adds support for classes extending arbitrary expression that computes a constructor function. This means that built-in types can now be extended in class declarations.

The `extends` clause of a class previously required a type reference to be specified. It now accepts an expression optionally followed by a type argument list. The type of the expression must be a constructor function type with at least one construct signature that has the same number of type parameters as the number of type arguments specified in the `extends` clause. The return type of the matching construct signature(s) is the base type from which the class instance type inherits. Effectively, this allows both real classes and "class-like" expressions to be specified in the `extends` clause.

Some examples:

```ts
// Extend built-in types

class MyArray extends Array<number> { }
class MyError extends Error { }

// Extend computed base class

class ThingA {
    getGreeting() { return "Hello from A"; }
}

class ThingB {
    getGreeting() { return "Hello from B"; }
}

interface Greeter {
    getGreeting(): string;
}

interface GreeterConstructor {
    new (): Greeter;
}

function getGreeterBase(): GreeterConstructor {
    return Math.random() >= 0.5 ? ThingA : ThingB;
}

class Test extends getGreeterBase() {
    sayHello() {
        console.log(this.getGreeting());
    }
}
```

## `abstract` classes and methods

TypeScript 1.6 adds support for `abstract` keyword for classes and their methods. An abstract class is allowed to have methods with no implementation, and cannot be constructed.

##### Examples

```ts
abstract class Base {
    abstract getThing(): string;
    getOtherThing() { return 'hello'; }
}

let x = new Base(); // Error, 'Base' is abstract

// Error, must either be 'abstract' or implement concrete 'getThing'
class Derived1 extends Base { }

class Derived2 extends Base {
    getThing() { return 'hello'; }
    foo() {
        super.getThing(); // Error: cannot invoke abstract members through 'super'
    }
}

var x = new Derived2(); // OK
var y: Base = new Derived2(); // Also OK
y.getThing(); // OK
y.getOtherThing(); // OK
```

## Generic type aliases

With TypeScript 1.6, type aliases can be generic. For example:

```ts
type Lazy<T> = T | (() => T);

var s: Lazy<string>;
s = "eager";
s = () => "lazy";

interface Tuple<A, B> {
    a: A;
    b: B;
}

type Pair<T> = Tuple<T, T>;
```

## Stricter object literal assignment checks

TypeScript 1.6 enforces stricter object literal assignment checks for the purpose of catching excess or misspelled properties. Specifically, when a fresh object literal is assigned to a variable or passed as an argument for a non-empty target type, it is an error for the object literal to specify properties that don't exist in the target type.

##### Examples

```ts
var x: { foo: number };
x = { foo: 1, baz: 2 };  // Error, excess property `baz`

var y: { foo: number, bar?: number };
y = { foo: 1, baz: 2 };  // Error, excess or misspelled property `baz`
```

A type can include an index signature to explicitly indicate that excess properties are permitted:

```ts
var x: { foo: number, [x: string]: any };
x = { foo: 1, baz: 2 };  // Ok, `baz` matched by index signature
```

## ES6 generators

TypeScript 1.6 adds support for generators when targeting ES6.

A generator function can have a return type annotation, just like a function. The annotation represents the type of the generator returned by the function. Here is an example:

```ts
function *g(): Iterable<string> {
    for (var i = 0; i < 100; i++) {
        yield ""; // string is assignable to string
    }
    yield * otherStringGenerator(); // otherStringGenerator must be iterable and element type assignable to string
}
```

A generator function with no type annotation can have the type annotation inferred. So in the following case, the type will be inferred from the yield statements:

```ts
function *g() {
    for (var i = 0; i < 100; i++) {
        yield ""; // infer string
    }
    yield * otherStringGenerator(); // infer element type of otherStringGenerator
}
```

## Experimental support for `async` functions

TypeScript 1.6 introduces experimental support of `async` functions when targeting ES6. Async functions are expected to invoke an asynchronous operation and await its result without blocking normal execution of the program. This accomplished through the use of an ES6-compatible `Promise` implementation, and transposition of the function body into a compatible form to resume execution when the awaited asynchronous operation completes.


An *async function* is a function or method that has been prefixed with the `async` modifier. This modifier informs the compiler that function body transposition is required, and that the keyword `await` should be treated as a unary expression instead of an identifier. An *Async Function* must provide a return type annotation that points to a compatible `Promise` type. Return type inference can only be used if there is a globally defined, compatible `Promise` type.

##### Example

```ts
var p: Promise<number> = /* ... */;
async function fn(): Promise<number> {
  var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
  return 1 + i;
}

var a = async (): Promise<number> => 1 + await p; // suspends execution.
var a = async () => 1 + await p; // suspends execution. return type is inferred as "Promise<number>" when compiling with --target ES6
var fe = async function(): Promise<number> {
  var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
  return 1 + i;
}

class C {
  async m(): Promise<number> {
    var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
    return 1 + i;
  }

  async get p(): Promise<number> {
    var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
    return 1 + i;
  }
}
```

## Nightly builds

While not strictly a language change, nightly builds are now available by installing with the following command:

```Shell
npm install -g typescript@next
```

## Adjustments in module resolution logic

Starting from release 1.6 TypeScript compiler will use different set of rules to resolve module names when targeting 'commonjs'. These [rules](https://github.com/Microsoft/TypeScript/issues/2338) attempted to model module lookup procedure used by Node. This effectively mean that node modules can include information about its typings and TypeScript compiler will be able to find it. User however can override module resolution rules picked by the compiler by using `--moduleResolution` command line option. Possible values are:
- 'classic' - module resolution rules used by pre 1.6 TypeScript compiler
- 'node' - node-like module resolution

## Merging ambient class and interface declaration

The instance side of an ambient class declaration can be extended using an interface declaration The class constructor object is unmodified. For example:

```ts
declare class Foo {
    public x : number;
}

interface Foo {
    y : string;
}

function bar(foo : Foo)  {
    foo.x = 1; // OK, declared in the class Foo
    foo.y = "1"; // OK, declared in the interface Foo
}
```

## User-defined type guard functions

TypeScript 1.6 adds a new way to narrow a variable type inside an `if` block, in addition to `typeof` and `instanceof`. A user-defined type guard functions is one with a return type annotation of the form `x is T`, where `x` is a declared parameter in the signature, and `T` is any type. When a user-defined type guard function is invoked on a variable in an `if` block, the type of the variable will be narrowed to `T`.

##### Examples

```ts
function isCat(a: any): a is Cat {
  return a.name === 'kitty';
}

var x: Cat | Dog;
if(isCat(x)) {
  x.meow(); // OK, x is Cat in this block
}
```

## `exclude` property support in tsconfig.json

A tsconfig.json file that doesn't specify a files property (and therefore implicitly references all *.ts files in all subdirectories) can now contain an exclude property that specifies a list of files and/or directories to exclude from the compilation. The exclude property must be an array of strings that each specify a file or folder name relative to the location of the tsconfig.json file. For example:
```json
{
    "compilerOptions": {
        "out": "test.js"
    },
    "exclude": [
        "node_modules",
        "test.ts",
        "utils/t2.ts"
    ]
}
```
The `exclude` list does not support wilcards. It must simply be a list of files and/or directories.

## `--init` command line option

Run `tsc --init` in a directory to create an initial `tsconfig.json` in this directory with preset defaults. Optionally pass command line arguments along with `--init` to be stored in your initial tsconfig.json on creation.

## TypeScript 1.5

## ES6 Modules ##

TypeScript 1.5 supports ECMAScript 6 (ES6) modules. ES6 modules are effectively TypeScript external modules with a new syntax: ES6 modules are separately loaded source files that possibly import other modules and provide a number of externally accessible exports. ES6 modules feature several new export and import declarations. It is recommended that TypeScript libraries and applications be updated to use the new syntax, but this is not a requirement. The new ES6 module syntax coexists with TypeScript's original internal and external module constructs and the constructs can be mixed and matched at will.

#### Export Declarations

In addition to the existing TypeScript support for decorating declarations with `export`, module members can also be exported using separate export declarations, optionally specifying different names for exports using `as` clauses.

```ts
interface Stream { ... }
function writeToStream(stream: Stream, data: string) { ... }
export { Stream, writeToStream as write };  // writeToStream exported as write
```

Import declarations, as well, can optionally use `as` clauses to specify different local names for the imports. For example:

```ts
import { read, write, standardOutput as stdout } from "./inout";
var s = read(stdout);
write(stdout, s);
```

As an alternative to individual imports, a namespace import can be used to import an entire module:

```ts
import * as io from "./inout";
var s = io.read(io.standardOutput);
io.write(io.standardOutput, s);
```

#### Re-exporting

Using `from` clause a module can copy the exports of a given module to the current module without introducing local names.

```ts
export { read, write, standardOutput as stdout } from "./inout";
```

`export *` can be used to re-export all exports of another module. This is useful for creating modules that aggregate the exports of several other modules.

```ts
export function transform(s: string): string { ... }
export * from "./mod1";
export * from "./mod2";
```

#### Default Export

An export default declaration specifies an expression that becomes the default export of a module:

```ts
export default class Greeter {
    sayHello() {
        console.log("Greetings!");
    }
}
```

Which in turn can be imported using default imports:

```ts
import Greeter from "./greeter";
var g = new Greeter();
g.sayHello();
```


#### Bare Import

A "bare import" can be used to import a module only for its side-effects.

```ts
import "./polyfills";
```

For more information about module, please see the [ES6 module support spec](https://github.com/Microsoft/TypeScript/issues/2242).

## Destructuring in declarations and assignments

TypeScript 1.5 adds support to ES6 destructuring declarations and assignments.

#### Declarations

A destructuring declaration introduces one or more named variables and initializes them with values extracted from properties of an object or elements of an array.

For example, the following sample declares variables `x`, `y`, and `z`, and initializes them to `getSomeObject().x`, `getSomeObject().y` and `getSomeObject().z` respectively:

```ts
var { x, y, z} = getSomeObject();
```

Destructuring declarations also works for extracting values from arrays:

```ts
var [x, y, z = 10] = getSomeArray();
```

Similarly, destructuring  can be used in function parameter declarations:

```ts
function drawText({ text = "", location: [x, y] = [0, 0], bold = false }) {
    // Draw text
}

// Call drawText with an object literal
var item = { text: "someText", location: [1,2,3], style: "italics" };
drawText(item);
```

#### Assignments

Destructuring patterns can also be used in regular assignment expressions. For instance, swapping two variables can be written as a single destructuring assignment:

```ts
var x = 1;
var y = 2;
[x, y] = [y, x];
```

## `namespace` keyword

TypeScript used the `module` keyword to define both "internal modules" and "external modules"; this has been a bit of confusion for developers new to TypeScript. "Internal modules" are closer to what most people would call a namespace; likewise, "external modules" in JS speak really just are modules now.

> Note: Previous syntax defining internal modules are still supported.

**Before**:
```ts
module Math {
    export function add(x, y) { ... }
}
```

**After**:
```ts
namespace Math {
    export function add(x, y) { ... }
}
```

## `let` and `const` support
ES6 `let` and `const` declarations are now supported when targeting ES3 and ES5.

#### Const

```ts
const MAX = 100;

++MAX; // Error: The operand of an increment or decrement
       //        operator cannot be a constant.
```

#### Block scoped

```ts
if (true) {
  let a = 4;
  // use a
}
else {
  let a = "string";
  // use a
}

alert(a); // Error: a is not defined in this scope
```

## for..of support

TypeScript 1.5 adds support to ES6 for..of loops on arrays for ES3/ES5 as well as full support for Iterator interfaces when targetting ES6.

##### Example

The TypeScript compiler will transpile for..of arrays to idiomatic ES3/ES5 JavaScript when targeting those versions:

```ts
for (var v of expr) { }
```

will be emitted as:

```js
for (var _i = 0, _a = expr; _i < _a.length; _i++) {
    var v = _a[_i];
}
```

## Decorators
> TypeScript decorators are based on the [ES7 decorator proposal](https://github.com/wycats/javascript-decorators).

A decorator is:
- an expression
- that evaluates to a function
- that takes the target, name, and property descriptor as arguments
- and optionally returns a property descriptor to install on the target object

> For more information, please see the [Decorators](https://github.com/Microsoft/TypeScript/issues/2249) proposal.

##### Example

Decorators `readonly` and `enumerable(false)` will be applied to the property `method` before it is installed on class `C`. This allows the decorator to change the implementation, and in this case, augment the descriptor to be writable: false and enumerable: false.

```ts
class C {
  @readonly
  @enumerable(false)
  method() { }
}

function readonly(target, key, descriptor) {
    descriptor.writable = false;
}

function enumerable(value) {
  return function (target, key, descriptor) {
     descriptor.enumerable = value;
  }
}
```

## Computed properties
Initializing an object with dynamic properties can be a bit of a burden. Take the following example:

```ts
type NeighborMap = { [name: string]: Node };
type Node = { name: string; neighbors: NeighborMap;}

function makeNode(name: string, initialNeighbor: Node): Node {
    var neighbors: NeighborMap = {};
    neighbors[initialNeighbor.name] = initialNeighbor;
    return { name: name, neighbors: neighbors };
}
```

Here we need to create a variable to hold on to the neighbor-map so that we can initialize it. With TypeScript 1.5, we can let the compiler do the heavy lifting:

```ts
function makeNode(name: string, initialNeighbor: Node): Node {
    return {
        name: name,
        neighbors: {
            [initialNeighbor.name]: initialNeighbor
        }
    }
}
```

## Support for `UMD` and `System` module output

In addition to `AMD` and `CommonJS` module loaders, TypeScript now supports emitting modules `UMD` ([Universal Module Definition](https://github.com/umdjs/umd)) and [`System`](https://github.com/systemjs/systemjs) module formats.

**Usage**:
> tsc --module umd

and

> tsc --module system


## Unicode codepoint escapes in strings

ES6 introduces escapes that allow users to represent a Unicode codepoint using just a single escape.

As an example, consider the need to escape a string that contains the character '𠮷'.  In UTF-16/UCS2, '𠮷' is represented as a surrogate pair, meaning that it's encoded using a pair of 16-bit code units of values, specifically `0xD842` and `0xDFB7`. Previously this meant that you'd have to escape the codepoint as `"\uD842\uDFB7"`. This has the major downside that it’s difficult to discern two independent characters from a surrogate pair.

With ES6’s codepoint escapes, you can cleanly represent that exact character in strings and template strings with a single escape: `"\u{20bb7}"`. TypeScript will emit the string in ES3/ES5 as `"\uD842\uDFB7"`.

## Tagged template strings in ES3/ES5

In TypeScript 1.4, we added support for template strings for all targets, and tagged templates for just ES6. Thanks to some considerable work done by [@ivogabe](https://github.com/ivogabe), we bridged the gap for for tagged templates in ES3 and ES5.

When targeting ES3/ES5, the following code

```ts
function oddRawStrings(strs: TemplateStringsArray, n1, n2) {
    return strs.raw.filter((raw, index) => index % 2 === 1);
}

oddRawStrings `Hello \n${123} \t ${456}\n world`
```

will be emitted as

```js
function oddRawStrings(strs, n1, n2) {
    return strs.raw.filter(function (raw, index) {
        return index % 2 === 1;
    });
}
(_a = ["Hello \n", " \t ", "\n world"], _a.raw = ["Hello \\n", " \\t ", "\\n world"], oddRawStrings(_a, 123, 456));
var _a;
```

## AMD-dependency optional names

`/// <amd-dependency path="x" />` informs the compiler about a non-TS module dependency that needs to be injected in the resulting module's require call; however, there was no way to consume this module in the TS code.

The new `amd-dependency name` property allows passing an optional name for an amd-dependency:

```ts
/// <amd-dependency path="legacy/moduleA" name="moduleA"/>
declare var moduleA:MyType
moduleA.callStuff()
```

Generated JS code:

```js
define(["require", "exports", "legacy/moduleA"], function (require, exports, moduleA) {
    moduleA.callStuff()
});
```

## Project support through `tsconfig.json`

Adding a `tsconfig.json` file in a directory indicates that the directory is the root of a TypeScript project. The tsconfig.json file specifies the root files and the compiler options required to compile the project. A project is compiled in one of the following ways:

- By invoking tsc with no input files, in which case the compiler searches for the tsconfig.json file starting in the current directory and continuing up the parent directory chain.
- By invoking tsc with no input files and a -project (or just -p) command line option that specifies the path of a directory containing a tsconfig.json file.

##### Example

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "noImplicitAny": true,
        "sourceMap": true,
    }
}
```

See the [tsconfig.json wiki page](https://github.com/Microsoft/TypeScript/wiki/tsconfig.json) for more details.

## `--rootDir` command line option

Option `--outDir` duplicates the input hierarchy in the output. The compiler computes the root of the input files as the longest common path of all input files; and then uses that to replicate all its substructure in the output.

Sometimes this is not desirable, for instance inputs `FolderA/FolderB/1.ts` and `FolderA/FolderB/2.ts` would result in output structure mirroring `FolderA/FolderB/`. Now if a new file `FolderA/3.ts` is added to the input, the output structure will pop out to mirror `FolderA/`.

`--rootDir` specifies the input directory to be mirrored in output instead of computing it.

## `--noEmitHelpers` command line option

The TypeScript compiler emits a few helpers like `__extends` when needed. The helpers are emitted in every file they are referenced in. If you want to consolidate all helpers in one place, or override the default behavior, use `--noEmitHelpers` to instructs the compiler not to emit them.


## `--newLine` command line option

By default the output new line character is `\r\n` on Windows based systems and `\n` on *nix based systems. `--newLine` command line flag allows overriding this behavior and specifying the new line character to be used in generated output files.

## `--inlineSourceMap` and `inlineSources` command line options

`--inlineSourceMap` causes source map files to be written inline in the generated `.js` files instead of in a independent `.js.map` file.  `--inlineSources` allows for additionally inlining the source `.ts` file into the

## TypeScript 1.4

## Union types

### Overview

Union types are a powerful way to express a value that can be one of several types. For example, you might have an API for running a program that takes a commandline as either a `string`, a `string[]` or a function that returns a `string`. You can now write:

```ts
interface RunOptions {
   program: string;
   commandline: string[]|string|(() => string);
}
```

Assignment to union types works very intuitively -- anything you could assign to one of the union type's members is assignable to the union:

```ts
var opts: RunOptions = /* ... */;
opts.commandline = '-hello world'; // OK
opts.commandline = ['-hello', 'world']; // OK
opts.commandline = [42]; // Error, number is not string or string[]
```

When reading from a union type, you can see any properties that are shared by them:

```ts
if (opts.length === 0) { // OK, string and string[] both have 'length' property
  console.log("it's empty");
}
```

Using Type Guards, you can easily work with a variable of a union type:

```ts
function formatCommandline(c: string|string[]) {
    if (typeof c === 'string') {
        return c.trim();
    }
    else {
        return c.join(' ');
    }
}
```

### Stricter Generics

With union types able to represent a wide range of type scenarios, we've decided to improve the strictness of certain generic calls. Previously, code like this would (surprisingly) compile without error:

```ts
function equal<T>(lhs: T, rhs: T): boolean {
  return lhs === rhs;
}

// Previously: No error
// New behavior: Error, no best common type between 'string' and 'number'
var e = equal(42, 'hello');
```
With union types, you can now specify the desired behavior at both the function declaration site and the call site:

```ts
// 'choose' function where types must match
function choose1<T>(a: T, b: T): T { return Math.random() > 0.5 ? a : b }
var a = choose1('hello', 42); // Error
var b = choose1<string|number>('hello', 42); // OK

// 'choose' function where types need not match
function choose2<T, U>(a: T, b: U): T|U { return Math.random() > 0.5 ? a : b }
var c = choose2('bar', 'foo'); // OK, c: string
var d = choose2('hello', 42); // OK, d: string|number
```

### Better Type Inference

Union types also allow for better type inference in arrays and other places where you might have multiple kinds of values in a collection:

```ts
var x = [1, 'hello']; // x: Array<string|number>
x[0] = 'world'; // OK
x[0] = false; // Error, boolean is not string or number
```

## `let` declarations

In JavaScript, `var` declarations are "hoisted" to the top of their enclosing scope. This can result in confusing bugs:

```ts
console.log(x); // meant to write 'y' here
/* later in the same block */
var x = 'hello';
```

The new ES6 keyword `let`, now supported in TypeScript, declares a variable with more intuitive "block" semantics. A `let` variable can only be referred to after its declaration, and is scoped to the syntactic block where it is defined:

```ts
if (foo) {
    console.log(x); // Error, cannot refer to x before its declaration
    let x = 'hello';
}
else {
    console.log(x); // Error, x is not declared in this block
}
```

`let` is only available when targeting ECMAScript 6 (`--target ES6`).

## `const` declarations
The other new ES6 declaration type supported in TypeScript is `const`. A `const` variable may not be assigned to, and must be initialized where it is declared. This is useful for declarations where you don't want to change the value after its initialization:

```ts
const halfPi = Math.PI / 2;
halfPi = 2; // Error, can't assign to a `const`
```

`const` is only available when targeting ECMAScript 6 (`--target ES6`).

## Template strings

TypeScript now supports ES6 template strings. These are an easy way to embed arbitrary expressions in strings:

```ts
var name = "TypeScript";
var greeting  = `Hello, ${name}! Your name has ${name.length} characters`;
```

When compiling to pre-ES6 targets, the string is decomposed:

```js
var name = "TypeScript!";
var greeting = "Hello, " + name + "! Your name has " + name.length + " characters";
```

## Type Guards

A common pattern in JavaScript is to use `typeof` or `instanceof` to examine the type of an expression at runtime. TypeScript now understands these conditions and will change type inference accordingly when used in an `if` block.

Using `typeof` to test a variable:

```ts
var x: any = /* ... */;
if(typeof x === 'string') {
    console.log(x.subtr(1)); // Error, 'subtr' does not exist on 'string'
}
// x is still any here
x.unknown(); // OK
```

Using `typeof` with union types and `else`:

```ts
var x: string | HTMLElement = /* ... */;
if(typeof x === 'string') {
    // x is string here, as shown above
}
else {
    // x is HTMLElement here
    console.log(x.innerHTML);
}
```

Using `instanceof` with classes and union types:

```ts
class Dog { woof() { } }
class Cat { meow() { } }
var pet: Dog|Cat = /* ... */;
if (pet instanceof Dog) {
    pet.woof(); // OK
}
else {
    pet.woof(); // Error
}
```

## Type Aliases

You can now define an *alias* for a type using the `type` keyword:

```ts
type PrimitiveArray = Array<string|number|boolean>;
type MyNumber = number;
type NgScope = ng.IScope;
type Callback = () => void;
```

Type aliases are exactly the same as their original types; they are simply alternative names.

## `const enum` (completely inlined enums)
Enums are very useful, but some programs don't actually need the generated code and would benefit from simply inlining all instances of enum members with their numeric equivalents. The new `const enum` declaration works just like a regular `enum` for type safety, but erases completely at compile time.

```ts
const enum Suit { Clubs, Diamonds, Hearts, Spades }
var d = Suit.Diamonds;
```

Compiles to exactly:

```js
var d = 1;
```

TypeScript will also now compute enum values when possible:

```ts
enum MyFlags {
  None = 0,
  Neat = 1,
  Cool = 2,
  Awesome = 4,
  Best = Neat | Cool | Awesome
}
var b = MyFlags.Best; // emits var b = 7;
```

## `-noEmitOnError` commandline option

The default behavior for the TypeScript compiler is to still emit .js files if there were type errors (for example, an attempt to assign a `string` to a `number`). This can be undesirable on build servers or other scenarios where only output from a "clean" build is desired. The new flag `noEmitOnError` prevents the compiler from emitting .js code if there were any errors.

This is now the default for MSBuild projects; this allows MSBuild incremental build to work as expected, as outputs are only generated on clean builds.

## AMD Module names

By default AMD modules are generated anonymous. This can lead to problems when other tools are used to process the resulting modules like a bundler (e.g. `r.js`).

The new `amd-module name` tag allows passing an optional module name to the compiler:

```ts
//// [amdModule.ts]
///<amd-module name='NamedModule'/>
export class C {
}
```
Will result in assigning the name `NamedModule` to the module as part of calling the AMD `define`:

```js
//// [amdModule.js]
define("NamedModule", ["require", "exports"], function (require, exports) {
    var C = (function () {
        function C() {
        }
        return C;
    })();
    exports.C = C;
});
```

## TypeScript 1.3

## Protected

The new `protected` modifier in classes works like it does in familiar languages like C++, C#, and Java. A `protected` member of a class is visible only inside subclasses of the class in which it is declared:

```ts
class Thing {
  protected doSomething() { /* ... */ }
}

class MyThing extends Thing {
  public myMethod() {
    // OK, can access protected member from subclass
    this.doSomething();
  }
}
var t = new MyThing();
t.doSomething(); // Error, cannot call protected member from outside class
```

## Tuple types

Tuple types express an array where the type of certain elements is known, but need not be the same. For example, you may want to represent an array with a `string` at position 0 and a `number` at position 1:

```ts
// Declare a tuple type
var x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error
```

When accessing an element with a known index, the correct type is retrieved:

```ts
console.log(x[0].substr(1)); // OK
console.log(x[1].substr(1)); // Error, 'number' does not have 'substr'
```

Note that in TypeScript 1.4, when accessing an element outside the set of known indices, a union type is used instead:

```ts
x[3] = 'world'; // OK
console.log(x[5].toString()); // OK, 'string' and 'number' both have toString
x[6] = true; // Error, boolean isn't number or string
```

## TypeScript 1.1

## Performance Improvements

The 1.1 compiler is typically around 4x faster than any previous release. See [this blog post for some impressive charts.](http://blogs.msdn.com/b/typescript/archive/2014/10/06/announcing-typescript-1-1-ctp.aspx)

## Better Module Visibility Rules

TypeScript now only strictly enforces the visibility of types in modules if the `--declaration` flag is provided. This is very useful for Angular scenarios, for example:

```ts
module MyControllers {
  interface ZooScope extends ng.IScope {
    animals: Animal[];
  }
  export class ZooController {
    // Used to be an error (cannot expose ZooScope), but now is only
    // an error when trying to generate .d.ts files
    constructor(public $scope: ZooScope) { }
    /* more code */
  }
}
```
