## Compiler Options

Option                                         | Shorthand | Type                     | Default                 | Description
-----------------------------------------------|-----------|--------------------------|-------------------------|----------------------------------------------------------------------
`--allowJs`                                    |           | `<bool>`                 | `true`                  | Allow JavaScript files to be compiled.
`--allowNonTsExtensions`                       |           | `<bool>`                 | `true`                  | Allow files with file extensions other than ".ts" to be compiled.
`--allowSyntheticDefaultImports`               |           | `<bool>`                 | `(module === "system")` | Allow default imports from modules with no default export. This does not affect code emit, just typechecking.
`--allowUnreachableCode`                       |           | `<bool>`                 | `true`                  | Do not report errors on unreachable code.
`--allowUnusedLabels`                          |           | `<bool>`                 | `true`                  | Do not report errors on unused labels.
`--charset`                                    |           | `<string>`               | `"utf8"`                | The character set of the input files.
`--declaration`                                | `-d`      | `<bool>`                 | `false`                 | Generates corresponding '.d.ts' file.
`--diagnostics`                                |           | `<bool>`                 | `false`                 | Show diagnostic information.
`--emitBOM`                                    |           | `<bool>`                 | `false`                 | Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
`--emitDecoratorMetadata`<sup>[1]</sup>        |           | `<bool>`                 | `false`                 | Emit design-type metadata for decorated declarations in source. See [issue #2577](https://github.com/Microsoft/TypeScript/issues/2577) for details.
`--experimentalDecorators`                     |           | `<bool>`                 | `false`                 | Enables experimental support for ES7 decorators.
`--forceConsistentCasingInFileNames`           |           | `<bool>`                 | `false`                 | Disallow inconsistently-cased references to the same file.
`--help`                                       | `-h`      |                          |                         | Print help message.
`--inlineSourceMap`                            |           | `<bool>`                 | `false`                 | Emit a single file with source maps instead of having a separate file.
`--inlineSources`                              |           | `<bool>`                 | `false`                 | Emit the source alongside the sourcemaps within a single file; requires `--inlineSourceMap` or `--sourceMap` to be set.
`--isolatedModules`                            |           | `<bool>`                 | `false`                 | Unconditionally emit imports for unresolved files.
`--jsx`                                        |           | `<JsxEmit>`              | `"Preserve"`            | Support JSX in '.tsx' files: 'React' or 'Preserve'. See [JSX](./JSX.md).
`--listFiles`                                  |           | `<bool>`                 | `false`                 | Print names of files part of the compilation.
`--locale`                                     |           | `<string>`               |                         | The locale to use to show error messages, e.g. en-us.
`--mapRoot`                                    |           | `<string>`               | `null`                  | Specifies the location where debugger should locate map files instead of generated locations. Use this flag if the .map files will be located at run-time in a different location than than the .js files. The location specified will be embedded in the sourceMap to direct the debugger where the map files where be located.
`--module`                                     | `-m`      | `<ModuleKind>`           | `(target === "ES6" ? "ES6" : "CommonJS"`) | Specify module code generation: 'commonjs', 'amd', 'system', 'umd', or 'es2015'. Only 'amd' and 'system' can be used in conjunction with `--outFile`. The 'es2015' value may not be used when targeting ES5 or lower.
`--moduleResolution`                           |           | `<ModuleResolutionKind>` | `"Classic"`             | Determine how modules get resolved. Either 'node' for Node.js/io.js style resolution, or 'classic' (default).
`--newLine`                                    |           | `<string>`               | *(platform specific)*   | Use the specified end of line sequence to be used when emitting files: 'CRLF' (dos) or 'LF' (unix)."
`--noEmit`                                     |           | `<bool>`                 | `false`                 | Do not emit outputs.
`--noEmitHelpers`                              |           | `<bool>`                 | `false`                 | Do not generate custom helper functions like `__extends` in compiled output.
`--noEmitOnError`                              |           | `<bool>`                 | `false`                 | Do not emit outputs if any errors were reported.
`--noErrorTruncation`                          |           | `<bool>`                 | `false`                 | Do not emit outputs if any errors were reported.
`--noFallthroughCasesInSwitch`                 |           | `<bool>`                 | `false`                 | Report errors for fallthrough cases in switch statement.
`--noImplicitAny`                              |           | `<bool>`                 | `false`                 | Raise error on expressions and declarations with an implied 'any' type.
`--noImplicitReturns`                          |           | `<bool>`                 | `false`                 | Report error when not all code paths in function return a value.
`--noImplicitUseStrict`                        |           | `<bool>`                 | `false`                 | Do not emit `"use strict"` directives in module output.
`--noLib`                                      |           | `<bool>`                 | `false`                 | Do not include the default library file (lib.d.ts).
`--noResolve`                                  |           | `<bool>`                 | `false`                 | Do not add triple-slash references or module import targets to the list of compiled files.
~~`--out`~~                                    |           |                          |                         | DEPRECATED. Use `--outFile` instead.
`--outDir`                                     |           | `<string>`               | `null`                  | Redirect output structure to the directory.
`--outFile`                                    |           | `<string>`               | `null`                  | Concatenate and emit output to single file. The order of concatenation is determined by the list of files passed to the compiler on the command line along with triple-slash references and imports. See output file order documentation for more details.
`--preserveConstEnums`                         |           | `<bool>`                 | `false`                 | Do not erase const enum declarations in generated code. See [const enums documentation](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#94-constant-enum-declarations) for more details.
`--pretty`<sup>[1]</sup>                       |           | `<bool>`                 | `false`                 | Stylize errors and messages using color and context.
`--project`                                    | `-p`      | `<string>`               | `"."`                   | Compile the project in the given directory. The directory needs to contain a `tsconfig.json` file to direct compilation. See [tsconfig.json](./tsconfig.json.md) documentation for more details.
`--reactNamespace`                             |           | `<string>`               | `"react"`               | Specifies the object invoked for `createElement` and `__spread` when targeting 'react' JSX emit.
`--removeComments`                             |           | `<bool>`                 | `false`                 | Remove all comments except copy-right header comments beginning with `/*!`
`--rootDir`                                    |           | `<string>`               | `"."`                   | Specifies the root directory of input files. Only use to control the output directory structure with `--outDir`.
`--skipDefaultLibCheck`                        |           | `<bool>`                 | `false`                 | Don't check a user-defined default lib file's valitidy.
`--sourceMap`                                  |           | `<bool>`                 | `false`                 | Generates corresponding '.map' file.
`--sourceRoot`                                 |           | `<string>`               | `null`                  | Specifies the location where debugger should locate TypeScript files instead of source locations. Use this flag if the sources will be located at run-time in a different location than that at design-time. The location specified will be embedded in the sourceMap to direct the debugger where the source files where be located.
`--strictNullChecks`                           |           | `<bool>`                 | `false`                 | In strict null checking mode, the `null` and `undefined` values are not in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
`--stripInternal`<sup>[1]</sup>                |           | `<bool>`                 | `false`                 | Do not emit declarations for code that has an `/** @internal */` JSDoc annotation.
`--suppressExcessPropertyErrors`<sup>[1]</sup> |           | `<bool>`                 | `false`                 | Suppress excess property checks for object literals.
`--suppressImplicitAnyIndexErrors`             |           | `<bool>`                 | `false`                 | Suppress `--noImplicitAny` errors for indexing objects lacking index signatures. See [issue #1232](https://github.com/Microsoft/TypeScript/issues/1232#issuecomment-64510362) for more details.
`--target`                                     | `-t`      | `<ScriptTarget>`         | `"ES5"`                 | Specify ECMAScript target version: 'ES3' (default), 'ES5', or 'ES6'<sup>[1]</sup>
`--traceModuleResolution`                      |           | `<bool>`                 | `false`                 | Report module resolution log messages.
`--version`                                    | `-v`      |                          |                         | Print the compiler's version.
`--watch`                                      | `-w`      |                          |                         | Run the compiler in watch mode. Watch input files and trigger recompilation on changes.

<sup>[1]</sup> These options are experimental.

## Related

* Setting compiler options in [`tsconfig.json`](./tsconfig.json.md) files.
* Setting compiler options in [MSBuild projects](./Compiler Options in MSBuild.md).
