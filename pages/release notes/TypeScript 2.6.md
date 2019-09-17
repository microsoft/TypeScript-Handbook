## Strict function types

TypeScript 2.6 introduces a new strict checking flag, `--strictFunctionTypes`.
The `--strictFunctionTypes` switch is part of the `--strict` family of switches, meaning that it defaults to on in `--strict` mode.
You can opt-out by setting `--strictFunctionTypes false` on your command line or in your tsconfig.json.

Under `--strictFunctionTypes` function type parameter positions are checked _contravariantly_ instead of _bivariantly_.
For some background on what variance means for function types check out [What are covariance and contravariance?](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance).

The stricter checking applies to all function types, *except* those originating in method or constructor declarations.
Methods are excluded specifically to ensure generic classes and interfaces (such as `Array<T>`) continue to mostly relate covariantly.

Consider the following example in which `Animal` is the supertype of `Dog` and `Cat`:

```ts
declare let f1: (x: Animal) => void;
declare let f2: (x: Dog) => void;
declare let f3: (x: Cat) => void;
f1 = f2;  // Error with --strictFunctionTypes
f2 = f1;  // Ok
f2 = f3;  // Error
```

The first assignment is permitted in default type checking mode, but flagged as an error in strict function types mode.
Intuitively, the default mode permits the assignment because it is _possibly_ sound, whereas strict function types mode makes it an error because it isn't _provably_ sound.
In either mode the third assignment is an error because it is _never_ sound.

Another way to describe the example is that the type `(x: T) => void` is _bivariant_ (i.e. covariant _or_ contravariant) for `T` in default type checking mode, but _contravariant_ for `T` in strict function types mode.

##### Example

```ts
interface Comparer<T> {
    compare: (a: T, b: T) => number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer;  // Error
dogComparer = animalComparer;  // Ok
```

The first assignment is now an error. Effectively, `T` is contravariant in `Comparer<T>` because it is used only in function type parameter positions.

