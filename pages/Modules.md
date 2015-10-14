> **A note about terminology:**
It's important to note that in TypeScript 1.5, the nomenclature has changed.
"Internal modules" are now "namespaces".
"External modules" are now simply "modules", as to align with [ECMAScript 2015 (also known as ES6)](http://www.ecma-international.org/ecma-262/6.0/)'s terminology.

# Introduction

Starting with the ECMAScript 2015, JavaScript has a concept of modules. TypeScript shares this concept.

Modules are executed within their own scope, and not in the global scope; this means that variables, functions, classes, etc., declared in a module are not visible outside the module unless they are explicitly exported using one of the [`export` forms](#export). 
Conversely, to consume a variable, function, class, interface, etc., exported from a different module, it has to be imported using one of the [`import` forms](#import).

Modules are declarative; the relationships between modules are specified in terms of imports and exports at the file level.

Modules import one another using a module loader. 
At runtime the module loader is responsible for locating and executing all dependencies of a module before executing it. 
Common module loaders used in JavaScript are [CommonJS module loader](https://en.wikipedia.org/wiki/CommonJS) for Node.js applications, and [require.js](http://requirejs.org/) for Web applications.
 
In TypeScript just as in ECMAScript 2015, any file containing a top-level `import` or `export` is considered a module.

# Export

## Exporting a declaration

Any declaration can be exported by adding the `export` keyword, e.g. variable, class, function, enum, interface, type alias, etc.

##### Validation.ts

```ts
export interface StringValidator {
    isAcceptable(s: string): boolean;
}
```

##### ZipCodeValidator.ts

```ts
export const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
```

## Export statements

Export statements are handy when exports need to be renamed for consumers, so the above example can be written as:

```ts
 class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
export { ZipCodeValidator };
export { ZipCodeValidator as mainValidator };
```

## Re-exports

Often modules extend other modules, and partially expose some of their features. 
A re-export does not import it locally, or introduce a local variable.

##### ParseIntBasedZipCodeValidator.ts

```ts
export class ParseIntBasedZipCodeValidator {
    isAcceptable(s: string) {
        return s.length === 5 && parseInt(s).toString() === s;;
    }
}

// Export original validator but rename it
export {ZipCodeValidator as RegExpBasedZipCodeValidator} from "./ZipCodeValidator";
```

Optionally, a module can wrap one or more modules and combine all their exports using `export * from "module"` syntax.

##### AllValidators.ts

```ts
export * from "./StringValidator"; // exports interface StringValidator
export * from "./LettersOnlyValidator"; // exports class LettersOnlyValidator 
export * from "./ZipCodeValidator";  // exports class ZipCodeValidator
```

# Import

Importing is just about as easy as exporting from an module. 
Importing an exported declaration is done through using one of the `import` forms below:

## Import a single export from a module

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";

var myValidator = new ZipCodeValidator();
```

imports can also be renamed

```ts
import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
var myValidator = new ZCV();
```

## Import the entire module into a single variable, and use it to access the module exports

```ts
import * as validator from "./ZipCodeValidator";
var myValidator = new validator.ZipCodeValidator();
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
`default` exports are imported using a different import form.

`default` exports are really handy.
For instance, a library like JQuery might have a default export of `jQuery` or `$`, which we'd probably also import under the name `$` or `jQuery`.

##### JQuery.d.ts

```ts
declare var $: JQuery;
export default $;
```

##### App.ts

```ts
import $ from "JQuery";

$("button.continue").html( "Next Step..." );
```

Classes and function declarations can be authored directly as default exports.
Defualt export class and function declaration names are optional.

##### ZipCodeValidator.ts

```ts
export default class ZipCodeValidator {
    static numberRegexp = /^[0-9]+$/;
    isAcceptable(s: string) {
        return s.length === 5 && ZipCodeValidator.numberRegexp.test(s);
    }
}
```

##### Test.ts

```ts
import validator from "./ZipCodeValidator";

var validator = new validator();
```

or

##### StaticZipCodeValidator.ts

```ts
const numberRegexp = /^[0-9]+$/;

export default function (s: string) {
    return s.length === 5 && numberRegexp.test(s);
}
```

##### Test.ts

```ts
import validate from "./StaticZipCodeValidator";

var strings = ["Hello", "98052", "101"];

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

Both CommonJS and AMD generally have the concept of an `exports` object which contains all exports from a module.

They also support replacing the `exports` object with a custom single object.
Default exports are meant to act as a replacement for this behavior; however, the two an incompatible.
TypeScript supports `export =` to module the traditional CommonJS and AMD workflow.

The `export =` syntax specifies a single object that is exported from the module.
This can be a class, interface, namespace, function, or enum.

When importing a module using `export =`, TypeScript-specific `import var = require("module")` must be used to import the module.

##### ZipCodeValidator.ts

```ts
var numberRegexp = /^[0-9]+$/;
class ZipCodeValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
export = ZipCodeValidator;
```

##### Test.ts

```ts
import zip = require("./ZipCodeValidator");

// Some samples to try
var strings = ["Hello", "98052", "101"];

// Validators to use
var validator = new zip.ZipCodeValidator();

// Show whether each string passed each validator
strings.forEach(s => {
  console.log(`"${ s }" - ${ validator.isAcceptable(s) ? "matches" : "does not match" }`);
});
```


# Code Generation for Modules

Depending on the module target specified during compilation, the compiler will generate appropriate code for Node.js ([CommonJS](http://wiki.commonjs.org/wiki/CommonJS)), require.js ([AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)), isomorphic ([UMD](https://github.com/umdjs/umd)), [SystemJS](https://github.com/systemjs/systemjs), or [ECMAScript 2015 native modules](http://www.ecma-international.org/ecma-262/6.0/#sec-modules) (ES6) module-loading systems.
For more information on what the `define`, `require` and `register` calls in the generated code do, consult the documentation for each module loader.

This simple example shows how the names used during importing and exporting get translated into the module loading code.

##### SimpleModule.ts

```ts
import m = require("mod");
export var t = m.something + 1;
```

##### AMD / RequireJS SimpleModule.js:

```js
define(["require", "exports", "./mod"], function (require, exports, mod_1) {
    exports.t = mod_1.something + 1;
});
```

##### CommonJS / Node SimpleModule.js:

```js
var mod_1 = require("./mod");
exports.t = mod_1.something + 1;
```

##### UMD SimpleModule.js:

```js
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mod"], factory);
    }
})(function (require, exports) {
    var mod_1 = require("./mod");
    exports.t = mod_1.something + 1;
});
```

##### System SimpleModule.js:

```js
System.register(["./mod"], function(exports_1) {
    var mod_1;
    var t;
    return {
        setters:[
            function (mod_1_1) {
                mod_1 = mod_1_1;
            }],
        execute: function() {
            exports_1("t", t = mod_1.something + 1);
        }
    }
});
```

##### Native ECMAScript 2015 modules SimpleModule.js:

```js
import { something } from "./mod";
export var t = something + 1;
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

const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
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
    for (var name in validators) {
        console.log(`"${ s }" - ${ validators[name].isAcceptable(s) ? "matches" : "does not match" } ${ name }`);
    }
});
```

# Optional Module Loading and Other Advanced Loading Scenarios

In some cases, you may want to only load a module under some conditions.
In TypeScript, we can use the pattern shown below to implement this and other advanced loading scenarios to directly invoke the module loaders without losing type safety.

The compiler detects whether each module is used in the emitted JavaScript.
If a module identifier is only ever used as part of a type annotations and never as an expression, then no `require` call is emitted for that module.
This elision of unused references is a good performance optimization, and also allows for optional loading of those modules.

The core idea of the pattern is that the `import id = require("...")` statement gives us access to the types exposed by the module.
The module loader is invoked (through `require`) dynamically, as shown in the `if` blocks below.
This leverages the reference-elision optimization so that the module is only loaded when needed.
For this pattern to work, it's important that the symbol defined via an `import` is only used in type positions (i.e. never in a position that would be emitted into the JavaScript).

To maintain type safety, we can use the `typeof` keyword.
The `typeof` keyword, when used in a type position, produces the type of a value, in this case the type of the module.

##### Dynamic Module Loading in Node.js

```ts
declare var require;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
    var x: typeof Zip = require("./ZipCodeValidator");
    if (x.isAcceptable(".....")) { /* ... */ }
}
```

##### Sample: Dynamic Module Loading in require.js

```ts
declare var require;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
    require(["./ZipCodeValidator"], (x: typeof Zip) => {
        if (x.isAcceptable("...")) { /* ... */ }
    });
}
```

##### Sample: Dynamic Module Loading in System.js

```ts
declare var System;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
    System.import("./ZipCodeValidator").then((x: typeof Zip) => {
        if (x.isAcceptable("...")) { /* ... */ }
    });
}
```

# Working with Other JavaScript Libraries

To describe the shape of libraries not written in TypeScript, we need to declare the API that the library exposes.

We call declarations that don't define an implementation "ambient".
Typically, these are defined in `.d.ts` files.
If you're familiar with C/C++, you can think of these as `.h` files.
Let's look at a few examples.

## Ambient Modules

In Node.js, most tasks are accomplished by loading one or more modules.
We could define each module in its own `.d.ts` file with top-level export declarations, but it's more convenient to write them as one larger `.d.ts` file.
To do so, we use a construct similar to ambient namespaces, but we use the `module` keyword and the quoted name of the module which will be available to a later import.
For example:

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

Now we can `/// <reference>` `node.d.ts` and then load the modules using `import url = require("url");`.

```ts
/// <reference path="node.d.ts"/>
import * as URL from "url";
var myUrl = URL.parse("http://www.typescriptlang.org");
```
