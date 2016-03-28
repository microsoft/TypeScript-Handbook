## Compiler Options

Option (Shorthand)                             | Default / Type                               | Description
-----------------------------------------------|:--------------------------------------------:|----------------------------------------------------------------------
`--allowJs`                                    | `true`<br/> <br/>`<bool>`                    | Allow JavaScript files to be compiled.
`--allowNonTsExtensions`                       | `true`<br/> <br/>`<bool>`                    | Allow files with file extensions other than ".ts" to be compiled.
`--allowSyntheticDefaultImports`               | `(module === "system")`<br/> <br/>`<bool>`   | Allow default imports from modules with no default export. This does not affect code emit, just typechecking.
`--allowUnreachableCode`                       | `true`<br/> <br/>`<bool>`                    | Do not report errors on unreachable code.
`--allowUnusedLabels`                          | `true`<br/> <br/>`<bool>`                    | Do not report errors on unused labels.
`--charset`                                    | `"utf8"`<br/> <br/>`<string>`                | The character set of the input files.
`--declaration`<br/>`-d`                       | `false`<br/> <br/>`<bool>`                   | Generates corresponding '.d.ts' file.
`--diagnostics`                                | `false`<br/> <br/>`<bool>`                   | Show diagnostic information.
`--emitBOM`                                    | `false`<br/> <br/>`<bool>`                   | Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
`--emitDecoratorMetadata`<sup>[1]</sup>        | `false`<br/> <br/>`<bool>`                   | Emit design-type metadata for decorated declarations in source. See [issue #2577](https://github.com/Microsoft/TypeScript/issues/2577) for details.
`--experimentalDecorators`                     | `false`<br/> <br/>`<bool>`                   | Enables experimental support for ES7 decorators.
`--forceConsistentCasingInFileNames`           | `false`<br/> <br/>`<bool>`                   | Disallow inconsistently-cased references to the same file.
`--help`<br/>`-h`                              |                                              | Print help message.
`--inlineSourceMap`                            | `false`<br/> <br/>`<bool>`                   | Emit a single file with source maps instead of having a separate file.
`--inlineSources`                              | `false`<br/> <br/>`<bool>`                   | Emit the source alongside the sourcemaps within a single file; requires `--inlineSourceMap` or `--sourceMap` to be set.
`--isolatedModules`                            | `false`<br/> <br/>`<bool>`                   | Unconditionally emit imports for unresolved files.
`--jsx`                                        | `"Preserve"`<br/> <br/>`<JsxEmit>`           | Support JSX in '.tsx' files: 'React' or 'Preserve'. See [JSX](./JSX.md).
`--listFiles`                                  | `false`<br/> <br/>`<bool>`                   | Print names of files part of the compilation.
`--locale`                                     | *(platform specific)*<br/>`<string>`         | The locale to use to show error messages, e.g. en-us.
`--mapRoot`                                    | `null`<br/> <br/>`<string>`                  | Specifies the location where debugger should locate map files instead of generated locations. Use this flag if the .map files will be located at run-time in a different location than than the .js files. The location specified will be embedded in the sourceMap to direct the debugger where the map files where be located.
`--module`<br/>`-m`                            | `(target === "ES6" ? "ES6" : "CommonJS")`<br/> <br/>`<ModuleKind>` | Specify module code generation: 'commonjs', 'amd', 'system', 'umd', or 'es2015'. Only 'amd' and 'system' can be used in conjunction with `--outFile`. The 'es2015' value may not be used when targeting ES5 or lower.
`--moduleResolution`                           | `"Classic"`<br/> <br/>`<ModuleResolutionKind>` | Determine how modules get resolved. Either 'node' for Node.js/io.js style resolution, or 'classic' (default).
`--newLine`                                    | *(platform specific)*<br/>`<string>`         | Use the specified end of line sequence to be used when emitting files: 'CRLF' (dos) or 'LF' (unix)."
`--noEmit`                                     | `false`<br/> <br/>`<bool>`                   | Do not emit outputs.
`--noEmitHelpers`                              | `false`<br/> <br/>`<bool>`                   | Do not generate custom helper functions like `__extends` in compiled output.
`--noEmitOnError`                              | `false`<br/> <br/>`<bool>`                   | Do not emit outputs if any errors were reported.
`--noErrorTruncation`                          | `false`<br/> <br/>`<bool>`                   | Do not emit outputs if any errors were reported.
`--noFallthroughCasesInSwitch`                 | `false`<br/> <br/>`<bool>`                   | Report errors for fallthrough cases in switch statement.
`--noImplicitAny`                              | `false`<br/> <br/>`<bool>`                   | Raise error on expressions and declarations with an implied 'any' type.
`--noImplicitReturns`                          | `false`<br/> <br/>`<bool>`                   | Report error when not all code paths in function return a value.
`--noImplicitUseStrict`                        | `false`<br/> <br/>`<bool>`                   | Do not emit `"use strict"` directives in module output.
`--noLib`                                      | `false`<br/> <br/>`<bool>`                   | Do not include the default library file (lib.d.ts).
`--noResolve`                                  | `false`<br/> <br/>`<bool>`                   | Do not add triple-slash references or module import targets to the list of compiled files.
~~`--out`~~                                    |                                              | DEPRECATED. Use `--outFile` instead.
`--outDir`                                     | `null`<br/> <br/>`<string>`                  | Redirect output structure to the directory.
`--outFile`                                    | `null`<br/> <br/>`<string>`                  | Concatenate and emit output to single file. The order of concatenation is determined by the list of files passed to the compiler on the command line along with triple-slash references and imports. See output file order documentation for more details.
`--preserveConstEnums`                         | `false`<br/> <br/>`<bool>`                   | Do not erase const enum declarations in generated code. See [const enums documentation](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#94-constant-enum-declarations) for more details.
`--pretty`<sup>[1]</sup>                       | `false`<br/> <br/>`<bool>`                   | Stylize errors and messages using color and context.
`--project`<br/>`-p`                           | `"."`<br/> <br/>`<string>`                   | Compile the project in the given directory. The directory needs to contain a `tsconfig.json` file to direct compilation. See [tsconfig.json](./tsconfig.json.md) documentation for more details.
`--reactNamespace`                             | `"react"`<br/> <br/>`<string>`               | Specifies the object invoked for `createElement` and `__spread` when targeting 'react' JSX emit.
`--removeComments`                             | `false`<br/> <br/>`<bool>`                   | Remove all comments except copy-right header comments beginning with `/*!`
`--rootDir`                                    | `"."`<br/> <br/>`<string>`                   | Specifies the root directory of input files. Only use to control the output directory structure with `--outDir`.
`--skipDefaultLibCheck`                        | `false`<br/> <br/>`<bool>`                   | Don't check a user-defined default lib file's valitidy.
`--sourceMap`                                  | `false`<br/> <br/>`<bool>`                   | Generates corresponding '.map' file.
`--sourceRoot`                                 | `null`<br/> <br/>`<string>`                  | Specifies the location where debugger should locate TypeScript files instead of source locations. Use this flag if the sources will be located at run-time in a different location than that at design-time. The location specified will be embedded in the sourceMap to direct the debugger where the source files where be located.
`--strictNullChecks`                           | `false`<br/> <br/>`<bool>`                   | In strict null checking mode, the `null` and `undefined` values are not in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
`--stripInternal`<sup>[1]</sup>                | `false`<br/> <br/>`<bool>`                   | Do not emit declarations for code that has an `/** @internal */` JSDoc annotation.
`--suppressExcessPropertyErrors`<sup>[1]</sup> | `false`<br/> <br/>`<bool>`                   | Suppress excess property checks for object literals.
`--suppressImplicitAnyIndexErrors`             | `false`<br/> <br/>`<bool>`                   | Suppress `--noImplicitAny` errors for indexing objects lacking index signatures. See [issue #1232](https://github.com/Microsoft/TypeScript/issues/1232#issuecomment-64510362) for more details.
`--target`<br/>`-t`                            | `"ES5"`<br/> <br/>`<ScriptTarget>`           | Specify ECMAScript target version: 'ES3' (default), 'ES5', or 'ES6'<sup>[1]</sup>
`--traceModuleResolution`                      | `false`<br/> <br/>`<bool>`                   | Report module resolution log messages.
`--version`<br/>`-v`                           |                                              | Print the compiler's version.
`--watch`<br/>`-w`                             |                                              | Run the compiler in watch mode. Watch input files and trigger recompilation on changes.

<sup>[1]</sup> These options are experimental.

## Related

* Setting compiler options in [`tsconfig.json`](./tsconfig.json.md) files.
* Setting compiler options in [MSBuild projects](./Compiler Options in MSBuild.md).