By the way, note that whereas some languages (e.g. C# and Scala) require variance annotations (`out`/`in` or `+`/`-`), variance emerges naturally from the actual use of a type parameter within a generic type due to TypeScript's structural type system.

##### Note

Under `--strictFunctionTypes` the first assignment is still permitted if `compare` was declared as a method.
Effectively, `T` is bivariant in `Comparer<T>` because it is used only in method parameter positions.

```ts
interface Comparer<T> {
    compare(a: T, b: T): number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer;  // Ok because of bivariance
dogComparer = animalComparer;  // Ok
```

TypeScript 2.6 also improves type inference involving contravariant positions:

```ts
function combine<T>(...funcs: ((x: T) => void)[]): (x: T) => void {
    return x => {
        for (const f of funcs) f(x);
    }
}

function animalFunc(x: Animal) {}
function dogFunc(x: Dog) {}

let combined = combine(animalFunc, dogFunc);  // (x: Dog) => void
```

Above, all inferences for `T` originate in contravariant positions, and we therefore infer the *best common subtype* for `T`.
This contrasts with inferences from covariant positions, where we infer the *best common supertype*.

## Cache tagged template objects in modules

TypeScript 2.6 fixes the tagged string template emit to align better with the ECMAScript spec.
As per the [ECMAScript spec](https://tc39.github.io/ecma262/#sec-gettemplateobject), every time a template tag is evaluated, the _same_ template strings object (the same `TemplateStringsArray`) should be passed as the first argument.
Before TypeScript 2.6, the generated output was a completely new template object each time.
Though the string contents are the same, this emit affects libraries that use the identity of the string for cache invalidation purposes, e.g. [lit-html](https://github.com/PolymerLabs/lit-html/issues/58).

##### Example

```ts
export function id(x: TemplateStringsArray) {
    return x;
}

export function templateObjectFactory() {
    return id`hello world`;
}

let result = templateObjectFactory() === templateObjectFactory(); // true in TS 2.6
```

Results in the following generated code:

```js
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function id(x) {
    return x;
}

var _a;
function templateObjectFactory() {
    return id(_a || (_a = __makeTemplateObject(["hello world"], ["hello world"])));
}

var result = templateObjectFactory() === templateObjectFactory();
```

> Note: This change brings a new emit helper, `__makeTemplateObject`;
if you are using `--importHelpers` with [`tslib`](https://github.com/Microsoft/tslib), an updated to version 1.8 or later.

## Localized diagnostics on the command line

TypeScript 2.6 npm package ships with localized versions of diagnostic messages for 13 languages.
The localized messages are available when using `--locale` flag on the command line.

##### Example

Error messages in Russian:

```sh
c:\ts>tsc --v
Version 2.6.0-dev.20171003

c:\ts>tsc --locale ru --pretty c:\test\a.ts

../test/a.ts(1,5): error TS2322: Тип ""string"" не может быть назначен для типа "number".

1 var x: number = "string";
      ~
```

And help in Japanese:

```sh
PS C:\ts> tsc --v
Version 2.6.0-dev.20171003

PS C:\ts> tsc --locale ja-jp
バージョン 2.6.0-dev.20171003
構文: tsc [オプション] [ファイル ...]

例:  tsc hello.ts
    tsc --outFile file.js file.ts
    tsc @args.txt

オプション:
 -h, --help                                 このメッセージを表示します。
 --all                                      コンパイラ オプションをすべて表示します。
 -v, --version                              コンパイラのバージョンを表示します。
 --init                                     TypeScript プロジェクトを初期化して、tsconfig.json ファイルを作成します。
 -p ファイルまたはディレクトリ, --project ファイルまたはディレクトリ  構成ファイルか、'tsconfig.json' を含むフォルダーにパスが指定されたプロジェクトをコ
ンパイルします。
 --pretty                                   色とコンテキストを使用してエラーとメッセージにスタイルを適用します (試験的)。
 -w, --watch                                入力ファイルを監視します。
 -t バージョン, --target バージョン                   ECMAScript のターゲット バージョンを指定します: 'ES3' (既定)、'ES5'、'ES2015'、'ES2016'、'ES2017'、'ES
NEXT'。
 -m 種類, --module 種類                         モジュール コード生成を指定します: 'none'、'commonjs'、'amd'、'system'、'umd'、'es2015'、'ESNext'。
 --lib                                      コンパイルに含めるライブラリ ファイルを指定します:
                                              'es5' 'es6' 'es2015' 'es7' 'es2016' 'es2017' 'esnext' 'dom' 'dom.iterable' 'webworker' 'scripthost' 'es201
5.core' 'es2015.collection' 'es2015.generator' 'es2015.iterable' 'es2015.promise' 'es2015.proxy' 'es2015.reflect' 'es2015.symbol' 'es2015.symbol.wellkno
wn' 'es2016.array.include' 'es2017.object' 'es2017.sharedmemory' 'es2017.string' 'es2017.intl' 'esnext.asynciterable'
 --allowJs                                  javascript ファイルのコンパイルを許可します。
 --jsx 種類                                   JSX コード生成を指定します: 'preserve'、'react-native'、'react'。
 -d, --declaration                          対応する '.d.ts' ファイルを生成します。
 --sourceMap                                対応する '.map' ファイルを生成します。
 --outFile ファイル                             出力を連結して 1 つのファイルを生成します。
 --outDir ディレクトリ                            ディレクトリへ出力構造をリダイレクトします。
 --removeComments                           コメントを出力しないでください。
 --noEmit                                   出力しないでください。
 --strict                                   strict 型チェックのオプションをすべて有効にします。
 --noImplicitAny                            暗黙的な 'any' 型を含む式と宣言に関するエラーを発生させます。
 --strictNullChecks                         厳格な null チェックを有効にします。
 --noImplicitThis                           暗黙的な 'any' 型を持つ 'this' 式でエラーが発生します。
 --alwaysStrict                             厳格モードで解析してソース ファイルごとに "use strict" を生成します。
 --noUnusedLocals                           使用されていないローカルに関するエラーを報告します。
 --noUnusedParameters                       使用されていないパラメーターに関するエラーを報告します。
 --noImplicitReturns                        関数の一部のコード パスが値を返さない場合にエラーを報告します。
 --noFallthroughCasesInSwitch               switch ステートメントに case のフォールスルーがある場合にエラーを報告します。
 --types                                    コンパイルに含む型宣言ファイル。
 @<ファイル>
```

## Suppress errors in .ts files using '// @ts-ignore' comments

TypeScript 2.6 support suppressing errors in .js files using `// @ts-ignore` comments placed above the offending lines.

##### Example

```ts
if (false) {
    // @ts-ignore: Unreachable code error
    console.log("hello");
}
```

A `// @ts-ignore` comment suppresses all errors that originate on the following line.
It is recommended practice to have the remainder of the comment following `@ts-ignore` explain which error is being suppressed.

Please note that this comment only suppresses the error reporting, and we recommend you use this comments _very sparingly_.

## Faster `tsc --watch`

TypeScript 2.6 brings a faster `--watch` implementation.
The new version optimizes code generation and checking for code bases using ES modules.
Changes detected in a module file will result in _only_ regenerating the changed module, and files that depend on it, instead of the whole project.
Projects with large number of files should reap the most benefit from this change.

The new implementation also brings performance enhancements to watching in tsserver.
The watcher logic has been completely rewritten to respond faster to change events.

## Write-only references now flagged as unused

TypeScript 2.6 adds revised implementation  the `--noUnusedLocals` and `--noUnusedParameters` [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html).
Declarations are only written to but never read from are now flagged as unused.

##### Example

Bellow both `n` and `m` will be marked as unused, because their values are never *read*. Previously TypeScript would only check whether their values were *referenced*.

```ts
function f(n: number) {
    n = 0;
}

class C {
    private m: number;
    constructor() {
        this.m = 0;
    }
}
```

Also functions that are only called within their own bodies are considered unused.

##### Example

```ts
function f() {
    f(); // Error: 'f' is declared but its value is never read
}
```
