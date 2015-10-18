# Introduction

This post outlines the various ways to organize your code using namespaces and modules in TypeScript.
We'll be covering namespaces (previously "internal modules") and modules (previously called "external modules") and we'll discuss when each is appropriate and how to use them.
We'll also go over some advanced topics of how to use namespaces and modules, and address some common pitfalls when using them in TypeScript.

## A note about terminology

We just alluded to "internal modules" and "external modules".
If you're vaguely familiar with these terms, it's important to note that in TypeScript 1.5, the nomenclature has changed.
"Internal modules" are now "namespaces".
"External modules" are now simply "modules", as to align with ECMAScript 6's terminology.

Additionally, anywhere the `module` keyword was used when declaring an internal module, the `namespace` keyword can and should be used instead.

This avoids confusing new users by overloading them with similarly named terms.

## First steps

Let's start with the program we'll be using as our example throughout this page.
We've written a small set of simplistic string validators, as you might write to check a user's input on a form in a webpage or check the format of an externally-provided data file.

##### Validators in a single file

```TypeScript
interface StringValidator {
    isAcceptable(s: string): boolean;
}

var lettersRegexp = /^[A-Za-z]+$/;
var numberRegexp = /^[0-9]+$/;

class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
        return lettersRegexp.test(s);
    }
}

class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}

// Some samples to try
var strings = ['Hello', '98052', '101'];
// Validators to use
var validators: { [s: string]: StringValidator; } = {};
validators['ZIP code'] = new ZipCodeValidator();
validators['Letters only'] = new LettersOnlyValidator();
// Show whether each string passed each validator
strings.forEach(s => {
    for (var name in validators) {
        console.log('"' + s + '" ' + (validators[name].isAcceptable(s) ? ' matches ' : ' does not match ') + name);
    }
});
```

## Namespacing

As we add more validators, we're going to want to have some kind of organization scheme so that we can keep track of our types and not worry about name collisions with other objects.
Instead of putting lots of different names into the global namespace, let's wrap up our objects into a namespace.

In this example, we'll move all validator-related entities into a namespace called `Validation`.
Because we want the interfaces and classes here to be visible outside the namespace, we preface them with `export`.
Conversely, the variables `lettersRegexp` and `numberRegexp` are implementation details, so they are left unexported and will not be visible to code outside the namespace.
In the test code at the bottom of the file, we now need to qualify the names of the types when used outside the namespace, e.g. `Validation.LettersOnlyValidator`.

##### Namespaced Validators

```TypeScript
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }

    var lettersRegexp = /^[A-Za-z]+$/;
    var numberRegexp = /^[0-9]+$/;

    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }

    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}

// Some samples to try
var strings = ['Hello', '98052', '101'];
// Validators to use
var validators: { [s: string]: Validation.StringValidator; } = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
validators['Letters only'] = new Validation.LettersOnlyValidator();
// Show whether each string passed each validator
strings.forEach(s => {
    for (var name in validators) {
        console.log('"' + s + '" ' + (validators[name].isAcceptable(s) ? ' matches ' : ' does not match ') + name);
    }
});
```

# Splitting Across Files

As our application grows, we'll want to split the code across multiple files to make it easier to maintain.

## Multi-file namespaces

Here, we'll split our `Validation` namespace across many files.
Even though the files are separate, they can each contribute to the same namespace and can be consumed as if they were all defined in one place.
Because there are dependencies between files, we'll add reference tags to tell the compiler about the relationships between the files.
Our test code is otherwise unchanged.

##### Validation.ts

```TypeScript
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}
```

##### LettersOnlyValidator.ts

```TypeScript
/// <reference path="Validation.ts" />
namespace Validation {
    var lettersRegexp = /^[A-Za-z]+$/;
    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }
}
```

##### ZipCodeValidator.ts

```TypeScript
/// <reference path="Validation.ts" />
namespace Validation {
    var numberRegexp = /^[0-9]+$/;
    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}
```

##### Test.ts

```TypeScript
/// <reference path="Validation.ts" />
/// <reference path="LettersOnlyValidator.ts" />
/// <reference path="ZipCodeValidator.ts" />

// Some samples to try
var strings = ['Hello', '98052', '101'];
// Validators to use
var validators: { [s: string]: Validation.StringValidator; } = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
validators['Letters only'] = new Validation.LettersOnlyValidator();
// Show whether each string passed each validator
strings.forEach(s => {
    for (var name in validators) {
        console.log('"' + s + '" ' + (validators[name].isAcceptable(s) ? ' matches ' : ' does not match ') + name);
    }
});
```

