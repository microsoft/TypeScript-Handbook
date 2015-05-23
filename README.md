# TypeScript-Handbook
The TypeScript Handbook is a comprehensive guide to the TypeScript language

Please see the [latest TypeScript Language Specification](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md) for more details.

# Building and Reading

You will need [Node.js and npm](https://nodejs.org/) before starting.

First install gitbook through `npm`.

```sh
npm install -g gitbook-cli
```

Note, on certain systems, you may need to raise your permissions with a command like `sudo`.


## Building

To build as a website, run the following from the root of this repository:

```sh
npm build pages html
```

The produced handbook can be viewed in the `html` directory.

## Serving and previewing

To preview the site in your browser, run the following from the root of this repository:

```sh
npm serve pages
```