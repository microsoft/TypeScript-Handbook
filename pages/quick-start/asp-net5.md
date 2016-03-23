# ASP.NET 5

## Install ASP.NET 5 and TypeScript

First, [install ASP.NET 5](https://get.asp.net) if you need it.
This quick-start guide uses Visual Studio, which means that you'll need Visual Studio 2015 in order to use ASP.NET 5.

Next, if your version of Visual Studio does not already have TypeScript, you can install it for [Visual Studio 2015](http://www.microsoft.com/en-us/download/details.aspx?id=48593).

## Create a new project

1. Choose File
2. Choose New Project (Ctrl + Shift + N)
3. Choose Visual C#
4. Choose ASP.NET Web Application

    ![Create new ASP.NET project](new-asp-project.png)

5. Choose ASP.NET 5 Empty

    I unchecked "Host in the cloud" since this will be a local demo.
    ![Use empty template](new-asp-project-empty.png)

Run the application and make sure that it works.

## Set up the server

In `project.json` add another entry in `"dependencies"`:

```json
"Microsoft.AspNet.StaticFiles": "1.0.0-rc1-final"
```

The resulting dependencies should look like this:

```json
  "dependencies": {
    "Microsoft.AspNet.IISPlatformHandler": "1.0.0-rc1-final",
    "Microsoft.AspNet.Server.Kestrel": "1.0.0-rc1-final",
    "Microsoft.AspNet.StaticFiles": "1.0.0-rc1-final"
  },
```

Replace the body of `Configure` in `Startup.cs` with

```cs
public void Configure(IApplicationBuilder app)
{
    app.UseIISPlatformHandler();
    app.UseDefaultFiles();
    app.UseStaticFiles();
}
```

# Add TypeScript

The next step is to add a folder for TypeScript.

![Create new folder](new-folder.png)

We'll just call it scripts.

![scripts folder](scripts-folder.png)

## Add TypeScript code

Right click on `scripts` and click New Item.
Then choose TypeScript File (it may be in the .NET Core section) and name the file `app.ts`.

![New item](new-item.png)

## Add example code

Type the following code into app.ts.

```ts
function sayHello() {
    const compiler = (document.getElementById("compiler") as HTMLInputElement).value;
    const framework = (document.getElementById("framework") as HTMLInputElement).value;
    return `Hello from ${compiler} and ${framework}!`;
}
```

## Set up the build

### Configure the TypeScript compiler

First we need to tell TypeScript how to build.
Right click on the scripts folder and click New Item.
Then choose TypeScript Configuration File and use the default name `tsconfig.json`.

![Create tsconfig.json](new-tsconfig.png)

Replace the default `tsconfig.json` with the following:

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "noEmitOnError": true,
    "removeComments": false,
    "sourceMap": true,
    "target": "es5",
  },
  "files": [
    "./app.ts"
  ],
  "compileOnSave": true
}
```

This is similar to the default, with the following differences:

1. It sets `"noImplicitAny": true`.
2. It explicitly lists `"files"` instead of relying on `"excludes"`.
3. It sets `"compileOnSave": true`.

`"noImplicitAny"` is good idea whenever you're writing new code -- you can make sure that you don't write any untyped code by mistake.
`"compileOnSave"` makes it easy to update your code in a running web app.

### Set up NPM

Now we need to set up NPM so we can download Javascript packages.
Right click on the project and click New Item.
Then choose NPM Configuration File and use the default name `package.json`.
Inside `"devDependencies"` add "gulp" and "del":

```json
"devDependencies": {
  "gulp": "3.9.0",
  "del": "2.2.0"
}
```

Visual Studio may start installing gulp and del as soon as you save the file.
If not, right-click package.json and then "Restore Packages".

### Set up gulp

Finally, add a new JavaScript file named gulpfile.js.
Put the following code inside:

```js
/// <binding AfterBuild='default' Clean='clean' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var del = require('del');

var paths = {
    scripts: ['scripts/**/*.js', 'scripts/**/*.ts', 'scripts/**/*.map'],
};

gulp.task('clean', function () {
    return del(['wwwroot/scripts/**/*']);
});

gulp.task('default', function () {
    gulp.src(paths.scripts).pipe(gulp.dest('wwwroot/scripts'))
});
```

The first line tells Visual Studio to run the task 'default' after the build finishes.
(It also runs the task 'clean' when you ask Visual Studio to clean the build.)

## Write an HTML page

Add a New Item named `index.html` inside `wwwroot`.
Use the following code for `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="scripts/app.js"></script>
    <title></title>
</head>
<body>
    <div id="message"></div>
    <div>
        Compiler: <input id="compiler" value="TypeScript" onkeyup="document.getElementById('message').innerText = sayHello()" /><br />
        Framework: <input id="framework" value="ASP.NET" onkeyup="document.getElementById('message').innerText = sayHello()" />
    </div>