Once there are multiple files involved, we'll need to make sure all of the compiled code gets loaded.
There are two ways of doing this.

First, we can use concatenated output using the `--out` flag to compile all of the input files into a single JavaScript output file:

```Shell
tsc --out sample.js Test.ts
```

The compiler will automatically order the output file based on the reference tags present in the files. You can also specify each file individually:

```Shell
tsc --out sample.js Validation.ts LettersOnlyValidator.ts ZipCodeValidator.ts Test.ts
```

Alternatively, we can use per-file compilation (the default) to emit one JavaScript file for each input file.
If multiple JS files get produced, we'll need to use `<script>` tags on our webpage to load each emitted file in the appropriate order, for example:

##### MyTestPage.html (excerpt)

```TypeScript
    <script src="Validation.js" type="text/javascript" />
    <script src="LettersOnlyValidator.js" type="text/javascript" />
    <script src="ZipCodeValidator.js" type="text/javascript" />
    <script src="Test.js" type="text/javascript" />
```

# Going Modular

TypeScript also has the concept of modules.
Modules are used in two cases: Node.js and require.js.
Applications not using Node.js or require.js do not need to use modules and can best be organized using the namespaces, outlined above.

When using modules, relationships between files are specified in terms of imports and exports at the file level.
In TypeScript, any file containing a top-level `import` or `export` is considered a module.

Below, we have converted the previous example to use modules.
Notice that we do not have to use a `module` keyword - the files themselves constitute a module and are identified by their filenames.

The reference tags have been replaced with `import` statements that specify the dependencies between modules.
The `import` statement has two parts: the name that the module will be known by in this file, and the `require` keyword that specifies the path to the required module:

```TypeScript
import someMod = require('someModule');
```

We specify which objects are visible outside the module by using the `export` keyword on a top-level declaration, similarly to how `export` defined the public surface area of a namespace.

To compile, we must specify a module target on the command line. For Node.js, use `--module commonjs`; for require.js, use `--module amd`. For example:

```Shell
tsc --module commonjs Test.ts
```

When compiled, each module will become a separate `.js` file.
As with reference tags, the compiler will follow `import` statements to compile dependent files.

##### Validation.ts

```TypeScript
export interface StringValidator {
    isAcceptable(s: string): boolean;
}
```

##### LettersOnlyValidator.ts

```TypeScript
import validation = require('./Validation');
var lettersRegexp = /^[A-Za-z]+$/;
export class LettersOnlyValidator implements validation.StringValidator {
    isAcceptable(s: string) {
        return lettersRegexp.test(s);
    }
}
```

##### ZipCodeValidator.ts

```TypeScript
import validation = require('./Validation');
var numberRegexp = /^[0-9]+$/;
export class ZipCodeValidator implements validation.StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
```

##### Test.ts

```TypeScript
import validation = require('./Validation');
import zip = require('./ZipCodeValidator');
import letters = require('./LettersOnlyValidator');

// Some samples to try
var strings = ['Hello', '98052', '101'];
// Validators to use
var validators: { [s: string]: validation.StringValidator; } = {};
validators['ZIP code'] = new zip.ZipCodeValidator();
validators['Letters only'] = new letters.LettersOnlyValidator();
// Show whether each string passed each validator
strings.forEach(s => {
    for (var name in validators) {
        console.log('"' + s + '" ' + (validators[name].isAcceptable(s) ? ' matches ' : ' does not match ') + name);
    }
});
```

## Code Generation for Modules

Depending on the module target specified during compilation, the compiler will generate appropriate code for either Node.js (commonjs) or require.js (AMD) module-loading systems.
For more information on what the `define` and `require` calls in the generated code do, consult the documentation for each module loader.

This simple example shows how the names used during importing and exporting get translated into the module loading code.

##### SimpleModule.ts

```TypeScript
import m = require('mod');
export var t = m.something + 1;
```

##### AMD / RequireJS SimpleModule.js

```JavaScript
define(["require", "exports", 'mod'], function(require, exports, m) {
    exports.t = m.something + 1;
});
```

##### CommonJS / Node SimpleModule.js

```JavaScript
var m = require('mod');
exports.t = m.something + 1;
```

# Export =

In the previous example, when we consumed each validator, each module only exported one value.
In cases like this, it's cumbersome to work with these symbols through their qualified name when a single identifier would do just as well.

