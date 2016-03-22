# ASP.NET 4

## Install TypeScript

If your version of Visual Studio does not already have TypeScript, you can install it for [Visual Studio 2015](http://www.microsoft.com/en-us/download/details.aspx?id=48593) or [Visual Studio 2013](https://www.microsoft.com/en-us/download/details.aspx?id=48739).
This quickstart uses Visual Studio 2015.

## Create a new project

1. Choose File
2. Choose New Project (Ctrl + Shift + N)
3. Choose Visual C#
4. Choose ASP.NET Web Application

    ![Create new ASP.NET project](new-asp-project.png)

5. Choose MVC
    I unchecked "Host in the cloud" since this will be a local demo.
    ![Use MVC template](new-asp-project-template.png)

Run the application and make sure that it works.

# ASP.NET 4 with TypeScript

The next step is to add a folder for TypeScript.

![Create new folder](new-folder.png)

We'll just call it src.

![src folder](src-folder.png)

## Add TypeScript code

Right click on src and click New Item.
Then choose TypeScript File and name the file app.ts.

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

Right-click on the project node and click Properties.
Then choose the TypeScript Build tab.
Check "Redirect JavaScript output to directory" and give the value: `./Scripts/App`.

![Redirect JavaScript Output in Project Properties](redirect-javascript-output.png)

## Call the script from a view

1. In the Solution Explorer, open Views | Shared | _Layout.cshtml.

    ![Open _Layout.cshtml](open-layout.png)

2. Inside the `<head>` element, add the line:

    ```html
    @Scripts.Render("~/Scripts/App/app.js");
    ```

3. In the Solution Explorer, open Views | Home | Index.cshtml.

    ![Open Index.cshtml](open-index.png)

4. At the top, add the following code after the `@{ ... }`:

```html
<div id="message"></div>
<div>
    Compiler: <input id="compiler" value="TypeScript" onkeyup="document.getElementById('message').innerText = sayHello()" /><br />
    Framework: <input id="framework" value="ASP.NET" onkeyup="document.getElementById('message').innerText = sayHello()" />
</div>
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

# ASP.NET 4 with TypeScript with Angular 2

## Download packages from NPM

1. Install [PackageInstaller](https://github.com/madskristensen/PackageInstaller).

2. Use PackageInstaller to install Angular 2 and systemjs.

    ![Use PackageInstaller to install angular2](packageinstaller-angular2.png)
    ![Use PackageInstaller to install systemjs](packageinstaller-systemjs.png)

## Add Angular 2 to the build

### Enable decorator support

TypeScript's support for decorators is still experimental, so you'll need to manually edit the csproj to enable it.

To do this, edit the project by right-clicking 'Unload' and then 'Edit csproj'.

Then add the following code inside the `PropertyGroup` that contains TypeScript build settings (`TypeScriptTarget`, etc) after the last line (`<TypeScriptSourceRoot />`):

```
<TypeScriptExperimentalDecorators>True</TypeScriptExperimentalDecorators>
```

The resulting PropertyGroup should look like this:

```
  <PropertyGroup>
    <TypeScriptTarget>ES5</TypeScriptTarget>
    <TypeScriptJSXEmit>None</TypeScriptJSXEmit>
    <TypeScriptCompileOnSaveEnabled>True</TypeScriptCompileOnSaveEnabled>
    <TypeScriptNoImplicitAny>False</TypeScriptNoImplicitAny>
    <TypeScriptModuleKind>CommonJS</TypeScriptModuleKind>
    <TypeScriptRemoveComments>False</TypeScriptRemoveComments>
    <TypeScriptOutFile />
    <TypeScriptOutDir>./Scripts/App</TypeScriptOutDir>
    <TypeScriptGeneratesDeclarations>False</TypeScriptGeneratesDeclarations>
    <TypeScriptNoEmitOnError>True</TypeScriptNoEmitOnError>
    <TypeScriptSourceMap>True</TypeScriptSourceMap>
    <TypeScriptMapRoot />
    <TypeScriptSourceRoot />
    <TypeScriptExperimentalDecorators>True</TypeScriptExperimentalDecorators>
  </PropertyGroup>
```

The last line of the PropertyGroup is new.

### Add a CopyFiles target to the build

After the TypeScript configuration PropertyGroup, add a new ItemGroup and Target to copy the angular files.

```
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

Temporarily set target to ES2015.
OR find a promise.d.ts.
Pretty sure Alex Eagle complained about this before.
I should see what he said.

## Write a simple Angular app in TypeScript

First, change the code in `app.ts` to:

```ts
import {Component} from "angular2/core"
import {bootstrap} from "angular2/platform/browser"
import {MyModel} from "./model"

@Component({
    selector: `my-app`,
    template: `<div>Hello from {{getGreeting()}}</div>`
})
class MyApp {
    model = new MyModel();
    getGreeting() {
        return this.model.greeting;
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

## Reference Angular in ASP.NET

4. Add TypeScript code for talking to Angular.

# ASP.NET 4 with TypeScript with gulp

# ASP.NET 4 with TypeScript with gulp with browserify

# ASP.NET 4 with TypeScript with gulp with browserify with minify

# ASP.NET 4 with TypeScript with gulp with browserify with minify with Angular

# ASP.NET Core with TypeScript
