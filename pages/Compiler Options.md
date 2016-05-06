## Compiler Options

Option                                         | Type      | Default                        | Description
-----------------------------------------------|-----------|--------------------------------|----------------------------------------------------------------------
`--allowJs`                                    | `boolean` | `true`                         | Allow JavaScript files to be compiled.
`--allowSyntheticDefaultImports`               | `boolean` | `(module === "system")`        | Allow default imports from modules with no default export. This does not affect code emit, just typechecking.
`--allowUnreachableCode`                       | `boolean` | `false`                         | Do not report errors on unreachable code.
`--allowUnusedLabels`                          | `boolean` | `false`                        | Do not report errors on unused labels.
`--charset`                                    | `string`  | `"utf8"`                       | The character set of the input files.
`--declaration`<br/>`-d`                       | `boolean` | `false`                        | Generates corresponding '.d.ts' file.
`--diagnostics`                                | `boolean` | `false`                        | Show diagnostic information.
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
`--listFiles`                                  | `boolean` | `false`                        | Print names of files part of the compilation.
`--locale`                                     | `string`  | *(platform specific)*          | The locale to use to show error messages, e.g. en-us.
`--mapRoot`                                    | `string`  | `null`                         | Specifies the location where debugger should locate map files instead of generated locations. Use this flag if the .map files will be located at run-time in a different location than than the .js files. The location specified will be embedded in the sourceMap to direct the debugger where the map files where be located.
`--module`<br/>`-m`                            | `string`  | `(target === "ES6" ? "ES6" : "CommonJS")`   | Specify module code generation: `'none'`, `'commonjs'`, `'amd'`, `'system'`, `'umd'`, `'es6'`, or `'es2015'`.<br/>► Only `'amd'` and `'system'` can be used in conjunction with `--outFile`.<br/>► `'es6'` and `'es2015'` values may not be used when targeting ES5 or lower.
`--moduleResolution`                           | `string`  | `"Classic"`                    | Determine how modules get resolved. Either `'node'` for Node.js/io.js style resolution, or `'classic'` (default). See [Module Resolution documentation](Module Resolution.md) for more details.
`--newLine`                                    | `string`  | *(platform specific)*          | Use the specified end of line sequence to be used when emitting files: `'crlf'` (windows) or `'lf'` (unix)."
`--noEmit`                                     | `boolean` | `false`                        | Do not emit outputs.
`--noEmitHelpers`                              | `boolean` | `false`                        | Do not generate custom helper functions like `__extends` in compiled output.
`--noEmitOnError`                              | `boolean` | `false`                        | Do not emit outputs if any errors were reported.
`--noFallthroughCasesInSwitch`                 | `boolean` | `false`                        | Report errors for fallthrough cases in switch statement.
`--noImplicitAny`                              | `boolean` | `false`                        | Raise error on expressions and declarations with an implied 'any' type.
`--noImplicitReturns`                          | `boolean` | `false`                        | Report error when not all code paths in function return a value.
`--noImplicitUseStrict`                        | `boolean` | `false`                        | Do not emit `"use strict"` directives in module output.
`--noLib`                                      | `boolean` | `false`                        | Do not include the default library file (lib.d.ts).
`--noResolve`                                  | `boolean` | `false`                        | Do not add triple-slash references or module import targets to the list of compiled files.
~~`--out`~~                                    | `string`  | `null`                         | DEPRECATED. Use `--outFile` instead.
`--outDir`                                     | `string`  | `null`                         | Redirect output structure to the directory.
`--outFile`                                    | `string`  | `null`                         | Concatenate and emit output to single file. The order of concatenation is determined by the list of files passed to the compiler on the command line along with triple-slash references and imports. See output file order documentation for more details.
`--preserveConstEnums`                         | `boolean` | `false`                        | Do not erase const enum declarations in generated code. See [const enums documentation](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#94-constant-enum-declarations) for more details.
`--pretty`<sup>[1]</sup>                       | `boolean` | `false`                        | Stylize errors and messages using color and context.
`--project`<br/>`-p`                           | `string`  | `null`                         | Compile a project given a valid configuration file.<br/>The argument can be an file path to a valid JSON configuration file, or a directory path to a directory containing a `tsconfig.json` file.<br/>See [tsconfig.json](./tsconfig.json.md) documentation for more details.
`--reactNamespace`                             | `string`  | `"React"`                      | Specifies the object invoked for `createElement` and `__spread` when targeting 'react' JSX emit.
`--removeComments`                             | `boolean` | `false`                        | Remove all comments except copy-right header comments beginning with `/*!`
`--rootDir`                                    | `string`  | *(common root directory is computed from the list of input files)*   | Specifies the root directory of input files. Only use to control the output directory structure with `--outDir`.
`--skipDefaultLibCheck`                        | `boolean` | `false`                        | Don't check a user-defined default lib file's valitidy.
`--sourceMap`                                  | `boolean` | `false`                        | Generates corresponding '.map' file.
`--sourceRoot`                                 | `string`  | `null`                         | Specifies the location where debugger should locate TypeScript files instead of source locations. Use this flag if the sources will be located at run-time in a different location than that at design-time. The location specified will be embedded in the sourceMap to direct the debugger where the source files where be located.
`--strictNullChecks`                           | `boolean` | `false`                        | In strict null checking mode, the `null` and `undefined` values are not in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
`--stripInternal`<sup>[1]</sup>                | `boolean` | `false`                        | Do not emit declarations for code that has an `/** @internal */` JSDoc annotation.
`--suppressExcessPropertyErrors`               | `boolean` | `false`                        | Suppress excess property checks for object literals.
`--suppressImplicitAnyIndexErrors`             | `boolean` | `false`                        | Suppress `--noImplicitAny` errors for indexing objects lacking index signatures. See [issue #1232](https://github.com/Microsoft/TypeScript/issues/1232#issuecomment-64510362) for more details.
`--target`<br/>`-t`                            | `string`  | `"ES5"`                        | Specify ECMAScript target version: `'es3'` (default), `'es5'`, or `'es6'`.
`--traceResolution`                            | `boolean` | `false`                        | Report module resolution log messages.
`--version`<br/>`-v`                           |           |                                | Print the compiler's version.
`--watch`<br/>`-w`                             |           |                                | Run the compiler in watch mode. Watch input files and trigger recompilation on changes.

<sup>[1]</sup> These options are experimental.

## Related

* Setting compiler options in [`tsconfig.json`](./tsconfig.json.md) files.
* Setting compiler options in [MSBuild projects](./Compiler Options in MSBuild.md).
