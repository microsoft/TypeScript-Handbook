## Overview

The presence of a `tsconfig.json` file in a directory indicates that the directory is the root of a TypeScript project.
The `tsconfig.json` file specifies the root files and the compiler options required to compile the project.
A project is compiled in one of the following ways:

## Using tsconfig.json

* By invoking tsc with no input files, in which case the compiler searches for the `tsconfig.json` file starting in the current directory and continuing up the parent directory chain.
* By invoking tsc with no input files and a `--project` (or just `-p`) command line option that specifies the path of a directory containing a `tsconfig.json` file, or a path to a valid `.json` file containing the configurations.

When input files are specified on the command line, `tsconfig.json` files are ignored.

## Examples

Example `tsconfig.json` files:

* Using the `"files"` property

  ```json
  {
      "compilerOptions": {
          "module": "commonjs",
          "noImplicitAny": true,
          "removeComments": true,
          "preserveConstEnums": true,
          "sourceMap": true
      },
      "files": [
          "core.ts",
          "sys.ts",
          "types.ts",
          "scanner.ts",
          "parser.ts",
          "utilities.ts",
          "binder.ts",
          "checker.ts",
          "emitter.ts",
          "program.ts",
          "commandLineParser.ts",
          "tsc.ts",
          "diagnosticInformationMap.generated.ts"
      ]
  }
  ```

* Using the `"include"` and `"exclude"` properties

  ```json
  {
      "compilerOptions": {
          "module": "system",
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

## Details

The `"compilerOptions"` property can be omitted, in which case the compiler's defaults are used. See our full list of supported [Compiler Options](./Compiler Options.md).

The `"files"` property takes a list of relative or absolute file paths.
The `"include"` and `"exclude"` properties take a list of glob-like file patterns.
The supported glob wildcards are:

* `*` matches zero or more characters (excluding directory separators)
* `?` matches any one character (excluding directory separators)
* `**/` recursively matches any subdirectory

If a segment of a glob pattern includes only `*` or `.*`, then only files with supported extensions are included (e.g. `.ts`, `.tsx`, and `.d.ts` by default with `.js` and `.jsx` if `allowJs` is set to true).

If the `"files"` and `"include"` are both left unspecified, the compiler defaults to including all TypeScript (`.ts`, `.d.ts` and `.tsx`) files in the containing directory and subdirectories except those excluded using the `"exclude"` property. JS files (`.js` and `.jsx`) are also included if `allowJs` is set to true.
If the `"files"` or `"include"` properties are specified, the compiler will instead include the union of the files included by those two properties.
Files in the directory specified using the `"outDir"` compiler option are excluded as long as `"exclude"` property is not specified.

Files included using `"include"` can be filtered using the `"exclude"` property.
However, files included explicitly using the `"files"` property are always included regardless of `"exclude"`.
The `"exclude"` property defaults to excluding the `node_modules`, `bower_components`, `jspm_packages` and `<outDir>` directories when not specified.

Any files that are referenced by files included via the `"files"` or `"include"` properties are also included.
Similarly, if a file `B.ts` is referenced by another file `A.ts`, then `B.ts` cannot be excluded unless the referencing file `A.ts` is also specified in the `"exclude"` list.

Please note that the compiler does not include files that can be possible outputs; e.g. if the input includes `index.ts`, then `index.d.ts` and `index.js` are excluded.
In general, having files that differ only in extension next to each other is not recommended.

A `tsconfig.json` file is permitted to be completely empty, which compiles all files included by default (as described above) with the default compiler options.

Compiler options specified on the command line override those specified in the `tsconfig.json` file.

## `@types`, `typeRoots` and `types`

By default all *visible* "`@types`" packages are included in your compilation.
Packages in `node_modules/@types` of any enclosing folder are considered *visible*;
specifically, that means packages within `./node_modules/@types/`,  `../node_modules/@types/`, `../../node_modules/@types/`, and so on.

If `typeRoots` is specified, *only* packages under `typeRoots` will be included.
For example:

```json
{
   "compilerOptions": {
       "typeRoots" : ["./typings"]
   }
}
```

This config file will include *all* packages under `./typings`, and no packages from `./node_modules/@types`.

If `types` is specified, only packages listed will be included.
For instance:

```json
{
   "compilerOptions": {
       "types" : ["node", "lodash", "express"]
   }
}
```

This `tsconfig.json` file will *only* include  `./node_modules/@types/node`, `./node_modules/@types/lodash` and `./node_modules/@types/express`.
Other packages under `node_modules/@types/*` will not be included.

A types package is a folder with a file called `index.d.ts` or a folder with a `package.json` that has a `types` field.

Specify `"types": []` to disable automatic inclusion of `@types` packages.

Keep in mind that automatic inclusion is only important if you're using files with global declarations (as opposed to files declared as modules).
If you use an `import "foo"` statement, for instance, TypeScript may still look through `node_modules` & `node_modules/@types` folders to find the `foo` package.

## Configuration inheritance with `extends`

A `tsconfig.json` file can inherit configurations from another file using the `extends` property.

The `extends` is a top-level property in `tsconfig.json` (alongside `compilerOptions`, `files`, `include`, and `exclude`).
`extends`' value is a string containing a path to another configuration file to inherit from.

The configuration from the base file are loaded first, then overridden by those  in the inheriting config file.
If a circularity is encountered, we report an error.

`files`, `include` and `exclude` from the inheriting config file *overwrite* those from the base config file.

All relative paths found in the configuration file will be resolved relative to the configuration file they originated in.

For example:

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

## `compileOnSave`

Setting a top-level property `compileOnSave` signals to the IDE to generate all files for a given tsconfig.json upon saving.

```json
{
   "compileOnSave": true,
   "compilerOptions": {
       "noImplicitAny" : true
   }
}
```

This feature is currently supported in Visual Studio 2015 with TypeScript 1.8.4 and above, and [atom-typescript](https://github.com/TypeStrong/atom-typescript#compile-on-save) plugin.

## Schema

Schema can be found at: [http://json.schemastore.org/tsconfig](http://json.schemastore.org/tsconfig)
