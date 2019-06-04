# Linting

One of the most common features found in any JavaScript project is a code linter.

> Lint, or a linter, is a tool that analyzes source code to flag programming errors, bugs, stylistic errors, and suspicious constructs. The term originates from a Unix utility that examined C language source code. 
>
> ~ [Wikipedia](https://en.wikipedia.org/wiki/Lint_(software))

For a vanilla JavaScript project, the easiest way to set up a linter is by using ESLint, arguably the leading JavaScript linting tool. Also, ESLint is now the officially [recommended linter](https://github.com/Microsoft/TypeScript/issues/29288) of TypeScript itself.

Configuring ESLint with TypeScript requires the use of [@typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) a project that:

> exists so that you can use ESLint and TypeScript together, without needing to worry about implementation detail differences wherever possible.
> 
> ~ [@typescript-eslint](https://github.com/typescript-eslint/typescript-eslint#why-does-this-project-exist)

Setting up ESLint with TypeScript is easy! Follow the [Learn TypeScript Linting Part 1](https://blog.matterhorn.dev/posts/learn-typescript-linting-part-1/) tutorial to learn how to:
- Configure ESLint and @typescript-eslint
- Execute and understand the linting output
- Solve common TypeScript specific linting errors/warnings

If you're interested in using other linting-like tools such as the popular styling formatters [Standard](https://standardjs.com/) and [Prettier](https://prettier.io/), the [Learn TypeScript Linting Part 2](https://blog.matterhorn.dev/posts/learn-typescript-linting-part-2/) post has additional configuration instructions.
