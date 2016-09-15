## Compiler Options

Option                                         | Type      | Default                        | Description
-----------------------------------------------|-----------|--------------------------------|----------------------------------------------------------------------
`--allowJs`                                    | `boolean` | `true`                         | Allow JavaScript files to be compiled.
`--allowSyntheticDefaultImports`               | `boolean` | `module === "system"`          | Allow default imports from modules with no default export. This does not affect code emit, just typechecking.
`--allowUnreachableCode`                       | `boolean` | `false`                        | Do not report errors on unreachable code.
`--allowUnusedLabels`                          | `boolean` | `false`                        | Do not report errors on unused labels.
`--baseUrl`                                    | `string`  |                                | Base directory to resolve non-relative module names. See [Module Resolution documentation](./Module Resolution.md#base-url) for more details.
`--charset`                                    | `string`  | `"utf8"`                       | The character set of the input files.
`--declaration`<br/>`-d`                       | `boolean` | `false`                        | Generates corresponding '.d.ts' file.
`--declarationDir`                             | `string`  |                                | Output directory for generated declaration files.
`--diagnostics`                                | `boolean` | `false`                        | Show diagnostic information.
`--disableSizeLimit`                           | `boolean` | `false`                        | Disable size limitation on JavaScript project.
`--emitBOM`                                    | `boolean` | `false`                        | Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
`--emitDecoratorMetadata`<sup>[1]</sup>        | `boolean` | `false`                        | Emit design-type metadata for decorated declarations in source. See [issue #2577](https://github.com/Microsoft/TypeScript/issues/2577) for details.
`--experimentalDecorators`<sup>[1]</sup>       | `boolean` | `false`                        | Enables experimental support for ES7 decorators.
`--forceConsistentCasingInFileNames`           | `boolean` | `false`                        | Disallow inconsistently-cased references to the same file.
`--help`<br/>`-h`                              |           |                                | Print help message.
`--inlineSourceMap`                            | `boolean` | `false`                        | Emit a single file with source maps instead of having a separate file.
`--inlineSources`                              | `boolean` | `false`                        | Emit the source alongside the sourcemaps within a single file; requires `--inlineSourceMap` or `--sourceMap` to be set.
`--init`                                       |           |                                | Initializes a TypeScript project and creates a `tsconfig.json` file.
`--isolatedModules`                            | `boolean` | `false`                        | Unconditionally emit imports for unresolved files.
`--jsx`                                        | `string`  | `"Preserve"`                   | Support JSX in '.tsx' files: `'React'` or `'Preserve'`. See [JSX](./JSX.md).
`--lib`                                        | `string[]`|                                | List of library files to be included in the compilation.</br>Possible values are:  <br/>► `es5` <br/>► `es6` <br/>► `es2015` <br/>► `es7` <br/>► `es2016` <br/>► `es2017` `dom` `webworker` `scripthost` <br/>► `es2015.core` <br/>► `es2015.collection` <br/>► `es2015.generator` <br/>► `es2015.iterable` <br/>► `es2015.promise` <br/>► `es2015.proxy` <br/>► `es2015.reflect` <br/>► `es2015.symbol` <br/>► `es2015.symbol.wellknown` <br/>► `es2016.array.include` <br/>► `es2017.object` <br/>► `es2017.sharedmemory`
`--listEmittedFiles`                           | `boolean` | `false`                        | Print names of generated files part of the compilation.
`--listFiles`                                  | `boolean` | `false`                        | Print names of files part of the compilation.
`--locale`                                     | `string`  | *(platform specific)*          | The locale to use to show error messages, e.g. en-us.
`--mapRoot`                                    | `string`  |                                | Specifies the location where debugger should locate map files instead of generated locations. Use this flag if the .map files will be located at run-time in a different location than the .js files. The location specified will be embedded in the sourceMap to direct the debugger where the map files will be located.
`--module`<br/>`-m`                            | `string`  | `target === 'ES6' ? 'ES6' : 'commonjs'`   | Specify module code generation: `'none'`, `'commonjs'`, `'amd'`, `'system'`, `'umd'`, `'es6'`, or `'es2015'`.<br/>► Only `'amd'` and `'system'` can be used in conjunction with `--outFile`.<br/>► `'es6'` and `'es2015'` values may not be used when targeting ES5 or lower.
`--moduleResolution`                           | `string`  | `module === 'amd' | 'system' | 'ES6' ?  'classic' : 'node'`                    | Determine how modules get resolved. Either `'node'` for Node.js/io.js style resolution, or `'classic'`. See [Module Resolution documentation](./Module Resolution.md) for more details.
`--newLine`                                    | `string`  | *(platform specific)*          | Use the specified end of line sequence to be used when emitting files: `'crlf'` (windows) or `'lf'` (unix)."
`--noEmit`                                     | `boolean` | `false`                        | Do not emit outputs.
`--noEmitHelpers`                              | `boolean` | `false`                        | Do not generate custom helper functions like `__extends` in compiled output.
`--noEmitOnError`                              | `boolean` | `false`                        | Do not emit outputs if any errors were reported.
`--noFallthroughCasesInSwitch`                 | `boolean` | `false`                        | Report errors for fallthrough cases in switch statement.
`--noImplicitAny`                              | `boolean` | `false`                        | Raise error on expressions and declarations with an implied 'any' type.
`--noImplicitReturns`                          | `boolean` | `false`                        | Report error when not all code paths in function return a value.
`--noImplicitThis`                             | `boolean` | `false`                        | Raise error on `this` expressions with an implied 'any' type.
`--noImplicitUseStrict`                        | `boolean` | `false`                        | Do not emit `"use strict"` directives in module output.
`--noLib`                                      | `boolean` | `false`                        | Do not include the default library file (lib.d.ts).
`--noResolve`                                  | `boolean` | `false`                        | Do not add triple-slash references or module import targets to the list of compiled files.
`--noUnusedLocals`                             | `boolean` | `false`                        | Report errors on unused locals.
`--noUnusedParameters`                         | `boolean` | `false`                        | Report errors on unused parameters.
~~`--out`~~                                    | `string`  |                                | DEPRECATED. Use `--outFile` instead.
`--outDir`                                     | `string`  |                                | Redirect output structure to the directory.
`--outFile`                                    | `string`  |                                | Concatenate and emit output to single file. The order of concatenation is determined by the list of files passed to the compiler on the command line along with triple-slash references and imports. See output file order documentation for more details.
`paths`<sup>[2]</sup>                          | `Object`  |                                | List of path mapping entries for module names to locations relative to the `baseUrl`. See [Module Resolution documentation](./Module Resolution.md#path-mapping) for more details.
`--preserveConstEnums`                         | `boolean` | `false`                        | Do not erase const enum declarations in generated code. See [const enums documentation](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#94-constant-enum-declarations) for more details.
`--pretty`<sup>[1]</sup>                       | `boolean` | `false`                        | Stylize errors and messages using color and context.
`--project`<br/>`-p`                           | `string`  |                                | Compile a project given a valid configuration file.<br/>The argument can be an file path to a valid JSON configuration file, or a directory path to a directory containing a `tsconfig.json` file.<br/>See [tsconfig.json](./tsconfig.json.md) documentation for more details.
`--reactNamespace`                             | `string`  | `"React"`                      | Specifies the object invoked for `createElement` and `__spread` when targeting 'react' JSX emit.
`--removeComments`                             | `boolean` | `false`                        | Remove all comments except copy-right header comments beginning with `/*!`
`--rootDir`                                    | `string`  | *(common root directory is computed from the list of input files)*   | Specifies the root directory of input files. Only use to control the output directory structure with `--outDir`.
`rootDirs`<sup>[2]</sup>                       | `string[]`|                                | List of <i>root</i> folders whose combined content represent the structure of the project at runtime. See [Module Resolution documentation](./Module Resolution.md#virtual-directories-with-rootdirs) for more details.
`--skipLibCheck`                               | `boolean` | `false`                        | Don't check a the default library (`lib.d.ts`) file's validity.
`--skipDefaultLibCheck`                        | `boolean` | `false`                        | Don't check a user-defined default library (`*.d.ts`) file's validity.
`--sourceMap`                                  | `boolean` | `false`                        | Generates corresponding '.map' file.
`--sourceRoot`                                 | `string`  |                                | Specifies the location where debugger should locate TypeScript files instead of source locations. Use this flag if the sources will be located at run-time in a different location than that at design-time. The location specified will be embedded in the sourceMap to direct the debugger where the source files will be located.
`--strictNullChecks`                           | `boolean` | `false`                        | In strict null checking mode, the `null` and `undefined` values are not in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
`--stripInternal`<sup>[1]</sup>                | `boolean` | `false`                        | Do not emit declarations for code that has an `/** @internal */` JSDoc annotation.
`--suppressExcessPropertyErrors`               | `boolean` | `false`                        | Suppress excess property checks for object literals.
`--suppressImplicitAnyIndexErrors`             | `boolean` | `false`                        | Suppress `--noImplicitAny` errors for indexing objects lacking index signatures. See [issue #1232](https://github.com/Microsoft/TypeScript/issues/1232#issuecomment-64510362) for more details.
`--target`<br/>`-t`                            | `string`  | `"ES3"`                        | Specify ECMAScript target version: `'es3'` (default), `'es5'`, or `'es6'`.
`--traceResolution`                            | `boolean` | `false`                        | Report module resolution log messages.
`--types`                                      | `string[]`|                                | List of names of type definitions to include.
`--typeRoots`                                  | `string[]`|                                | List of folders to include type definitions from.
`--version`<br/>`-v`                           |           |                                | Print the compiler's version.
`--watch`<br/>`-w`                             |           |                                | Run the compiler in watch mode. Watch input files and trigger recompilation on changes.

* <sup>[1]</sup> These options are experimental.
* <sup>[2]</sup> These options are only allowed in `tsconfig.json`, and not through command-line switches.

## Related

* Setting compiler options in [`tsconfig.json`](./tsconfig.json.md) files.
* Setting compiler options in [MSBuild projects](./Compiler Options in MSBuild.md).
