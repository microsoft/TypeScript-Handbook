# Introdução

Para que os programas sejam úteis, precisamos ser capazes de trabalhar com algumas das unidades mais simples de dados:  numbers, strings, structures, boolean e valores similares. No TypeScript, suportamos os mesmos tipos que você esperaria em JavaScript, com um tipo de enumeração conveniente para ajudar as coisas.

# Boolean

O tipo de dados mais básico é o valor verdadeiro/falso simples, que JavaScript e TypeScript chamam de valor `boolean`.

```ts
let estaFeito: boolean = false;
```

# Number

Como no JavaScript, todos os números no TypeScript são valores de ponto flutuante. Esses números de ponto flutuante obtêm o tipo `number`. Além de literais hexadecimais e decimais, o TypeScript também suporta literais binários e octais, introduzidos no ECMAScript 2015.

```ts
let decimal: number = 6;
let hex: number = 0xf00d;
let binario: number = 0b1010;
let octal: number = 0o744;
```

# String

Outra parte fundamental da criação de programas em JavaScript para páginas da Web e servidores é trabalhar com dados textuais.
Como em outras linguagens, usamos o tipo `string` para nos referir a esses tipos de dados textuais.
Assim como o JavaScript, o TypeScript também usa aspas duplas (`"`) ou aspas simples (`'`) para cercar os dados da string.

```ts
let cor: string = "azul";
cor = 'vermelho';
```

