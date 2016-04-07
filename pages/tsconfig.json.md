## Overview

The presence of a `tsconfig.json` file in a directory indicates that the directory is the root of a TypeScript project.
The `tsconfig.json` file specifies the root files and the compiler options required to compile the project.
A project is compiled in one of the following ways:

## Using tsconfig.json

* By invoking tsc with no input files, in which case the compiler searches for the `tsconfig.json` file starting in the current directory and continuing up the parent directory chain.
* By invoking tsc with no input files and a `--project` (or just `-p`) command line option that specifies the path of a directory containing a `tsconfig.json` file.

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
          "outFile": "../../built/local/tsc.js",
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

* Using the `"exclude"` property

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
      "exclude": [
          "node_modules",
          "wwwroot"
      ]
  }
  ```

## Details

The `"compilerOptions"` property can be omitted, in which case the compiler's defaults are used. See our full list of supported [Compiler Options](./Compiler Options.md).

If no `"files"` property is present in a `tsconfig.json`, the compiler defaults to including all TypeScript (`*.ts` or `*.tsx`) files in the containing directory and subdirectories.
When a `"files"` property is present, only the specified files are included.

If the `"exclude"` property is specified, the compiler includes all TypeScript (`*.ts` or `*.tsx`) files in the containing directory and subdirectories except for those files or folders that are excluded.

The `"files"` property cannot be used in conjunction with the `"exclude"` property. If both are specified then the `"files"` property takes precedence.

Any files that are referenced by those specified in the `"files"` property are also included.
Similarly, if a file `B.ts` is referenced by another file `A.ts`, then `B.ts` cannot be excluded unless the referencing file `A.ts` is also specified in the `"exclude"` list.

A `tsconfig.json` file is permitted to be completely empty, which compiles all files in the containing directory and subdirectories with the default compiler options.

Compiler options specified on the command line override those specified in the `tsconfig.json` file.

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

This feature is currently supported in Visual Studio 2015 with TypeScript 1.8.4 and above, and [atom-typescript](https://github.com/TypeStrong/atom-typescript/blob/master/docs/tsconfig.md#compileonsave) plugin.

## Schema

Schema can be found at: [http://json.schemastore.org/tsconfig](http://json.schemastore.org/tsconfig)