</body>
</html>
```

## Test

1. Run the project.
2. You should see a message when you type in the input boxes:

![Picture of running demo](running-demo.png)

## Debug

1. In Edge, press F12 and click the Debugger tab.
2. Look in the first localhost folder, then src/app.ts
3. Put a breakpoint on the line with `return`.
4. Type in the boxes and confirm that the breakpoint hits in TypeScript code and that inspection works correctly.

![Demo paused on breakpoint](paused-demo.png)

That's all you need to know to include basic TypeScript in your ASP.NET project.
Next we'll include Angular and write a simple Angular app.

# Add Angular 2

TODO: Done to here

## Download packages from NPM

1. Install [PackageInstaller](https://github.com/madskristensen/PackageInstaller).

2. Use PackageInstaller to install Angular 2, systemjs and Typings.

    ![Use PackageInstaller to install angular2](packageinstaller-angular2.png)
    ![Use PackageInstaller to install systemjs](packageinstaller-systemjs.png)
    ![Use PackageInstaller to install Typings](packageinstaller-typings.png)

3. Use PackageInstaller to install typings for es6-shim.

    Angular 2 includes es6-shim for Promise support, but TypeScript still needs the types.
    In PackageInstaller, choose Typing instead of npm.
    Then type "es6-shim":

    ![Use PackageInstaller to install es6-shim typings](packageinstaller-es6-shim.png)

## Update tsconfig.json

Now that Angular 2 and its dependencies are installed, we need to enable TypeScript's experimental support for decorators and include the es6-shim typings.
In the future decorators and ES6 will be the default and these settings will not be needed.
Add `"experimentalDecorators": true, "emitDecoratorMetadata": true` to the `"compilerOptions"` section, and add `"./typings/main.d.ts"` to the `"files"` section.
Finally, we need to add a new entry in `"files"` for another file, `"./src/model.ts"`, that we will create.
The tsconfig should now look like this:

```json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "noEmitOnError": true,
    "removeComments": false,
    "sourceMap": true,
    "target": "es5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./Scripts/App"
  },
  "files": [
    "./src/app.ts",
    "./src/model.ts",
    "./typings/main.d.ts"
  ]
}
```

## Add a CopyFiles target to the build

Finally, we need to make sure that the Angular files are copied as part of the build.
To do this, edit the project by right-clicking 'Unload' and then 'Edit csproj'.
After the TypeScript configuration PropertyGroup, add a new ItemGroup and Target to copy the angular files.

```xml
<ItemGroup>
  <NodeLib Include="$(MSBuildProjectDirectory)\node_modules\angular2\bundles\angular2.js"/>
  <NodeLib Include="$(MSBuildProjectDirectory)\node_modules\angular2\bundles\angular2-polyfills.js"/>
  <NodeLib Include="$(MSBuildProjectDirectory)\node_modules\systemjs\dist\system.src.js"/>
  <NodeLib Include="$(MSBuildProjectDirectory)\node_modules\rxjs\bundles\Rx.js"/>
</ItemGroup>
<Target Name="CopyFiles" BeforeTargets="Build">
  <Copy SourceFiles="@(NodeLib)" DestinationFolder="$(MSBuildProjectDirectory)\Scripts"/>
</Target>
```

Now right-click on the project and reload it.
You should now see node_modules in the Solution Explorer.

## Write a simple Angular app in TypeScript

First, change the code in `app.ts` to:

```ts
import {Component} from "angular2/core"
import {bootstrap} from "angular2/platform/browser"
import {MyModel} from "./model"

@Component({
    selector: `my-app`,
    template: `<div>Hello from {{getCompiler()}}</div>`
})
class MyApp {
    model = new MyModel();
    getCompiler() {
        return this.model.compiler;
    }
}

bootstrap(MyApp);
```

Then add another TypeScript file in `src` named `model.ts`:

```ts
export class MyModel {
    compiler = "TypeScript";
}
```

Finally, change the code in `Views/Home/Index.cshtml` to the following:

```html
@{
    ViewBag.Title = "Home Page";
}
<script src="~/Scripts/angular2-polyfills.js"></script>
<script src="~/Scripts/system.src.js"></script>
<script src="~/Scripts/rx.js"></script>
<script src="~/Scripts/angular2.js"></script>
<script>
    System.config({
        packages: {
            '/Scripts/App': {
                format: 'cjs',
                defaultExtension: 'js'
            }
        }
    });
    System.import('/Scripts/App/app').then(null, console.error.bind(console));
</script>
<my-app>Loading...</my-app>
```

This loads the app.
When you run the ASP.NET application you should see a div that says "Loading..." and then updates to say "Hello from TypeScript".
