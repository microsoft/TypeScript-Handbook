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
  <Import Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets"
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
`--moduleResolution`                         | TypeScriptModuleResolution                 | `Classic` or `NodeJs`
`--jsx`                                      | TypeScriptJSXEmit                          | `React` or `Preserve`
`--project`                                  | *Not supported in VS*                      |
`--watch`                                    | *Not supported in VS*                      |
`--diagnostics`                              | *Not supported in VS*                      |
`--listFiles`                                | *Not supported in VS*                      |
`--noEmit`                                   | *Not supported in VS*                      |
*VS only option*                             | TypeScriptAdditionalFlags                  | *Any compiler option*

## What is supported in my version of Visual Studio

Look in your `C:\Program Files (x86)\MSBuild\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets` file.
The authoritative mappings between MSBuild XML tags and `tsc` compiler options live in there.
