# Introduction

Starting with ECMAScript 2015, JavaScript has modules. TypeScript shares this concept.
Modules are units of code that declare their dependencies using `import` and `export`.
Modules provide for code reuse, isolation, and tooling support for bundling.
In TypeScript, just as in ECMAScript 2015, any file containing a top-level `import` or `export` is considered a module.

Modules are executed within their own scope, not in the global scope; this means that variables, functions, classes, etc. declared in a module are not visible outside the module unless they are explicitly exported using one of the [`export` forms](#export).
Conversely, to consume a variable, function, class, interface, etc. exported from a different module, it has to be imported using one of the [`import` forms](#import).

Modules are declarative; the relationships between modules are specified in terms of imports and exports at the file level.

Modules import one another using a module loader.
At runtime the module loader is responsible for locating and executing all dependencies of a module before executing it.
Well-known module loaders used in JavaScript are the [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) module loader for Node.js and [AMD](http://requirejs.org/) for Web applications.
TypeScript can generate appropriate code for Node.js ([CommonJS](http://wiki.commonjs.org/wiki/CommonJS)), require.js ([AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)), isomorphic ([UMD](https://github.com/umdjs/umd)), [SystemJS](https://github.com/systemjs/systemjs), or [native ECMAScript 2015 (ES6)](http://www.ecma-international.org/ecma-262/6.0/#sec-modules) module-loading systems.

> **A note about terminology:**
It's important to note that before TypeScript 1.5, modules were called "external modules" and [namespaces](./appendices/Namespaces.md) were called "internal modules".

# Export

## Exporting a declaration

Any declaration (such as a variable, function, class, type alias, or interface) can be exported by adding the `export` keyword.

##### Validation.ts

```ts
export interface StringValidator {
    isAcceptable(s: string): boolean;
}
```

##### ZipCodeValidator.ts

```ts
import { StringValidator } from "Validation";
export const numberRegexp = /^[0-9]{5}$/;

export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return numberRegexp.test(s);
    }
}
```

## Export statements

Export statements are handy when exports need to be renamed for consumers, so the above example can be written as:

```ts
import { StringValidator } from "Validation";
class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return numberRegexp.test(s);
    }
}
export { ZipCodeValidator as MainValidator }; // Rename to MainValidator
export { ZipCodeValidator }; // Also export without rename
```

## Re-exports

Often modules extend other modules, and partially expose some of their features.
A re-export does not import it locally, or introduce a local variable.

##### ParseIntBasedZipCodeValidator.ts

```ts
export class ParseIntBasedZipCodeValidator {
    isAcceptable(s: string) {
        return s.length === 5 && parseInt(s).toString() === s;
    }
}

// Export original validator but rename it
export {ZipCodeValidator as RegExpBasedZipCodeValidator} from "./ZipCodeValidator";
```

Optionally, a module can wrap one or more modules and combine all their exports using `export * from "module"` syntax.

##### AllValidators.ts

```ts
export * from "./Validation; // exports interface StringValidator
export * from "./ZipCodeValidator";  // exports class ZipCodeValidator
export * from "./ParseIntZipCodeValidator"; // exports class ParseIntZipCodeValidator
```

Now you can import multiple validators from `AllValidators`:

```ts
import { ZipCodeValidator, ParseIntZipCodeValidator } from "./AllValidators";
```

# Import

Importing is just about as easy as exporting from an module.
Importing an exported declaration is done through using one of the `import` forms below:

## Import a single export from a module

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";

let myValidator = new ZipCodeValidator();
```

imports can also be renamed

```ts
import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
let myValidator = new ZCV();
```

## Import the entire module into a single variable, and use it to access the module exports

```ts
import * as validator from "./ZipCodeValidator";
let myValidator = new validator.ZipCodeValidator();
```

## Import a module for side-effects only

Though not recommended practice, some modules set up some global state that can be used by other modules.
These modules may not have any exports, or the consumer is not interested in any of their exports.
To import these modules, use:

```ts
import "./my-module.js";
```

# Default exports

Each module can optionally export a `default` export.
Default exports are marked with the keyword `default`; and there can only be one `default` export per module.
`default` exports are imported using a different import form &mdash; `import <name> from "library";`.

`default` exports are really handy.
For instance, a library like JQuery would have a default export of `$` or `jQuery`, which we'd also import under the name `$` or `jQuery`.

##### JQuery.d.ts

```ts
// TypeScript declarations for a JQuery-like module
declare let $: JQueryLike;
export default $;
```

##### App.ts

```ts
import $ from "JQueryLike";

$("button.continue").html( "Next Step..." );
```

Classes and function declarations can be authored directly as default exports.
Default export class and function declaration names are optional.

##### ZipCodeValidator.ts

```ts
export default class ZipCodeValidator {
    static numberRegexp = /^[0-9]{5}$/;
    isAcceptable(s: string) {
        return ZipCodeValidator.numberRegexp.test(s);
    }
}
```

##### Test.ts

```ts
import validator from "./ZipCodeValidator";

let myValidator = new validator();
```

or

##### StaticZipCodeValidator.ts

```ts
const numberRegexp = /^[0-9]{5}$/;

export default function (s: string) {
    return numberRegexp.test(s);
}
```

##### Test.ts

```ts
import validate from "./StaticZipCodeValidator";

let strings = ["Hello", "98052", "101"];

// Use function validate
strings.forEach(s => {
  console.log(`"${s}" ${validate(s) ? " matches" : " does not match"}`);
});
```

`default` exports can also be just values:

##### OneTwoThree.ts

```ts
export default "123";
```

##### Log.ts

```ts
import num from "./OneTwoThree";

console.log(num); // "123"
```

# `export =` and `import = require()`

Both CommonJS and AMD have an `exports` object which contains all exports from a module.

They also support replacing the `exports` object with a custom single object.
Default exports are meant to act as a replacement for this behavior; however, the two are incompatible.
TypeScript supports `export =` to model the traditional CommonJS and AMD workflow.
This is useful if you're using one of these modules that you can't upgrade to standard ES2015 modules, but you shouldn't use it for new code.

The `export =` syntax specifies a single object that is exported from the module.
This can be a class, interface, namespace, function, or enum.

When importing a module using `export =`, TypeScript-specific syntax `import name = require("module")` must be used to import the module.

##### ZipCodeValidator.ts

```ts
let numberRegexp = /^[0-9]{5}$/;
class ZipCodeValidator {
    isAcceptable(s: string) {
        return numberRegexp.test(s);
    }
}
export = ZipCodeValidator;
```

##### Test.ts

```ts
import zip = require("./ZipCodeValidator");

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validator = new zip();

// Show whether each string passed each validator
strings.forEach(s => {
  console.log(`"${ s }" - ${ validator.isAcceptable(s) ? "matches" : "does not match" }`);
});
```

# Simple Example

Below, we've consolidated the Validator implementations used in previous examples to only export a single named export from each module.

To compile, we must specify a module target on the command line. For Node.js, use `--module commonjs`;
for require.js, use `--module amd`. For example:

```Shell
tsc --module commonjs Test.ts
```

When compiled, each module will become a separate `.js` file.
As with reference tags, the compiler will follow `import` statements to compile dependent files.

##### Validation.ts

```ts
export interface StringValidator {
    isAcceptable(s: string): boolean;
}
```

##### LettersOnlyValidator.ts

```ts
import { StringValidator } from "./Validation";

const lettersRegexp = /^[A-Za-z]+$/;

export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
        return lettersRegexp.test(s);
    }
}
```

##### ZipCodeValidator.ts

```ts
import { StringValidator } from "./Validation";

const numberRegexp = /^[0-9]{5}$/;

export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return numberRegexp.test(s);
    }
}
```

##### Test.ts

```ts
import { StringValidator } from "./Validation";
import { ZipCodeValidator } from "./ZipCodeValidator";
import { LettersOnlyValidator } from "./LettersOnlyValidator";

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validators: { [s: string]: StringValidator; } = {};
validators["ZIP code"] = new ZipCodeValidator();
validators["Letters only"] = new LettersOnlyValidator();

// Show whether each string passed each validator
strings.forEach(s => {
    for (const name in validators) {
        console.log(`"${ s }" - ${ validators[name].isAcceptable(s) ? "matches" : "does not match" } ${ name }`);
    }
});
```

# Working with Other JavaScript Libraries

To describe the shape of libraries not written in TypeScript, we need to declare the API that the library exposes.
The declaration gives just the type of the statement without any implementation.
If the library uses modules, the API declaration will also need to use modules.
For more details on writing the actual declarations, see [Writing Declaration Files](./Writing Declaration Files.md).

For example, if the JavaScript module looks like this:

```js
export var x = "example";
```

The TypeScript declaration will look like this:

```ts
export declare var x: string;
```

We call declarations that don't define an implementation "ambient".
Typically, these are defined in `.d.ts` files.
These are a lot like C's `.h` files.

## Ambient Modules

Normally, we would write one `.d.ts` file for each `.js` file in a multi-module library, but if this doesn't work, TypeScript has custom syntax that lets us cram multiple modules in a single large `.d.ts`.
To do so, we use the `module` keyword and the module's path which would normally be obtained from the module's filename.
This is called an "ambient module declaration".
Ambient module declarations are not part of the ES2015 module standard, and they only apply to *declarations* &mdash; not values and code.
For example, here's a simplified excerpt from the big combined `node.d.ts` that gives types to all the built-in Node modules:

##### node.d.ts (simplified excerpt)

```ts
declare module "url" {
    export interface Url {
        protocol?: string;
        hostname?: string;
        pathname?: string;
    }

    export function parse(urlStr: string, parseQueryString?, slashesDenoteHost?): Url;
}

declare module "path" {
    export function normalize(p: string): string;
    export function join(...paths: any[]): string;
    export var sep: string;
}
```

Now we can add it to `tsconfig.json`'s `"files"` property, or add a `/// <reference path="node.d.ts">` in each source file that uses it.
Afterwards, we can use the modules the usual way with `import * as URL from "url";`.

```ts
/// <reference path="node.d.ts"/>
import * as URL from "url";
let myUrl = URL.parse("http://www.typescriptlang.org");
```

# Guidance for structuring modules

## Top-level Exports

Export as close to top-level as possible.

Consumers of your module should have as little friction as possible when using things that you export.
Adding too many levels of nesting tends to be cumbersome, so think carefully about how you want to structure things.

Exporting a namespace from your module is an example of adding too many layers of nesting.
This can quickly become a pain point for users, and is usually unnecessary.

Static methods on an exported class have a similar problem - the class itself adds a layer of nesting.
Unless it increases expressivity or intent in a clearly useful way, consider simply exporting a helper function.

### Default Exports

If you're only exporting a single `class` or `function`, use `export default`.

Just as "exporting near the top-level" reduces friction on your module's consumers, so does introducing a default export.
If a module's primary purpose is to house one specific export, then you should consider exporting it as a default export.
This makes importing easier as well as actually using the import.
For example:

#### MyClass.ts

```ts
export default class SomeClass {
  constructor() { ... }
}
```

#### MyFunc.ts

```ts
export default function getThing() { return 'thing'; }
```

#### Consumer.ts

```ts
import C from "./MyClass";
import f from "./MyFunc";
let x = new C();
console.log(f());
```

This is optimal for consumers. They can name your type whatever they want (`C` in this case) and don't have to do any excessive dotting to find your objects.

### Exporting Multiple Objects

If you're exporting multiple objects, put them all at top-level

#### Example: MyThings.ts

```ts
export class SomeType { /* ... */ }
export function someFunc() { /* ... */ }
```

### Importing Multiple Objects

If you're importing multiple objects, explicitly list imported names.

#### Consumer.ts

```ts
import { SomeType, someFunc } from "./MyThings";
let x = new SomeType();
let y = someFunc();
```

### Namespace Import

Use the namespace import pattern if you're importing a large number of things.

#### MyLargeModule.ts

```ts
export class Dog { ... }
export class Cat { ... }
export class Tree { ... }
export class Flower { ... }
```

#### Consumer.ts

```ts
import * as myLargeModule from "./MyLargeModule.ts";
let x = new myLargeModule.Dog();
```

## Re-export to extend

Often you will need to extend functionality on a module.
A common JS pattern is to augment the original object with *extensions*, similar to how JQuery extensions work.
As we've mentioned before, modules do not *merge* like global namespace objects would.
The recommended solution is to *not* mutate the original object, but rather export a new entity that provides the new functionality.

Consider a simple calculator defined in module `Calculator.ts`.
The module also exports a helper function to test the calculator functionality by passing a list of input strings and writing the result at the end.

#### Calculator.ts

```ts
export declare class Calculator {
    // implementation is left as an exercise for the reader
    protected processDigit(digit: string, currentValue: number);
    protected processOperator(operator: string);
    protected evaluateOperator(operator: string, left: number, right: number);
    public handleChar(char: string);
    public getResult(): number;
}
export declare function calculate(c: Calculator, input: string);
```

Here is a simple test for the calculator using the exposed `test` function.

#### TestCalculator.ts

```ts
import { Calculator, calculate } from "./Calculator";


let c = new Calculator();
calculate(c, "1+2*33/11="); // should print 9
```

Now to extend this to add support for input with numbers in bases other than 10, let's create `ProgrammerCalculator.ts`

#### ProgrammerCalculator.ts

```ts
import { Calculator } from "./Calculator";

class ProgrammerCalculator extends Calculator {
    static digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

    constructor(public base: number) {
        super();
        if (base <= 0 || base > ProgrammerCalculator.digits.length) {
            throw new Error("base has to be within 0 to 16 inclusive.");
        }
    }

    protected processDigit(digit: string, currentValue: number) {
        if (ProgrammerCalculator.digits.indexOf(digit) >= 0) {
            return currentValue * this.base + ProgrammerCalculator.digits.indexOf(digit);
        }
    }
}

// Export the new extended calculator as Calculator
export { ProgrammerCalculator as Calculator };

// Also, export the helper function
export { calculate } from "./Calculator";
```

The new module `ProgrammerCalculator` exports an API shape similar to that of the original `Calculator` module, but does not augment any objects in the original module.
Here is a test for our ProgrammerCalculator class:

#### TestProgrammerCalculator.ts

```ts
import { Calculator, calculate } from "./ProgrammerCalculator";

let c = new Calculator(2);
test(c, "001+010="); // should print 3
```

# Module Pitfalls

## Red Flags

All of the following are red flags for module structuring. Double-check that you're not trying to namespace your modules if any of these apply to your files:

* A file whose only top-level declaration is `export namespace Foo { ... }` (remove `Foo` and move everything 'up' a level)
* A file that has a single `export class` or `export function` (consider using `export default`)
* Multiple files that have the same `export namespace Foo {` at top-level (don't think that these are going to combine into one `Foo`!)

## `/// <reference>`-ing a module

A common mistake is to try to use the `/// <reference ... />` syntax to refer to a module file, rather than using an `import` statement.
However, module resolution is separate from triple-slash references.
See [Module Resolution](./Module Resolution.md) to learn how module resolution works.
See [Triple-Slash References](./Triple-Slash Directives.md) to learn how triple-slash references work.

## Module Bundling

Both JavaScript and TypeScript have a one-to-one correspondence between files and modules.
One effect of this is that it's not possible to use the `--outFile` compiler switch to concatenate multiple JavaScript module files into a single JavaScript file.
