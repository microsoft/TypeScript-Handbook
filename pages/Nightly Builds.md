A nightly build from the [TypeScript's `master`](https://github.com/Microsoft/TypeScript/tree/master) branch is published by midnight PST to NPM and NuGet.
Here is how you can get it and use it with your tools.

## Using npm

```shell
npm install -g typescript@next
```

## Using NuGet with MSBuild

> Note: You'll need to configure your project to use the NuGet packages.
Please see [Configuring MSBuild projects to use NuGet](https://github.com/Microsoft/TypeScript/wiki/Configuring-MSBuild-projects-to-use-NuGet) for more information.

The nightlies are available on [www.myget.org](https://www.myget.org/gallery/typescript-preview).

There are two packages:

* `Microsoft.TypeScript.Compiler`: Tools only (`tsc.exe`, `lib.d.ts`, etc.) .
* `Microsoft.TypeScript.MSBuild`: Tools as above, as well as MSBuild tasks and targets (`Microsoft.TypeScript.targets`, `Microsoft.TypeScript.Default.props`, etc.)

## Updating your IDE to use the nightly builds

You can also update your IDE to use the nightly drop.
First you will need to install the package through npm.
You can either install the npm package globally or to a local `node_modules` folder.

The rest of this section assumes `typescript@next` is already installed.

### Visual Studio Code

Update `.vscode/settings.json` with the following:

```json
"typescript.tsdk": "<path to your folder>/node_modules/typescript/lib"
```

More information is available at [VSCode documentation](https://code.visualstudio.com/Docs/languages/typescript#_using-newer-typescript-versions).

### Sublime Text

Update the `Settings - User` file with the following:

```json
"typescript_tsdk": "<path to your folder>/node_modules/typescript/lib"
```

More information is available at the [TypeScript Plugin for Sublime Text installation documentation](https://github.com/Microsoft/TypeScript-Sublime-Plugin#installation).

### Visual Studio 2013 and 2015

> Note: Most changes do not require you to install a new version of the VS TypeScript plugin.

The nightly build currently does not include the full plugin setup, but we are working on publishing an installer on a nightly basis as well.

1. Download the [VSDevMode.ps1](https://github.com/Microsoft/TypeScript/blob/master/scripts/VSDevMode.ps1) script.

   > Also see our wiki page on [using a custom language service file](https://github.com/Microsoft/TypeScript/wiki/Dev-Mode-in-Visual-Studio#using-a-custom-language-service-file).

2. From a PowerShell command window, run:

  For VS 2015:
  ```posh
  VSDevMode.ps1 14 -tsScript <path to your folder>/node_modules/typescript/lib
  ```

  For VS 2013:

  ```posh
  VSDevMode.ps1 12 -tsScript <path to your folder>/node_modules/typescript/lib
  ```