The `export =` syntax specifies a single object that is exported from the module.
This can be a class, interface, namespace, function, or enum.
When imported, the exported symbol is consumed directly and is not qualified by any name.

Below, we've simplified the Validator implementations to only export a single object from each module using the `export =` syntax.
This simplifies the consumption code  instead of referring to `zip.ZipCodeValidator`, we can simply refer to `zipValidator`.

##### Validation.ts

```TypeScript
export interface StringValidator {
    isAcceptable(s: string): boolean;
}
```

##### LettersOnlyValidator.ts

```TypeScript
import validation = require('./Validation');
var lettersRegexp = /^[A-Za-z]+$/;
class LettersOnlyValidator implements validation.StringValidator {
    isAcceptable(s: string) {
        return lettersRegexp.test(s);
    }
}
export = LettersOnlyValidator;
```

##### ZipCodeValidator.ts

```TypeScript
import validation = require('./Validation');
var numberRegexp = /^[0-9]+$/;
class ZipCodeValidator implements validation.StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}
export = ZipCodeValidator;
```

##### Test.ts

```TypeScript
import validation = require('./Validation');
import zipValidator = require('./ZipCodeValidator');
import lettersValidator = require('./LettersOnlyValidator');

// Some samples to try
var strings = ['Hello', '98052', '101'];
// Validators to use
var validators: { [s: string]: validation.StringValidator; } = {};
validators['ZIP code'] = new zipValidator();
validators['Letters only'] = new lettersValidator();
// Show whether each string passed each validator
strings.forEach(s => {
    for (var name in validators) {
        console.log('"' + s + '" ' + (validators[name].isAcceptable(s) ? ' matches ' : ' does not match ') + name);
    }
});
```

# Aliases

Another way that you can simplify working with either kind of module is to use `import q = x.y.z` to create shorter names for commonly-used objects.
Not to be confused with the `import x = require('name')` syntax used to load modules, this syntax simply creates an alias for the specified symbol.
You can use these sorts of imports (commonly referred to as aliases) for any kind of identifier, including objects created from module imports.

##### Basic Aliasing

```TypeScript
namespace Shapes {
    export namespace Polygons {
        export class Triangle { }
        export class Square { }
    }
}

import polygons = Shapes.Polygons;
var sq = new polygons.Square(); // Same as 'new Shapes.Polygons.Square()'
```

Notice that we don't use the `require` keyword; instead we assign directly from the qualified name of the symbol we're importing.
This is similar to using `var`, but also works on the type and namespace meanings of the imported symbol.
Importantly, for values, `import` is a distinct reference from the original symbol, so changes to an aliased `var` will not be reflected in the original variable.

# Optional Module Loading and Other Advanced Loading Scenarios

In some cases, you may want to only load a module under some conditions.
In TypeScript, we can use the pattern shown below to implement this and other advanced loading scenarios to directly invoke the module loaders without losing type safety.

The compiler detects whether each module is used in the emitted JavaScript.
If a module identifier is only ever used in type annotations and never as an expression then no `require` call is emitted for that module.
This culling of unused references is a good performance optimization, and also allows for optional loading of those modules.

The core idea of the pattern is that the `import id = require('...')` statement gives us access to the types exposed by the module.
The module loader is invoked (through `require`) dynamically, as shown in the `if` blocks below.
This leverages the reference-culling optimization so that the module is only loaded when needed.
For this pattern to work, it's important that the symbol defined via an `import` is only used in type positions (i.e. never in a position that would be emitted into the JavaScript).

To maintain type safety, we can use the `typeof` keyword.
The `typeof` keyword, when used in a type position, produces the type of a value, in this case the type of the module.

##### Dynamic Module Loading in Node.js

```TypeScript
declare var require;
import Zip = require('./ZipCodeValidator');
if (needZipValidation) {
    var x: typeof Zip = require('./ZipCodeValidator');
    if (x.isAcceptable('.....')) { /* ... */ }
}
```

##### Sample: Dynamic Module Loading in require.js

```TypeScript
declare var require;
import Zip = require('./ZipCodeValidator');
if (needZipValidation) {
    require(['./ZipCodeValidator'], (x: typeof Zip) => {
        if (x.isAcceptable('...')) { /* ... */ }
    });
}
```

# Working with Other JavaScript Libraries

