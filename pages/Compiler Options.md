## Compiler Options

Option (Shorthand)                             | Default / Type                                               | Description
-----------------------------------------------|:------------------------------------------------------------:|----------------------------------------------------------------------
`--allowJs`                                    | Default: `true`<br/> <br/> Type: `boolean`                   | Allow JavaScript files to be compiled.
`--allowNonTsExtensions`                       | Default: `true`<br/> <br/> Type: `boolean`                   | Allow files with file extensions other than ".ts" to be compiled.
`--allowSyntheticDefaultImports`               | Default:<br/>`(module === "system")`<br/> <br/> Type: `boolean`  | Allow default imports from modules with no default export. This does not affect code emit, just typechecking.
`--allowUnreachableCode`                       | Default: `true`<br/> <br/> Type: `boolean`                   | Do not report errors on unreachable code.
`--allowUnusedLabels`                          | Default: `true`<br/> <br/> Type: `boolean`                   | Do not report errors on unused labels.
`--charset`                                    | Default: `"utf8"`<br/> <br/> Type: `string`                  | The character set of the input files.
`--declaration`<br/>`-d`                       | Default: `false`<br/> <br/> Type: `boolean`                  | Generates corresponding '.d.ts' file.
`--diagnostics`                                | Default: `false`<br/> <br/> Type: `boolean`                  | Show diagnostic information.
`--emitBOM`                                    | Default: `false`<br/> <br/> Type: `boolean`                  | Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
`--emitDecoratorMetadata`<sup>[1]</sup>        | Default: `false`<br/> <br/> Type: `boolean`                  | Emit design-type metadata for decorated declarations in source. See [issue #2577](https://github.com/Microsoft/TypeScript/issues/2577) for details.
`--experimentalDecorators`                     | Default: `false`<br/> <br/> Type: `boolean`                  | Enables experimental support for ES7 decorators.
`--forceConsistentCasingInFileNames`           | Default: `false`<br/> <br/> Type: `boolean`                  | Disallow inconsistently-cased references to the same file.
`--help`<br/>`-h`                              |                                                              | Print help message.
`--inlineSourceMap`                            | Default: `false`<br/> <br/> Type: `boolean`                  | Emit a single file with source maps instead of having a separate file.
`--inlineSources`                              | Default: `false`<br/> <br/> Type: `boolean`                  | Emit the source alongside the sourcemaps within a single file; requires `--inlineSourceMap` or `--sourceMap` to be set.
`--isolatedModules`                            | Default: `false`<br/> <br/> Type: `boolean`                  | Unconditionally emit imports for unresolved files.
`--jsx`                                        | Default: `"Preserve"`<br/> <br/> Type: `JsxEmit`             | Support JSX in '.tsx' files: 'React' or 'Preserve'. See [JSX](./JSX.md).
`--listFiles`                                  | Default: `false`<br/> <br/> Type: `boolean`                  | Print names of files part of the compilation.
`--locale`                                     | Default:<br/>*(platform specific)*<br/> <br/> Type: `string`     | The locale to use to show error messages, e.g. en-us.
`--mapRoot`                                    | Default: `null`<br/> <br/> Type: `string`                    | Specifies the location where debugger should locate map files instead of generated locations. Use this flag if the .map files will be located at run-time in a different location than than the .js files. The location specified will be embedded in the sourceMap to direct the debugger where the map files where be located.
`--module`<br/>`-m`                            | Default:<br/>`(target === "ES6" ? "ES6" : "CommonJS")`<br/> <br/> Type: `ModuleKind` | Specify module code generation: 'commonjs', 'amd', 'system', 'umd', or 'es2015'. Only 'amd' and 'system' can be used in conjunction with `--outFile`. The 'es2015' value may not be used when targeting ES5 or lower.
`--moduleResolution`                           | Default: `"Classic"`<br/> <br/> Type: `ModuleResolutionKind` | Determine how modules get resolved. Either 'node' for Node.js/io.js style resolution, or 'classic' (default). See [Module Resolution documentation](Module%20Resolution.md) for more details.
`--newLine`                                    | Default:<br/>*(platform specific)*<br/> <br/> Type: `NewLineKind`     | Use the specified end of line sequence to be used when emitting files: 'CarriageReturnLineFeed' (windows) or 'LineFeed' (unix)."
`--noEmit`                                     | Default: `false`<br/> <br/> Type: `boolean`                  | Do not emit outputs.
`--noEmitHelpers`                              | Default: `false`<br/> <br/> Type: `boolean`                  | Do not generate custom helper functions like `__extends` in compiled output.
`--noEmitOnError`                              | Default: `false`<br/> <br/> Type: `boolean`                  | Do not emit outputs if any errors were reported.
`--noErrorTruncation`                          | Default: `false`<br/> <br/> Type: `boolean`                  | Do not emit outputs if any errors were reported.
`--noFallthroughCasesInSwitch`                 | Default: `false`<br/> <br/> Type: `boolean`                  | Report errors for fallthrough cases in switch statement.
`--noImplicitAny`                              | Default: `false`<br/> <br/> Type: `boolean`                  | Raise error on expressions and declarations with an implied 'any' type.
`--noImplicitReturns`                          | Default: `false`<br/> <br/> Type: `boolean`                  | Report error when not all code paths in function return a value.
`--noImplicitUseStrict`                        | Default: `false`<br/> <br/> Type: `boolean`                  | Do not emit `"use strict"` directives in module output.
`--noLib`                                      | Default: `false`<br/> <br/> Type: `boolean`                  | Do not include the default library file (lib.d.ts).
`--noResolve`                                  | Default: `false`<br/> <br/> Type: `boolean`                  | Do not add triple-slash references or module import targets to the list of compiled files.
~~`--out`~~                                    | Default: `null`<br/> <br/> Type: `string`                    | DEPRECATED. Use `--outFile` instead.
`--outDir`                                     | Default: `null`<br/> <br/> Type: `string`                    | Redirect output structure to the directory.
`--outFile`                                    | Default: `null`<br/> <br/> Type: `string`                    | Concatenate and emit output to single file. The order of concatenation is determined by the list of files passed to the compiler on the command line along with triple-slash references and imports. See output file order documentation for more details.
`--preserveConstEnums`                         | Default: `false`<br/> <br/> Type: `boolean`                  | Do not erase const enum declarations in generated code. See [const enums documentation](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#94-constant-enum-declarations) for more details.
`--pretty`<sup>[1]</sup>                       | Default: `false`<br/> <br/> Type: `boolean`                  | Stylize errors and messages using color and context.
`--project`<br/>`-p`                           | Default: `null`<br/> <br/> Type: `string`                     | Compile the project in the given directory. The directory needs to contain a `tsconfig.json` file to direct compilation. See [tsconfig.json](./tsconfig.json.md) documentation for more details.
`--reactNamespace`                             | Default: `"react"`<br/> <br/> Type: `string`                 | Specifies the object invoked for `createElement` and `__spread` when targeting 'react' JSX emit.
`--removeComments`                             | Default: `false`<br/> <br/> Type: `boolean`                  | Remove all comments except copy-right header comments beginning with `/*!`
`--rootDir`                                    | Default:<br/>*(common root directory is computed from the list of input files)*<br/> <br/> Type: `string`  | Specifies the root directory of input files. Only use to control the output directory structure with `--outDir`.
`--skipDefaultLibCheck`                        | Default: `false`<br/> <br/> Type: `boolean`                  | Don't check a user-defined default lib file's valitidy.
`--sourceMap`                                  | Default: `false`<br/> <br/> Type: `boolean`                  | Generates corresponding '.map' file.
`--sourceRoot`                                 | Default: `null`<br/> <br/> Type: `string`                    | Specifies the location where debugger should locate TypeScript files instead of source locations. Use this flag if the sources will be located at run-time in a different location than that at design-time. The location specified will be embedded in the sourceMap to direct the debugger where the source files where be located.
`--strictNullChecks`                           | Default: `false`<br/> <br/> Type: `boolean`                  | In strict null checking mode, the `null` and `undefined` values are not in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
`--stripInternal`<sup>[1]</sup>                | Default: `false`<br/> <br/> Type: `boolean`                  | Do not emit declarations for code that has an `/** @internal */` JSDoc annotation.
`--suppressExcessPropertyErrors`               | Default: `false`<br/> <br/> Type: `boolean`                  | Suppress excess property checks for object literals.
`--suppressImplicitAnyIndexErrors`             | Default: `false`<br/> <br/> Type: `boolean`                  | Suppress `--noImplicitAny` errors for indexing objects lacking index signatures. See [issue #1232](https://github.com/Microsoft/TypeScript/issues/1232#issuecomment-64510362) for more details.
`--target`<br/>`-t`                            | Default: `"ES5"`<br/> <br/> Type: `ScriptTarget`             | Specify ECMAScript target version: 'ES3' (default), 'ES5', or 'ES6'<sup>[1]</sup>
`--traceModuleResolution`                      | Default: `false`<br/> <br/> Type: `boolean`                  | Report module resolution log messages.
`--version`<br/>`-v`                           |                                                              | Print the compiler's version.
`--watch`<br/>`-w`                             |                                                              | Run the compiler in watch mode. Watch input files and trigger recompilation on changes.

<sup>[1]</sup> These options are experimental.

## Related

* Setting compiler options in [`tsconfig.json`](./tsconfig.json.md) files.
* Setting compiler options in [MSBuild projects](./Compiler Options in MSBuild.md).
