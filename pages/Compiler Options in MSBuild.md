## Overview

Compiler options can be specified using MSBuild properties within an MSBuild project.

## Example

```XML
  <PropertyGroup Condition="'$(Configuration)' == 'Debug'">
    <TypeScriptRemoveComments>false</TypeScriptRemoveComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <TypeScriptRemoveComments>true</TypeScriptRemoveComments>
    <TypeScriptSourceMap>false</TypeScriptSourceMap>
  </PropertyGroup>
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets')" />
```

## Mappings

Compiler Option                              | MSBuild Property Name                      | Allowed Values
---------------------------------------------|--------------------------------------------|-----------------
`--declaration`                              | TypeScriptGeneratesDeclarations            | boolean
`--module`                                   | TypeScriptModuleKind                       | `AMD`, `CommonJs`, `UMD`, or `System`
`--target`                                   | TypeScriptTarget                           | `ES3`, `ES5`, or `ES6`
`--charset`                                  | TypeScriptCharset                          |
`--emitBOM`                                  | TypeScriptEmitBOM                          | boolean
`--emitDecoratorMetadata`                    | TypeScriptEmitDecoratorMetadata            | boolean
`--experimentalDecorators`                   | TypeScriptExperimentalDecorators           | boolean
`--inlineSourceMap`                          | TypeScriptInlineSourceMap                  | boolean
`--inlineSources`                            | TypeScriptInlineSources                    | boolean
`--locale`                                   | *automatic*                                | Automatically set to PreferredUILang value
`--mapRoot`                                  | TypeScriptMapRoot                          | File path
`--newLine`                                  | TypeScriptNewLine                          | `CRLF` or `LF`
`--noEmitOnError`                            | TypeScriptNoEmitOnError                    | boolean
`--noEmitHelpers`                            | TypeScriptNoEmitHelpers                    | boolean
`--noImplicitAny`                            | TypeScriptNoImplicitAny                    | boolean
`--noLib`                                    | TypeScriptNoLib                            | boolean
`--noResolve`                                | TypeScriptNoResolve                        | boolean
`--out`                                      | TypeScriptOutFile                          | File path
`--outDir`                                   | TypeScriptOutDir                           | File path
`--preserveConstEnums`                       | TypeScriptPreserveConstEnums               | boolean
`--removeComments`                           | TypeScriptRemoveComments                   | boolean
`--rootDir`                                  | TypeScriptRootDir                          | File path
`--isolatedModules`                          | TypeScriptIsolatedModules                  | boolean
`--sourceMap`                                | TypeScriptSourceMap                        | File path
`--sourceRoot`                               | TypeScriptSourceRoot                       | File path
`--suppressImplicitAnyIndexErrors`           | TypeScriptSuppressImplicitAnyIndexErrors   | boolean
`--suppressExcessPropertyErrors`             |  TypeScriptSuppressExcessPropertyErrors    | boolean
`--moduleResolution`                         | TypeScriptModuleResolution                 | `Classic` or `Node`
`--experimentalAsyncFunctions`               | TypeScriptExperimentalAsyncFunctions       | boolean
`--jsx`                                      | TypeScriptJSXEmit                          | `React` or `Preserve`
`--reactNamespace`                           | TypeScriptReactNamespace                   | string
`--skipDefaultLibCheck`                      | TypeScriptSkipDefaultLibCheck              | boolean
`--allowUnusedLabels`                        | TypeScriptAllowUnusedLabels                | boolean
`--noImplicitReturns`                        | TypeScriptNoImplicitReturns                | boolean
`--noFallthroughCasesInSwitch`               | TypeScriptNoFallthroughCasesInSwitch       | boolean
`--allowUnreachableCode`                     | TypeScriptAllowUnreachableCode             | boolean
`--forceConsistentCasingInFileNames`         | TypeScriptForceConsistentCasingInFileNames | boolean
`--allowSyntheticDefaultImports`             | TypeScriptAllowSyntheticDefaultImports     | boolean
`--noImplicitUseStrict`                      | TypeScriptNoImplicitUseStrict              | boolean
`--project`                                  | *Not supported in VS*                      |
`--watch`                                    | *Not supported in VS*                      |
`--diagnostics`                              | *Not supported in VS*                      |
`--listFiles`                                | *Not supported in VS*                      |
`--noEmit`                                   | *Not supported in VS*                      |
`--allowJs`                                  | *Not supported in VS*                      |
*VS only option*                             | TypeScriptAdditionalFlags                  | *Any compiler option*

## What is supported in my version of Visual Studio?

Look in your `C:\Program Files (x86)\MSBuild\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets` file.
The authoritative mappings between MSBuild XML tags and `tsc` compiler options live in there.

## ToolsVersion

The value of `<TypeScriptToolsVersion>1.7</TypeScriptToolsVersion>` property in the project file identifies the compiler version to use to build (1.7 in this example).
This allows a project to build against the save versions of the compiler on different machines.

If `TypeScriptToolsVersion` is not specified, the latest compiler version installed on the machine will be used to build.

Users using newer versions of TS, will see a prompt to upgrade their project on first load.

## TypeScriptCompileBlocked

If you are using a different build tool to build your project (e.g. gulp, grunt , etc.) and VS for the development and debugging experience, set `<TypeScriptCompileBlocked>true</TypeScriptCompileBlocked>` in your project.
This should give you all the editing support, but not the build when you hit F5.