To describe the shape of libraries not written in TypeScript, we need to declare the API that the library exposes.
Because most JavaScript libraries expose only a few top-level objects, namespaces and modules are a good way to represent them.
We call declarations that don't define an implementation "ambient".
Typically these are defined in `.d.ts` files.
If you're familiar with C/C++, you can think of these as `.h` files.
Let's look at a few examples.

## Ambient Namespaces

The popular library D3 defines its functionality in a global object called `d3`.
Because this library is loaded through a `<script>` tag (instead of a module loader), its declaration uses namespaces to define its shape.
For the TypeScript compiler to see this shape, we use an ambient namespace declaration.
For example, we could begin writing it as follows:

##### D3.d.ts (simplified excerpt)

<!-- TODO: This is not at all how it's done on DT - do we want to change this? -->

```TypeScript
declare namespace D3 {
    export interface Selectors {
        select: {
            (selector: string): Selection;
            (element: EventTarget): Selection;
        };
    }

    export interface Event {
        x: number;
        y: number;
    }

    export interface Base extends Selectors {
        event: Event;
    }
}

declare var d3: D3.Base;
```

## Ambient Modules

In Node.js, most tasks are accomplished by loading one or more modules.
We could define each module in its own `.d.ts` file with top-level export declarations, but it's more convenient to write them as one larger `.d.ts` file.
To do so, we use a construct similar to ambient namespaces, but we use the `module` keyword and the quoted name of the module which will be available to a later import.
For example:

##### node.d.ts (simplified excerpt)

```TypeScript
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

Now we can `/// <reference>` node.d.ts and then load the modules using e.g. `import url = require('url');`.

```TypeScript
///<reference path="node.d.ts"/>
import url = require("url");
var myUrl = url.parse("http://www.typescriptlang.org");
```

# Pitfalls of Namespaces and Modules

In this section we'll describe various common pitfalls in using namespaces and modules, and how to avoid them.

## `/// <reference>`-ing a module

A common mistake is to try to use the `/// <reference>` syntax to refer to a module file, rather than using import.
To understand the distinction, we first need to understand the three ways that the compiler can locate the type information for a module.

The first is by finding a `.ts` file named by an `import x = require(...);` declaration.
That file should be an implementation file with top-level import or export declarations.

The second is by finding a `.d.ts` file, similar to above, except that instead of being an implementation file, it's a declaration file (also with top-level import or export declarations).

The final way is by seeing an "ambient module declaration", where we `declare` a module with a matching quoted name.

##### myModules.d.ts

```TypeScript
// In a .d.ts file or .ts file that is not a module:
declare module "SomeModule" {
    export function fn(): string;
}
```

##### myOtherModule.ts

```TypeScript
/// <reference path="myModules.d.ts" />
import m = require("SomeModule");
```

The reference tag here allows us to locate the declaration file that contains the declaration for the ambient module.
This is how the node.d.ts file that several of the TypeScript samples use is consumed, for example.

## Needless Namespacing

If you're converting a program from namespaces to modules, it can be easy to end up with a file that looks like this:

##### shapes.ts

```TypeScript
export namespace Shapes {
    export class Triangle { /* ... */ }
    export class Square { /* ... */ }
}
```

The top-level module here `Shapes` wraps up `Triangle` and `Square` for no reason.
This is confusing and annoying for consumers of your module:

##### shapeConsumer.ts

```TypeScript
import shapes = require('./shapes');
var t = new shapes.Shapes.Triangle(); // shapes.Shapes?
```

A key feature of modules in TypeScript is that two different modules will never contribute names to the same scope.
Because the consumer of a module decides what name to assign it, there's no need to proactively wrap up the exported symbols in a namespace.

To reiterate why you shouldn't try to namespace your module contents, the general idea of namespacing is to provide logical grouping of constructs and to prevent name collisions.
Because the module file itself is already a logical grouping, and its top-level name is defined by the code that imports it, it's unnecessary to use an additional module layer for exported objects.

Here's a revised example:

##### shapes.ts

```TypeScript
export class Triangle { /* ... */ }
export class Square { /* ... */ }
```

##### shapeConsumer.ts

```TypeScript
import shapes = require('./shapes');
var t = new shapes.Triangle();
```

## Trade-offs of Modules

Just as there is a one-to-one correspondence between JS files and modules, TypeScript has a one-to-one correspondence between module source files and their emitted JS files.
One effect of this is that it's not possible to use the `--out` compiler switch to concatenate multiple module source files into a single JavaScript file.
