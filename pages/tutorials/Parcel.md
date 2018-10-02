This guide will teach you how use TypeScript with [Parcel](https://parceljs.org/).

This guide assumes that you already have [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/) installed.

# Create folders structure

First, create a new directory for the project.
Let's call it `hello-ts-parcel` for now, but feel free to call it whatever you want.

```sh
$ mkdir hello-ts-parcel
$ cd hello-ts-parcel
```

Next, we're going to create folders for a basic structure for our project:

```
hello-ts-parcel/
└─ src/
```

TypeScript files will be located in `src` folder. We'll setup Parcel to handle the rest.

Let's create our `src` folder:

```shell
$ mkdir src
$ cd src
```

Parcel will eventually generate the `dist` directory for us with compiled code.

# Initialize npm project

Next we'll initialize the npm package in our project folder.

```sh
npm init -y
```

This will generate the `package.json` file with default values.
You can always edit the file to adjust them as needed.

# Install dependencies

First, we'll add Parcel as development dependency to our project.

```shell
npm install --save-dev parcel-bundler
```

Parcel is a "blazing fast, zero configuration web application bundler" that will compile and bundle all our application code into a one nice `.js` bundle.

Once we've added Parcel itself, we need to setup typescript. To do that, we simply need to add `typescript` as a development dependency to our project:

```shell
npm install --save-dev typescript
```

Parcel will automagically detect typescript in dependencies and apply it to all of the processed `.ts` files.

# Write some code

Let's write our first TypeScript file that will greet the user.
First, create a file named `greeter.ts` in `src/` and write the following:

```ts
class Student {
  fullName: string;
  constructor(public firstName: string, public middleInitial: string, public lastName: string) {
    this.fullName = firstName + ' ' + middleInitial + ' ' + lastName;
  }
}

interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return 'Hello, ' + person.firstName + ' ' + person.lastName;
}

let user = new Student('Jane', 'M.', 'User');

document.body.innerHTML = greeter(user);
```

This is a final code used in [TypeScript in 5 minutes](./TypeScript%20in%205%20minutes.md), please refer to it for detailed explanation on how the code works.

We'll also need an html page to display our `greeter`.
Let's create a file at the root of the project called `index.html` with the following contents:

```html
<!DOCTYPE html>
<html>

<head>
  <title>TypeScript Greeter</title>
</head>

<body>
  <script src="src/index.ts"></script>
</body>

</html>
```

Notice that we're including the typescript file directly.
This is possible because Parcel will handle compilation and bundling for us.

# Create a parcel execution scripts

Finally, we need to edit our `packakge.json` and include a couple of npm script we will use.
It should look like this:

```json
{
  "name": "hello-ts-parcel",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "parcel index.html",
    "build": "parcel build index.html"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "parcel-bundler": "^1.10.1",
    "typescript": "^3.1.1"
  }
}
```

Start script will start Parcel in development mode, while build script will make Parcel compile the code for production.

Note that Parcel doesn't require any additional configuration by default.
While Parcel doesn't require config - it is possible to provide additional configurations (e.g. for typescript) as needed.
You can learn more about configuring Parcel [here](https://parceljs.org/getting_started.html).

# Developing and building the project

To start developing just run:

```sh
npm start
```

Now open up [http://localhost:1234](http://localhost:1234) in your favorite browser and everything should be ready to use!
You should see a page that says "Hello, Jane User".  
Development server also comes with hot-reload - try editing and saving the `greeter.ts` file and you should immediately see the changes in the browser!

Once you want to build you app for production, simply execute:

```sh
npm run build
```

This command will produce compiled and bundled code that will be outputted to `dist/` folder.
