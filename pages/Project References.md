# Introduction

Project references, introduced in TypeScript 3.0, allow you to structure your TypeScript programs into smaller pieces. By doing this, you can greatly improve build times, enforce logical separation between components, and organize your code in new and better ways.

A new mode for for the command-line compiler, `tsc --build`, works with project references to orchestrate builds when working with multi-project solutions. You can also use existing build tools like `gulp` or `webpack` with project references.

## Project References

We refer to each `tsconfig.json` file as a "project". A project reference simply says "This project *depends on* this other project".

You specify these references in a new top-level property in `tsconfig.json`, `references`. It's an array of objects that specifies projects to reference:
```json5
{
    "compilerOptions": {
        // The usual
    },
    "references": [
        { "path": "../src" }
    ]
}
```

The `path` property of each reference can point to a directory containing a `tsconfig.json` file, or to the config file itself (which may have any name). This is the same convention used for running `tsc -p` / `tsc --project`.

When you reference a project, new things happen:
 * Importing modules from a referenced project will instead load its *output* declaration file (`.d.ts`)
 * If the referenced project produces an `outFile`, the output file `.d.ts` file's declarations will be visible in this project
 * Build mode (see later on this page) will automatically build referenced projects if needed

By separating into multiple projects, you can greatly improve the speed of typechecking and compiling, reduce memory usage when using an editor, and improve enforcement of the logical groupings of your program.

## An Example Project

Let's look at a fairly normal program and see how project references can help us better organize it.
Imagine you have a project with two modules, `converter` and `units`, and a corresponding test file for each:
```
/src/converter.ts
/src/units.ts
/test/converter-tests.ts
/test/units-tests.ts
/tsconfig.json
```

The test files import the implementation files and do some testing:
```
// converter-tests.ts
import * as converter from "../converter";

assert.areEqual(converter.celsiusToFahrenheit(0), 32);
```

Previously, this structure was rather awkward to work with if you used a single tsconfig file:
 * It was possible for the implementation files to import the test files
 * It wasn't possible to build `test` and `src` at the same time without having `src` appear in the output folder name, which you probably don't want
 * Changing just the *internals* in the implementation files required *typechecking* the tests again, even though this wouldn't ever cause new errors
 * Changing just the tests required typechecking the implementation again, even if nothing changed

You could use multiple tsconfig files to solve *some* of those problems, but new ones would appear:
 * There's no built-in up-to-date checking, so you end up always running `tsc` twice
 * Invoking `tsc` twice incurs more startup time overhead
 * `tsc -w` can't run on multiple config files at once
 * You'd either have to symlink folders together, or have a suboptimal output file layout

Project references can solve all of these problems and more.

To set up this project, we'd add two new `tsconfig.json` files - one in `src` and one in `test`, and add reference from `test` to `src`.

## Project References and Build Speed

One of the main reasons to use project references is to improve build speed. It's important to understand how this happens and be aware of the implications.

When loading types from a referenced project, types always come from the generated `.d.ts` file instead of an implementation (`.ts`) file. This is much faster because all type inference has already taken place, there's no need to check for errors in statements or expressions, and the amount of memory and disk I/O needed is also lower. However, this means that the referenced project does need to be built before the referencing project can understand its own types. If you open a multi-project solution in an editor, you may see a large number of errors caused by this until the referenced projects get built. We're working on a behind-the-scenes .d.ts generation process that should be able to mitigate this, but for now we recommend informing developers that they should build after cloning.

Because `.d.ts` files themselves don't *generate* new `.d.ts` files, you'll want to write any hand-authored types in a `.ts` file instead of a `.d.ts` file, even if you don't intend to include any executable statements in the file.

Finally, due to how previous versions of TypeScript calculated the structure of the output folder, you'll need to turn on a new flag called `composite` that changes a small number of behaviors in order to allow TypeScript to much more quickly compute which files need to be examined in order to build a project.

## `composite`

Referenced projects must have the new `composite` setting enabled.
This setting is needed to ensure TypeScript can quickly determine where to find the outputs of the referenced project.
Enabling the `composite` flag changes a few things:
 * The `rootDir` setting, if not explicitly set, defaults to the directory containing the `tsconfig` file.
 * All implementation files must be matched by an `include` pattern or listed in the `files` array. If this constraint is violated, `tsc` will inform you which files weren't specified.
 * `declaration` defaults to `true`

These changes won't affect many projects in a substantial way. We recommend turning on `composite` in most projects, even if they're not using project references yet.

# More Options for Project References

## `declarationMaps`

We've also added support for [declaration source maps](https://github.com/Microsoft/TypeScript/issues/14479). If you enable `--declarationMap`, you'll be able to use editor features like "Go to Definition" and Rename to transparently navigate and edit code across project boundaries in supported editors.

## `prepend` with `outFile`

You can also enable prepending the output of a dependency using the `prepend` option in a reference:
```
   "references": [
       { "path": "../utils", "prepend": true }
   ]
```

Prepending a project will include the project's output above the output of the current project.
This works for both `.js` files and `.d.ts` files, and source map files will also be emitted correctly.

`tsc` will only ever use existing files on disk to do this process, so it's possible to create a project where a correct output file can't be generated because some project's output would be present more than once in the resulting file.
For example:
```
   A
  ^ ^ 
 /   \
B     C
 ^   ^
  \ /
   D
```
It's important in this situation to not prepend at each reference, because you'll end up with two copies of `A` in the output of `D` - this can lead to unexpected results.