Você também pode usar *template strings*, que podem abranger múltiplas linhas e ter expressões incorporadas.
Essas strings são cercadas pelo caractere backtick/backquote (`` ` ``), e as expressões incorporadas têm o formato `${ expressao }`.

```ts
let nomeCompleto: string = `Bob Bobbington`;
let idade: number = 37;
let frase: string = `Olá, meu nome é ${ nomeCompleto }.

Eu farei ${ idade + 1 } anos no próximo mês.`;
```

O equivalente para declarar `frase` fica da seguinte maneira:

```ts
let frase: string = "Olá,  nome é " + nomeCompleto + ".\n\n" +
    "Eu farei " + (idade + 1) + " anos no próximo mês.";
```

# Array

O TypeScript, assim como o JavaScript, permite você trabalhar com matrizes(arrays) de valores.
Os tipos de Array podem ser gravados de duas maneiras.
No primeiro, você usa o tipo dos elementos seguidos por `[]` para denotar um Array desse tipo de elemento:

```ts
let lista: number[] = [1, 2, 3];
```

A segunda maneira usa o tipo genérico de Array, `Array<tipoDoElemento>`:

```ts
let lista: Array<number> = [1, 2, 3];
```

# Tuple

Tuple types allow you to express an array with a fixed number of elements whose types are known, but need not be the same. For example, you may want to represent a value as a pair of a `string` and a `number`:

Os tipos tupla(Tuple) permitem expressar um Array com um número fixo de elementos cujos tipos são conhecidos, mas não precisam ser os mesmos. Por exemplo, você pode representar um valor como um par de uma `string` e um` number`:

```ts
// Declarando o tipo tupla
let x: [string, number];
// Inicialize assim
x = ["hello", 10]; // OK
// inicialiando de forma incorreta
x = [10, "hello"]; // Error
```

Ao acessar um elemento com um índice conhecido, o tipo correto é recuperado:

```ts
console.log(x[0].substring(1)); // OK
console.log(x[1].substring(1)); // Error, 'number' does not have 'substring'
```

Ao tentar acessar um elemento fora do conjunto de índices conhecidos é disparada uma mensagem com um erro:

```ts
x[3] = "world"; // Error, Property '3' does not exist on type '[string, number]'.

console.log(x[5].toString()); // Error, Property '5' does not exist on type '[string, number]'.
```

# Enum

A helpful addition to the standard set of datatypes from JavaScript is the `enum`.
As in languages like C#, an enum is a way of giving more friendly names to sets of numeric values.

Uma adição útil ao conjunto padrão de tipos de dados do JavaScript é o `enum`.
Como em linguagens como C#, uma enumeração(Enum) é uma maneira de atribuir nomes mais amigáveis para conjuntos de valores numéricos.

```ts
enum Cor {Vermelho, Verde, Azul}
let c: Cor = Cor.Verde;
```

Por padrão, Enums começam a numerar seus membros começando em `0`.
Você pode alterar isso definindo manualmente o valor de um de seus membros.
Por exemplo, podemos iniciar o exemplo anterior em `1` em vez de` 0`:

```ts
enum Cor {Vermelho = 1, Verde, Azul}
let c: Cor = Cor.Verde;
```

Ou mesmo, definindo manualmente todos os valores no enum:

```ts
enum Cor {Vermelho = 1, Verde = 2, Azul = 4}
let c: Cor = Cor.Verde;
```

Um recurso útil dos emuns é que você também pode passar de um valor numérico para o nome desse valor na enumeração.
Por exemplo, se tivéssemos o valor `2`, mas não tivéssemos certeza do que estava mapeado no enum `Cor` acima, poderíamos procurar o nome correspondente:

```ts
enum Cor {Vermelho = 1, Verde, Azul}
let nomeDaCor: string = Cor[2];

console.log(nomeDaCor); // Exibe 'Verde', pois seu valor acima é 2
```

# Any

Podemos precisar descrever o tipo de variáveis que não sabemos, quando estamos escrevendo um aplicativo.
Esses valores podem ser provenientes de conteúdo dinâmico, por exemplo, do usuário ou de uma biblioteca de terceiros.
Nesses casos, queremos desativar a verificação de tipo e deixar que os valores passem pelas verificações em tempo de compilação.
Para isso, rotulamos estes com o tipo `any`:

```ts
let naoTenhoCerteza: any = 4;
naoTenhoCerteza = "talvez seja uma string";
naoTenhoCerteza = false; // ok, definitivamente é um boolen
```

O tipo `any` é uma maneira poderosa de trabalhar com o JavaScript existente, permitindo que você inclua e desative gradualmente a verificação de tipo durante a compilação.
Você pode esperar que o `Object` desempenhe um papel semelhante, como ocorre em outras linguagens.
No entanto, variáveis do tipo `Object` permitem apenas atribuir qualquer valor à elas. Você não pode chamar métodos arbitrários, nem mesmo os que existem:

```ts
let naoTenhoCerteza: any = 4;
naoTenhoCerteza.ifItExists(); // ok, ifItExists pode existir em tempo-de-execução(runtime)
naoTenhoCerteza.toFixed(); // ok, toFixed existe (mas o compilador não checa)

let comCerteza: Object = 4;
comCerteza.toFixed(); // Error: Property 'toFixed' doesn't exist on type 'Object'.
```

O tipo `any` também é útil se você conhece alguma parte do tipo, mas talvez nem todos.
Por exemplo, você pode ter um array, mas este possui uma mistura de diferentes tipos:

```ts
let lista: any[] = [1, true, "grátis"];

lista[1] = 100;
```

# Void

`void` é um pouco como o oposto de `any`: a ausência de ter qualquer tipo.
Você geralmente vê isso como o tipo de retorno de funções que não retornam um valor, ou que o retorno é vazio:

```ts
function avisarUsuario(): void {
    console.log("Isso é uma mensagem de aviso");
}
```

Declarar variáveis do tipo `void` não é útil porque você só pode atribuir `null` (somente se `--strictNullChecks` não estiver especificado, consulte a próxima seção) ou `indefinido` à elas:

```ts
let inutil: void = undefined;
inutil = null; // OK, se `--strictNullChecks` não estiver especificado
```

# Null e Undefined

No TypeScript, `undefined` e` null` têm seus próprios tipos denominados `undefined` e` null` respectivamente.
Assim como o `void`, eles não são extremamente úteis por si só:

```ts
// Não há muito mais o que possamos atribuir a essas variáveis!
let u: undefined = undefined;
let n: null = null;
```

Por padrão, `null` e` undefined` são subtipos de todos os outros tipos.
Isso significa que você pode atribuir `null` e` undefined` a algo como `number`.

Entretanto, ao usar o sinalizador `--strictNullChecks`, `null` e `undefined` são atribuíveis apenas a` any` e seus respectivos tipos (a única exceção é que `undefined` também é atribuível a `void`).
Isso ajuda a evitar *muitos* erros comuns.
Nos casos em que você deseja passar uma `string` ou` null` ou `undefined`, você pode usar o tipo de união(Union) `string | null | undefined`.

Os tipos union é um tópico avançado que abordaremos em um capítulo posterior.

> Como observação: incentivamos o uso de `--strictNullChecks` quando possível, mas, para os propósitos deste handbook, assumiremos que ele está desativado.

# Never

O tipo `never` representa o tipo de valores que nunca ocorrem.
Por exemplo, `never` é o tipo de retorno para uma expressão de função, ou expressão de função de seta, que sempre gera uma exceção ou uma que nunca retorna;
As variáveis também adquirem o tipo `never` quando restringidas por qualquer proteção de tipo que nunca possa ser verdadeira.

O tipo `never` é um subtipo de, e atribuível a, todo tipo; no entanto, *nenhum* tipo é um subtipo ou atribuível a `never` (exceto `never`).
Mesmo `any` não é atribuível a `never`.

Alguns exemplos de funções retornando `never`:

```ts
//O retorno da função nunca deve ter um ponto final inacessível
function error(messagem: string): never {
    throw new Error(messagem);
}

// O tipo de retorno inferido nunca é never
function fail() {
    return error("Algo falhou");
}

//O retorno da função nunca deve ter um ponto final inacessível
function loopInfinito(): never {
    while (true) {
    }
}
```

# Object

`object` é um tipo que representa o tipo não primitivo, ou seja, qualquer coisa que não seja `number`, `string`,` boolean`, `symbol`,` null` ou `undefined`.

Com o tipo `object`, APIs como` Object.create` podem ser melhor representadas. Por exemplo:

```ts
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

# Type assertions (Asserção de Tipos)

Às vezes, você acaba em uma situação em que sabe mais sobre um valor do que o TypeScript.
Normalmente, isso acontece quando você sabe que o tipo de alguma entidade pode ser mais específico do que o tipo atual.

*Asserção de Tipos* são uma maneira de dizer ao compilador: `"confie em mim, eu sei o que estou fazendo"`.
Uma asserção de tipo é como uma conversão de tipo em outras linguagens, mas não realiza nenhuma verificação ou reestruturação especial dos dados.
Não tem impacto no tempo de execução e é usado exclusivamente pelo compilador.
O TypeScript supõe que você, o(a) programador(a), tenha realizado as verificações especiais necessárias.

As asserções de tipo têm duas formas.
Uma é a sintaxe "angle-bracket":

```ts
let algunValor: any = "isso é uma string";

let strTamanho: number = (<string>algunValor).length;
```

And the other is the `as`-syntax:

```ts
let algunValor: any = "isso é uma string";

let strTamanho: number = (algunValor as string).length;
```

As duas amostras são equivalentes.
Usar um sobre o outro é principalmente uma escolha de preferência; no entanto, ao usar o TypeScript com JSX, apenas asserções `as`-style são permitidas.

# Uma nota sobre `let`

Você deve ter notado que, até agora, usamos a palavra-chave `let` em vez da palavra-chave `var` do JavaScript, com a qual você pode estar mais familiarizado.
A palavra-chave `let` é na verdade uma construção JavaScript mais recente que o TypeScript disponibiliza.
Discutiremos os detalhes mais tarde, mas muitos problemas comuns no JavaScript são atenuados usando `let`, portanto você deve usá-lo em vez de `var` sempre que possível.