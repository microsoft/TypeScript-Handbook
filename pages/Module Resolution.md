> This section assumes some basic knowledge about modules.
Please see the [Modules](./Modules.md) documentation for more information.

"Module Resolution" refers to the process the compiler follows to understand the shape of an import target.
Consider an import statement like `import { a } from "./moduleA"`; to be able to correctly check any use of the import target `a`, the compiler needs to know what it means, and what is its type.
To do that, the compiler needs to look at the exported declaration with name `a` from `moduleA`.
This could be defined in a `.ts` file from your own code, or in a `.d.ts` for an external definition file that your code depends on.
The first step, is to locate the definition of `moduleA`.

The process to locate a module goes as follows:

1. Locate a file with the module definition
 The compiler will try to first locate a file containing the definition of the imported module.
 To do so the compiler follows one of two different strategies: [Classic](#classic) and [node](#node).
2. Locate an ambient module declaration
 If no file was found, the compiler will attempt to locate an [ambient module declaration](#ambient-module-declaration) for the module if applicable.
3. Log an error if all failed
 If none were found, you will get `error TS2307: Cannot find module 'moduleA'.`

## Relative vs. Non-relative module imports

Module imports are resolved differently based on whether the module reference is relative or non-relative.

A relative import is one that stars with `/`, `./` or `../`.
A non-relative import is one that does *not* start with either.

A relative import is resolved relative to the importing file.
A relative import can **not** resolve to an ambient module declaration.
Use this for importing your own modules that are guaranteed to maintain their relative location at runtime.

A non-relative import can pick resolve to files from node_modules for instance.
They can also resolve to ambient module declarations.
Use non-relative imports to import external module dependencies.

## Module Resolution Strategies

Use `--moduleResolution` to specify the module resolution strategy.
Possible values are [Classic](#classic) and [Node](#node).
The default if not specified is [Node](#node).

### Classic

This is the TypeScript 1.0 default module resolution strategy.
This strategy is supported mainly for backward compatibility.

Following this resolution strategy the compiler walks up the folder tree starting with importing file, trying to locate a matching definition file.

For example:

A non-relative import to `moduleB` such as `import { b } from "moduleB";`, in a source file `/root/src/folder/A.ts`, would result in attempting the following locations for locating `"moduleB"`:

* `/root/src/folder/moduleB.ts`
* `/root/src/folder/moduleB.d.ts`
* `/root/src/moduleB.ts`
* `/root/src/moduleB.d.ts`
* `/root/moduleB.ts`
* `/root/moduleB.d.ts`
* `/moduleB.ts`
* `/moduleB.d.ts`

A relative import however would be resolved relative to the importing file.
So `import { b } from "./moduleB";` in source file `/root/src/folder/A.ts` would result in the following lookups:

* `/root/src/folder/moduleB.ts`
* `/root/src/folder/moduleB.d.ts`

### Node

This resolution strategy attempts to *mimic* the [nodejs](https://nodejs.org/) module resolution mechanism at runtime.
The full nodejs resolution algorithm is outlined in [nodejs module documentation](https://nodejs.org/api/modules.html#modules_all_together).

#### How nodejs resolves modules

To understand what the steps the TS compiler will follow, it is important to shed some light on nodejs modules.
nodejs supports multiple ways to define a module;
a nodejs module can be:

* A file

 For instance in `/src/moduleA.js` a require statement such as `var x = require("./moduleB");` refers to `/src/moduleB.js`.
 See [nodejs file modules documentation](https://nodejs.org/api/modules.html#modules_file_modules) for more details.

* A folder, with an implicit `"main"` module named `index.js`

 For instance in `/src/moduleA.js` and require statement `var x = require("./moduleB");` refers to `/src/moduleB/index.js`.
 See [nodejs folder modules documentation](https://nodejs.org/api/modules.html#modules_folders_as_modules) for more details.

* A package, with a package manifest in `package.json` file that specifies the `"main"` module

 For instance in `/src/moduleA.js`, a require statement `var x = require("./moduleB");`, and a `/src/moduleB/package.json` file `{ "main": "lib/mainModule.js" }` refers to `/src/moduleB/lib/mainModule.js`.

Moreover, a require for a [non-relative module name](#relative-vs-non-relative-module-imports) is resolved from a special folder named `node_modules`.
`node_modules` can be on the same level as the current file, or higher up in the directory chain.
Nodejs will *walk up* the directory chain, inspecting the contents of `node_modules` looking for the module to load.

Following up our example above, in `/src/moduleA.js`, and a require statement `var x = require("moduleB");` will result in the following attempts:

* resolve `/src/node_modules/moduleB.js` as a file
* resolve `/src/node_modules/moduleB/index.js`
* resolve `/src/node_modules/moduleB/` as a package
* walk up to `/`
* resolve `/node_modules/moduleB.js` as a file
* resolve `/node_modules/moduleB/index.js`
* resolve `/node_modules/moduleB` as a package

See [nodejs loading modules from `node_modules` documentation](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders) for more details.

#### How TypeScript resolves modules

TypeScript will *mimic* the nodejs resolution strategy at run-time as described above to locate definition files for modules at compile-time.
TypeScript *overlays* the TypeScript source file extensions (`.ts`, `.tsx`, and `.d.ts`) on the nodejs resolution logic.
A `"typings"` field in `package.json` at compile-time serves to identify the "main" module definition for a package, similar to how `"main"` behaves at run-time.

An import statement `import {b} from "./moduleB";` in a ts file `/src/moduleA.ts` would result in attempting the following locations for locating `"moduleB"`:

* `/src/moduleB.ts`
* `/src/moduleB.tsx`
* `/src/moduleB.d.ts`
* `/src/moduleB/package.json` look for `"typings"` property
* `/src/moduleB/index.ts`
* `/src/moduleB/index.tsx`
* `/src/moduleB/index.d.ts`

Similarly a non-relative import will follow the node resolution logic, looking up first a file, then looking the file name as a node package.
So `import { b } from "moduleB";` in source file `/src/moduleA.ts` would result in the following lookups:

* `/src/node_modules/moduleB.ts`
* `/src/node_modules/moduleB.tsx`
* `/src/node_modules/moduleB.d.ts`
* `/src/node_modules/moduleB/package.json` look for `"typings"` property
* `/src/node_modules/moduleB/index.ts`
* `/src/node_modules/moduleB/index.tsx`
* `/node_modules/moduleB.ts`
* `/node_modules/moduleB.tsx`
* `/node_modules/moduleB.d.ts`
* `/node_modules/moduleB/package.json` look for `"typings"` property
* `/node_modules/moduleB/index.ts`
* `/node_modules/moduleB/index.tsx`
* `/node_modules/moduleB/index.d.ts`

## Additional module resolution flags

A project source layout sometimes does not match that of the output.
Usually a set of build steps result in generating the final output.
These include compiling `.ts` files into `.js`, and copying dependencies from different source locations to a single location.
The result is that module names at runtime, may have different names in the final output than that the source files containing their definitions.
Or that module paths in the final outputs do not match their corresponding source file paths at compile time.

The TypeScript compiler has a set of national flags to *inform* the compiler of these transformations, that are expected to happen to the sources to generate the final output.
It is important to note that the compiler will *not* perform any of these transformations;
it just uses these pieces of Infomation to guide the process of resolving a module import to its definition file.

### Base URL

Using a `baseUrl` is a common practice in applications using AMD.
A common practice for applications using AMD loaders, is to "deployed" all modules to a single folder at run-time.
The sources of these modules can live in different directories, but a build script will put them all together.

Setting `baseUrl` informs the compiler where to find modules.
All modules imports with non-relative names, are assumed to be relative to the `baseUrl`.

Value of *baseUrl* is determined as either:

* value of *baseUrl* command line argument (if given path is relative it is computed based on current directory)
* value of *baseUrl* property in 'tsconfig.json' (if given path is relative it is computed based on the location of 'tsconfig.json')

You can find more documentation on baseUrl in [RequireJS](http://requirejs.org/docs/api.html#config-baseUrl) and [SystemJS](https://github.com/systemjs/systemjs/blob/master/docs/overview.md#baseurl) documentation.

### Path mapping

Sometimes modules are not directly located under *baseUrl*.
For instance, an import to a module `"jquery"` would be translated at runtime to `"node_modules\jquery\dist\jquery.slim.min.js"`.
Loaders use a mapping configuration to map module names to files at run-time, see [RequireJs documentation](http://requirejs.org/docs/api.html#config-paths) and [SystemJS documentation](https://github.com/systemjs/systemjs/blob/master/docs/overview.md#map-config).

The TypeScript compiler supports the declaration of such mappings using `"paths"` property in `tsconfig.json` files.
Here is an example for how to specify the `"paths"` property for `jquery`.

```JSON
{
  "compilerOptions": {
    "paths": {
      "jquery": ["node_modules\jquery\dist\jquery.slim.min.js"]
    }
}
```

Using `"paths"` also allow for more sophisticated mappings including multiple fall back locations.
Consider a project configuration where only some modules are available in one location, and the rest are in another.
A build step would put them all together in one place.
The project layout may look like:

```tree
projectRoot
├── folder1
│   ├── file1.ts (imports 'folder1/file2' and 'folder2/file3')
│   └── file2.ts
├── generated
│   ├── folder1
│   └── folder2
│       └── file3.ts
└── tsconfig.json
```

The corresponding `tsconfig.json` would look like:

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "*": [
                    "*",
                    "generated/*"
                ]
            }
    }
}
```

This tells the compiler for anything that matches the pattern `"*"` (i.e. all values), to look in two locations:

 1. `"*"`: meaning the same name unchanged, so map `<moduleName>` => `<baseUrl>\<moduleName>`
 2. `"generated\*"` meaning the module name with an appended prefix "generated", so map `<moduleName>` => `<baseUrl>\generated\<moduleName>`

Following this logic, the compiler will attempt to resolve the two imports as such:

* import 'folder1/file2'

  1. pattern '*' is matched and wildcard captures the whole module name
  2. try first substitution in the list: '*' -> `folder1/file2`
  3. result of substitution is relative name - combine it with *baseUrl* -> `projectRoot/folder1/file2.ts`.
  4. File exists. Done.

* import 'folder2/file2'

  1. pattern '*' is matched and wildcard captures the whole module name
  2. try first substitution in the list: '*' -> `folder2/file3`
  3. result of substitution is relative name - combine it with *baseUrl* -> `projectRoot/folder2/file3.ts`.
  4. File does not exists, move to the second substitution
  5. second substitution 'generated/*' -> `generated/folder2/file3`
  6. result of substitution is relative name - combine it with *baseUrl* -> `projectRoot/generated/folder2/file3.ts`.
  7. File exists. Done.

### Virtual Directories with `rootDirs`

Sometimes the project sources from multiple directories at compile time are all combined to generate a single output location.
This can be viewed as a set of source directories create a "virtual" directories.

Using 'rootDirs', you can inform the compiler of *roots* of these "virtual" directories;
and thus the compiler can resolve relative modules imports within these "virtual" directories *as if* were merged together in one directory.

For example consider this project structure:

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

Files in `src/views` are user code for some UI controls.
Files in `generated/templates` are UI template binding code auto-generated by a template generator as part of the build.
A build step will copy the files in `/src/views` and `/generated/templates/views` to the same directory in the output.
At run-time, a view can expect its template to exist next to it, and thus should import it using a relative name as `"./template"`.

To specify this relationship to the compiler, use`"rootDirs"`.
`"rootDirs"` specify a list of *roots* whose contents are expected to merge at run-time.
So following our example, the `tsconfig.json` file should look like:

```json
{
  "compilerOptions": {
    "rootDirs": [
      "src/views",
      "generated/templates"
    ]
  }
}
```

Every time the compiler sees a relative module import in a subfolder of one of the `rootDirs`, it will attempt to look for this import in each of the entries of `rootDirs`.

## Ambient module declarations

An ambient module declaration is a module declaration of the form:

```ts
declare module "moduleB" {
    ....
}
```

An import to a non-relative name can resolve to an ambient module declaration.
Please note that the compiler will always attempt to resolve a module import to a file first.

A non-relative module import can **not** resolve to an ambient module declaration.

## Tracing module resolution

As discussed earlier, the compiler can visit files outside the current folder when resolving a module.
This can be hard when diagnosing why a module is not resolved, or is resolved to an incorrect definition.
Enabling the compiler module resolution tracing using `--traceModuleResolution`.

Let's say we have a sample application that uses the `typescript` module.
`app.ts` has an import like `import * as ts from `typescript`.

```tree
│   tsconfig.json
├───node_modules
│   └───typescript
│       └───lib
│               typescript.d.ts
└───src
        app.ts
```

```cmd
tsc --traceModuleResolution
```

Results in an output as such:

```txt
======== Resolving module 'typescript' from 'src/app.ts'. ========
Module resolution kind is not specified, using 'NodeJs'.
Loading module 'typescript' from 'node_modules' folder.
File 'src/node_modules/typescript.ts' does not exist.
File 'src/node_modules/typescript.tsx' does not exist.
File 'src/node_modules/typescript.d.ts' does not exist.
File 'src/node_modules/typescript/package.json' does not exist.
File 'node_modules/typescript.ts' does not exist.
File 'node_modules/typescript.tsx' does not exist.
File 'node_modules/typescript.d.ts' does not exist.
Found 'package.json' at 'node_modules/typescript/package.json'.
'package.json' has 'typings' field './lib/typescript.d.ts' that references 'node_modules/typescript/lib/typescript.d.ts'.
File 'node_modules/typescript/lib/typescript.d.ts' exist - use it as a module resolution result.
======== Module name 'typescript' was successfully resolved to 'node_modules/typescript/lib/typescript.d.ts'. ========
```

#### Things to look out for

* Name and location of the import

 > ======== Resolving module **'typescript'** from **'src/app.ts'**. ========

* The strategy the compiler is following

 > Module resolution kind is not specified, using **'NodeJs'**.

* Loading of typings from npm packages

 > 'package.json' has **'typings'** field './lib/typescript.d.ts' that references 'node_modules/typescript/lib/typescript.d.ts'.

* Final result

 > ======== Module name 'typescript' was **successfully resolved** to 'node_modules/typescript/lib/typescript.d.ts'. ========

## Using `--noResolve`

Normally the compiler will attempt to resolve all module imports before it starts the compilation process.
Every time it successfully resolves an `import` to a file, the file is added to the set of files the compiler will process later on.

The `--noResolve` compiler options instructs the compiler not to "add" any files to the compilation that were not passed on the command line.
It will still try to resolve the module to files, but if the file as not specified, it will not be included.

## Common Questions

### Why does a module in `exclude` list is still picked up by the compiler

`tsconfig.json` turns a folder into a “project”.
Without specifying any `“exclude”` or `“files”` entries, all files in the folder containing the `tsconfig.json` and all its sub-directories are included in your compilation.
If you want to exclude some of the files use `“exclude”`, if you would rather specify all the files instead of letting the compiler look them up, use `“files”`.

That was `tsconfig.json` automatic inclusion.
That does not embed module resolution as discussed above.
If the compiler identified a file as a target of a module import, it will be included in the compilation regardless if it was excluded in the previous steps.

So to exclude a file from the compilation, you need to exclude and all **all** files that has an `import` or `/// <reference path="..." />` directives to it.