# Build Mode for TypeScript

A long-awaited feature is smart incremental builds for TypeScript projects. In 3.0 you can use the `--build` flag with `tsc`. This is effectively a new entry point for `tsc` that behaves more like a build orchestrator than a simple compiler. `--build` changes the meaning of other flags, so it must be the first argument to `tsc` if it's being used.

Running `tsc --build` (`tsc -b` for short) will do the following:
 * Find all referenced projects 
 * Detect if they are up-to-date
 * Build out-of-date projects in the correct order

You can provide `tsc -b` with multiple config file paths (e.g. `tsc -b src test`).
Just like `tsc -p`, specifying the config file name itself is unnecessary if it's named `tsconfig.json`.

`tsc -b` is not intended to be a replacement for any existing build orchestrator you might be using, such as `gulp` or `webpack`. If you're using one of those tools, we recommend you continue to do so -- `tsc -b` is intended to be used for multi-project solutions which would have otherwise used `tsc` by itself.

## `tsc -b` Commandline

You can specify any number of config files:
```
 > tsc -b                                # Build the tsconfig.json in the current directory
 > tsc -b src                            # Build src/tsconfig.json
 > tsc -b foo/release.tsconfig.json bar  # Build foo/release.tsconfig.json and bar/tsconfig.json
```

Don't worry about ordering the files you pass on the commandline - `tsc` will re-order them if needed so that dependencies are always built first.

There are also some flags specific to `tsc -b`:
 * `--verbose`: Prints out verbose logging to explain what's going on (may be combined with any other flag)
 * `--dry`: Shows what would be done but doesn't actually build anything
 * `--clean`: Deletes the outputs of the specified projects (may be combined with `--dry`)
 * `--force`: Act as if all projects are out of date
 * `--watch`: Watch mode (may not be combined with any flag except `--verbose`)

## Caveats

Normally, `tsc` will produce outputs (`.js` and `.d.ts`) in the presence of syntax or type errors, unless `noEmitOnError` is on. Doing this in an incremental build system would be very bad - if one of your out-of-date dependencies had a new error, you'd only see it *once* because a subsequent build would skip building the now up-to-date project. For this reason, `tsc -b` effectively acts as if `noEmitOnError` is enabled for all all projects.

If you check in any build outputs (`.js`, `.d.ts`, `.d.ts.map`, etc.), you may need to run a `--force` build after certain source control operations depending on whether your source control tool preserves timestmaps between the local copy and the remote copy.

## msbuild

If you have an msbuild project, you can turn enable build mode by adding
```
    <TypeScriptBuildMode>true</TypeScriptBuildMode>
```
to your proj file. This will enable automatic incremental build as well as cleaning.

Note that as with `tsconfig.json` / `-p`, existing TypeScript project properties will not be respected - all settings should be managed using your tsconfig file.

Some teams have set up msbuild-based workflows wherein tsconfig files have the same *implicit* graph ordering as the managed projects they are paired with.
If your solution is like this, you can continue to use `msbuild` with `tsc -p` along with project references; these are fully interoperable.

# Guidance for Project References

## Overall Structure

With more `tsconfig.json` files, you'll usually want to use [Configuration file inheritance](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) to centralize your common compiler options. This way you can change a setting in one file rather than having to edit multiple files.

One good setup would look like this:
```
/src/tsconfig.settings.json
/src/proj1/tsconfig.json
/src/proj2/tsconfig.json
/src/tsconfig.json
```

 * In `/src/tsconfig.settings.json`, write out a `compilerOptions` block that specifies common settings to share between your projects. For example, you might turn on `noImplicitAny` or `strict` in this file. You can override these settings on a per-project basis, so this is simply a "defaults" file for your projects
 * In `/src/projN/tsconfig.json` files, write `"extends": "../tsconfig.settings"`, then specify any overriding `compilerOptions`, specify `references`, and an `include` pattern or `files` list if the default include pattern is not sufficient
 * In `/src/tsconfig.json`, specify empty `files` and `includes` arrays, and add `reference`s to each of the `projN` folders. This allows you to run `tsc -b src` to cause a build of all projects, and allows future editor features to find projects to check for rename locations.

You can see these pattern in the TypeScript repo - see `src/tsconfig_base.json`, `src/tsconfig.json`, and `src/tsc/tsconfig.json` as key examples.

## Structuring for relative modules

In general, not much is needed to transition a repo using relative modules. Simply place a `tsconfig.json` file in each subdirectory of a given parent folder, and add `reference`s to these config files to match the intended layering of the program. You will need to either set the `outDir` to an explicit subfolder of the output folder, or set the `rootDir` to the common root of all project folders.

## Structuring for outFiles

Layout for compilations using `outFile` is more flexible because relative paths don't matter as much. One thing to keep in mind is that you'll generally want to not use `prepend` until the "last" project - this will improve build times and reduce the amount of I/O needed in any given build. The TypeScript repo itself is a good reference here - we have some "library" projects and some "endpoint" projects; "endpoint" projects are kept as small as possible and pull in only the libraries they need.

## Structuring for monorepos

Using project references with monorepo management tools like `lerna` is straightforward - simply add references according to the dependencies of your code. This should generally mirror the dependencies listed in your `package.json`s. Lerna's symlinking will do the rest!

You can see the example repo https://github.com/RyanCavanaugh/learn-a for a cloneable example with a walkthrough file showing how to accomplish various tasks.
