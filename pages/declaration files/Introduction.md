This guide is designed to teach you how to write a high-quality TypeScript Declaration File.

In this guide, we'll assume basic familiarity with the TypeScript language.
If you haven't already, you should read the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html)
  to familiarize yourself with basic concepts, especially types and namespaces.

# Sections

The guide is broken down into the following sections.

## Library Structures

The [Library Structures](./Library Structures.md) guide helps you understand common library formats and how to write a correct declaration file for each format.
If you're editing an existing file, you probably don't need to read this section.
Authors of new declaration files must read this section to properly understand how the format of the library influences the writing of the declaration file.

## "Do"s and "Don't"s

Many common mistakes in declaration files can be easily avoided.
The [Do's and Don'ts](./Do's and Don'ts.md) section identifies common errors,
  describes how to detect them,
  and how to fix them.
Everyone should read this section to help themselves avoid common mistakes.

## By Example

Many times, we are faced with writing a declaration file when we only have examples of the underlying library to guide us.
The [By Example](./By Example.md) section shows many common API patterns and how to write declarations for each of them.
This guide is aimed at the TypeScript novice who may not yet be familiar with every language construct in TypeScript.

## Deep Dive

For seasoned authors interested in the underlying mechanics of how declaration files work,
  the [Deep Dive](./Deep Dive.md) section explains many advanced concepts in declaration writing,
  and shows how to leverage these concepts to create cleaner and more intuitive declaration files.

## Templates

In [Templates](./Templates.md) you'll find a number of declaration files that serve as a useful starting point
  when writing a new file.
Refer to the documentation in [Library Structures](./Library Structures.md) to figure out which template file to use.

## Publish to npm

The [Publishing](./Publishing.md) section explains how to publish your declaration files to an npm package, and shows how to manage your dependent packages.

## Find and Install Declaration Files

For JavaScript library users, the [Consumption](./Consumption.md) section offers a few simple steps to locate and install corresponding declaration files.
