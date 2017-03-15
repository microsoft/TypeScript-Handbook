This quick start guide will teach you how to wire up TypeScript with [React](http://facebook.github.io/react/).
By the end, you'll have

* linting with [TSLint](https://github.com/palantir/tslint)
* testing with [Jest](https://facebook.github.io/jest/), and
* state management with [Redux](https://github.com/reactjs/react-redux)

We'll use the [create-react-app](https://github.com/facebookincubator/create-react-app) tool to quickly get set up, and then eject to see how these tools are all put together.

We assume that you're already using [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/).

# Install create-react-app

We're going to use the create-react-app because it sets some canonical defaults for React projects.
This is just a command-line utility to scaffold out new React projects.

```shell
npm install -g create-react-app
```

# Create our new project

We'll create a new project called `my-app`:

```shell
create-react-app my-app --scripts-version=react-scripts-ts
```

[react-scripts-ts](https://www.npmjs.com/package/react-scripts-ts) is a set of adjustments to take the standard create-react-app project pipeline and bring TypeScript into the mix.

At this point, your project layout should more or less look something like the following:

```text
my-app/
├─ .gitignore
├─ node_modules/
├─ public/
├─ src/
│  └─ ...
├─ package.json
├─ tsconfig.json
└─ tslint.json
```

Of note:

* `tsconfig.json` contains some TypeScript-specific options for our project.
* `tslint.json` stores the settings that our linter, [TSLint](https://github.com/palantir/tslint), will use.
* `package.json` contains our dependencies, as well as some shortcuts for commands we'd like to run for testing, previewing, and deploying our app.
* `public` contains static assets like the HTML page we're planning to deploy to, or images. You can delete any file in this folder apart from `index.html`.
* `src` contains our TypeScript and CSS code. `index.tsx` is the entry-point for our file, and is mandatory.

# Running the project

Running the project is as simple as running

```sh
npm run start
```

This runs the `start` script specified in our `package.json`, and will spawn off a server reacts to updates as we save our files.
Typically the server runs at `http://localhost:3000`, but should be automatically opened for you.

This tightens the iteration loop by allowing us to quickly preview changes.

# Testing the project

Testing is also just a command away:

```sh
npm run test
```

This command runs Jest, an incredibly useful testing utility, against all files whose extensions end in `.test.ts` or `.spec.ts`.
Like with the `npm run start` command, Jest will automatically run as soon as it detects changes.
If you'd like, you can run `npm run start` and `npm run test` side by side so that you can preview changes and test them simultaneously.

# Creating a production build

When running the project (as specified earlier), we didn't end up with an optimized build.
Typically, we want the code we ship to users to be as fast and small as possible.
Certain optimizations (like minification) can accomplish this, but often take more time.
We call builds like this "production" builds (as opposed to development builds).

To run a production build, just run

```sh
npm run build
```

This will create an optimized JS and CSS build in `./build/static/js` and `./build/static/css` respectively.

You won't need to run a production build most of the time, but it's often useful to do so before committing changes.

# Creating a component

We're going to write a `Hello` component.
The component will take the name of whatever we want to greet (which we'll call `name`), and optionally the number of exclamation marks to trail with (`enthusiasmLevel`).

When we write something like `<Hello name="Daniel" enthusiasmLevel={3} />`, the component should render to something like `<div>Hello Daniel!!!</div>`.
If `enthusiasmLevel` isn't specified, the component should default to showing one exclamation mark.
If `enthusiasmLevel` is `0` or negative, it should throw an error.

We'll write a `Hello.tsx`:

```ts
// src/components/Hello.tsx

import * as React from 'react';

export interface Props {
  name: string;
  enthusiasmLevel?: number;
}

const Hello = ({ name, enthusiasmLevel = 1 }: Props) => {
  if (enthusiasmLevel <= 0) {
    throw new Error('You could be a little more enthusiastic. :D');
  }

  return (
    <div className="hello">
      <div className="greeting">
        Hello {name + getExclamationMarks(enthusiasmLevel)}!
      </div>
    </div>
  );
}

export default Hello;

// helpers

function getExclamationMarks(numChars: number) {
  return Array(numChars).join('!');
}
```

Notice that we defined a type named `Props` that specifies the properties our component will take.
`name` is a required `string`, and `enthusiasmLevel` is an optional `number` (which you can tell from the `?` that we wrote out after its name).

We also wrote `Hello` as a stateless function component (an SFC).
To be specific, `Hello` is a variable being assigned an arrow function.
That arrow function destructures a given `Props` object, and defaults `enthusiasmLevel` to `1` if it isn't defined.

If we wanted, we *could* have written it out as a class as follows:

```ts
class Hello extends React.Component<Props, undefined> {
  render() {
    const { name, enthusiasmLevel = 1 } = this.props;

    if (enthusiasmLevel <= 0) {
      throw new Error('You could be a little more enthusiastic. :D');
    }

    return (
      <div className="hello">
        <div className="greeting">
          Hello {name + getExclamationMarks(enthusiasmLevel)}!
        </div>
      </div>
    );
  }
}
```

But we don't really need to think about state in this example - in fact, we specified it as `undefined` in `React.Component<Props, undefined>`, so writing an SFC tends to be shorter.
We will revisit how to bind global application state with Redux in a bit, but local component state is more useful at the presentational level when creating generic UI elements that can be shared between libraries.

Now that we've written our component, let's replace our render of `<App />` with a render of `<Hello ... />`.

First we'll import it.

```ts
import Hello from './components/Hello.tsx';
```

and then change up our `render` call:

```ts
ReactDOM.render(
  <Hello name="TypeScript" enthusiasmLevel={10} />,
  document.getElementById('root') as HTMLElement
);
```

# Adding style 😎

Styling a component with our setup is easy.
To style our `Hello` component, we can create a CSS file at `src/components/Hello.css`.

```css
.hello {
  text-align: center;
  margin: 20px;
  font-size: 48px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
}

.hello button {
    margin-left: 25px;
    margin-right: 25px;
    font-size: 40px;
    min-width: 50px;
}
```

The tools that create-react-app uses (namely, Webpack and various loaders) allow us to simply import the stylesheets we're interested in.
So in `src/components/Hello.tsx`, we'll add the following import.

```ts
import './Hello.css';
```

# Writing tests

We had a certain set of assumptions about our `Hello` component.
Let's reiterate what they were:

> * When we write something like `<Hello name="Daniel" enthusiasmLevel={3} />`, the component should render to something like `<div>Hello Daniel!!!</div>`.
> * If `enthusiasmLevel` isn't specified, the component should default to showing one exclamation mark.
> * If `enthusiasmLevel` is `0` or negative, it should throw an error.

We can use these requirements to write a few tests for our components.

But first, let's add our first dependency.
Enzyme is a common tool in the React ecosystem that makes it easier to write tests for how components will behave.
While we have jsdom support available to emulate how a component will act in the DOM, Enzyme makes it easier to make certain queries about our components.

Let's install it as a development-time dependency.

```sh
npm install -D enzyme @types/enzyme react-addons-test-utils
```

Notice we installed packages `enzyme` as well as `@types/enzyme`.
The `enzyme` package refers to the package containing JavaScript code that actually gets run, while `@types/enzyme` is a package that contains declaration files (`.d.ts` files) so that TypeScript can understand how you can use Enzyme.
We also had to install `react-addons-test-utils`.
`enzyme` actually expects `jsdom` and `react-addons-test-utils` to be installed, but we already have the former, and the latter may be optional for older versions of React.

Now that we've got Enzyme installed, let's start writing our test!
Let's create a file named `src/components/Hello.test.tsx`, adjacent to our `Hello.tsx` file from earlier.

```ts
// src/components/Hello.test.tsx

import * as React from 'react';
import * as enzyme from 'enzyme';
import Hello from './Hello';

it('renders the correct text when no enthusiasm level is given', () => {
  const hello = enzyme.shallow(<Hello name='Daniel' />);
  expect(hello.find(".greeting").text()).toEqual('Hello Daniel!')
});

it('renders the correct text with an explicit enthusiasm of 1', () => {
  const hello = enzyme.shallow(<Hello name='Daniel' enthusiasmLevel={1}/>);
  expect(hello.find(".greeting").text()).toEqual('Hello Daniel!')
});

it('renders the correct text with an explicit enthusiasm level of 5', () => {
  const hello = enzyme.shallow(<Hello name='Daniel' enthusiasmLevel={5} />);
  expect(hello.find(".greeting").text()).toEqual('Hello Daniel!!!!!');
});

it('throws when the enthusiasm level is 0', () => {
  expect(() => {
    enzyme.shallow(<Hello name='Daniel' enthusiasmLevel={0} />);
  }).toThrow();
});

it('throws when the enthusiasm level is negative', () => {
  expect(() => {
    enzyme.shallow(<Hello name='Daniel' enthusiasmLevel={-1} />);
  }).toThrow();
});
```

These tests are extremely basic, but you should be able to get the gist of things.

# Adding state management

At this point, if all you're using React for is fetching data once and displaying it, you can consider yourself done.
But if you're developing an app that's more interactive, then you may need to add state management.

## State management in general

On its own, React is a useful library for creating composable views.
However, React doesn't come with any facility for synchronizing data between your application.
As far as a React component is concerned, data flows down through its children through the props you specify on each element.

As an answer, the React community relies on libraries like Redux and MobX.

[Redux](http://redux.js.org) relies on synchronizing data through a centralized immutable store of data, and updates to that data will trigger a re-renders to parts of the application.
State is updated in an immutable fashion by sending explicit action messages which must be handled by functions called reducers.
Because of the explicit nature, it may often be easier to reason about how an action will affect the state of your program.

[MobX](https://mobx.js.org/) relies on functional reactive patterns where state is wrapped through observables and and passed through as props.
State is updated in a very natural way through traditional assignments that one would typically write in JavaScript.
Keeping state fully synchronized for any observers is done by simply marking state as observable.
As a nice bonus, the library is already written in TypeScript.

Both have different advantages and merits, with certain tradeoffs.
Generally Redux tends to see more widespread usage, so for the purposes of this tutorial, we'll focus on adding Redux;
however, you should feel encouraged to explore both.

## Setting the stage for actions

It doesn't make sense to add Redux unless the state of our application changes.
We need a source of actions that will trigger changes to take place.
This can be a timer, or something in the UI like a button.

For our purposes, we're going to add two buttons to control the enthusiasm level for our `Hello` component.

## Installing Redux

To add Redux, we'll first install `redux` and `react-redux`, as well as their types, as a dependency.

```sh
npm install -S redux react-redux @types/react-redux
```

In this case we didn't need to install `@types/redux` because Redux already comes with its own definition files (`.d.ts` files).

## Defining our state

We need to define the shape of the state which Redux will store.
For this, we can create a file called `src/types/index.tsx` which will contain definitions for types that we might use throughout the program.

```ts
// src/types/index.tsx

export interface StoreState {
    languageName: string;
    enthusiasmLevel: number;
}
```

Our intention is that `languageName` will be the programming language this app was written in (i.e. TypeScript or JavaScript) and `enthusiasmLevel` will vary.
When we write our first container, we'll understand why we intentionally made our state slightly different from our props.

## Adding actions

Let's start off by creating a set of message types that our app can respond to in `src/constants/index.tsx`.

```ts
// src/constants/index.tsx

export const INCREMENT_ENTHUSIASM = 'INCREMENT_ENTHUSIASM';
export type INCREMENT_ENTHUSIASM = typeof INCREMENT_ENTHUSIASM;


export const DECREMENT_ENTHUSIASM = 'DECREMENT_ENTHUSIASM';
export type DECREMENT_ENTHUSIASM = typeof DECREMENT_ENTHUSIASM;
```

This `const`/`type` pattern allows us to use TypeScript's string literal types in an easily accessible & refactorable way.

Next, we'll create a set of actions and functions that can quickly create these actions in `src/actions/index.tsx`.

```ts
import * as constants from '../constants'

export interface IncrementEnthusiasm {
    type: constants.INCREMENT_ENTHUSIASM;
}

export interface DecrementEnthusiasm {
    type: constants.DECREMENT_ENTHUSIASM;
}

export type EnthusiasmAction = IncrementEnthusiasm | DecrementEnthusiasm;

export function incrementEnthusiasm(): IncrementEnthusiasm {
    return {
        type: constants.INCREMENT_ENTHUSIASM
    }
}

export function decrementEnthusiasm(): DecrementEnthusiasm {
    return {
        type: constants.DECREMENT_ENTHUSIASM
    }
}
```

We've created two types that describe what increment actions and decrement actions should look like.
We also created a type (`EnthusiasmAction`) to describe cases where an action could be an increment or a decrement.
Finally, we made two functions that actually manufacture the actions.

There's some clear boilerplate here, so you should feel free to look into libraries like [redux-actions](https://www.npmjs.com/package/redux-actions) once you've got the hang of things.

## Adding a reducer

We're ready to write our first reducer!
Reducers are just functions that generate changes by creating modified copies of our application's state, but that have *no side effects*.

Our reducer will go under `src/reducers/index.tsx`.
Its function will be to ensure that increments raise the enthusiasm level by 1, and that decrements reduce the enthusiasm level by 1, but that the level never falls below 1.

```ts
// src/reducers/index.tsx

import { EnthusiasmAction } from '../actions';
import { StoreState } from '../types/index';
import { INCREMENT_ENTHUSIASM, DECREMENT_ENTHUSIASM } from '../constants/index';

export function enthusiasm(state: StoreState, action: EnthusiasmAction): StoreState {
  switch (action.type) {
    case INCREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: state.enthusiasmLevel + 1 };
    case DECREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: Math.max(1, state.enthusiasmLevel - 1) };
  }
  return state;
}
```

Notice that we're using the *object spread* (`...state`) which allows us to create a shallow copy of our state, while replacing the `enthusiasmLevel`.
It's important that the `enthusiasmLevel` property come last, since otherwise it would be overridden by the property in our old state.

You may want to write a few tests for your reducer.
It should be relatively easy. since reducers are pure functions, and can be passed arbitrary data.

## Making a container

When writing with Redux, we will often write components as well as containers.
*Containers* typically wrap components and feed them any data that is necessary to display and modify state.

First let's update `src/components/Hello.tsx` so that it will have a means of modifying state.
We'll add two optional callback properties to `Props` named `onIncrement` and `onDecrement`:

```ts
export interface Props {
  name: string;
  enthusiasmLevel?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}
```

Then we'll bind those callbacks to two new buttons that we'll add into our component.

```ts
function Hello({ name, enthusiasmLevel = 1, onIncrement, onDecrement }: Props) {
  if (enthusiasmLevel <= 0) {
    throw new Error('You could be a little more enthusiastic. :D');
  }

  return (
    <div className="hello">
      <div className="greeting">
        Hello {name + getExclamationMarks(enthusiasmLevel)}!
      </div>
      <div>
        <button onClick={onDecrement}>-</button>
        <button onClick={onIncrement}>+</button>
      </div>
    </div>
  );
}
```

In general, it'd be a good idea to write a few tests for `onIncrement` and `onDecrement` being triggered when their respective buttons are clicked.
Give it a shot to get the hang of writing tests for your components.

Now that our component is updated, we're ready to wrap it into a container.
Let's create a file named `src/containers/Hello.tsx` and start off with the following imports.

```ts
import Hello from '../components/Hello';
import * as actions from '../actions/';
import { StoreState } from '../types/index';
import { connect, Dispatch } from 'react-redux';
```

The real two key pieces here are the original `Hello` component as well as the `connect` function from react-redux.
`connect` will be able to actually take our original `Hello` component and turn it into a container using two functions:

* `mapStateToProps` which massages the data from the current store to part of the shape that our component needs.
* `mapDispatchToProps` which uses creates callback props to pump actions to our store using a given `dispatch` function.

If we recall, our application state consists of two properties: `languageName` and `enthusiasmLevel`.
Our `Hello` component, on the other hand, expected a `name` and an `enthusiasmLevel`.
`mapStateToProps` will get the relevant data from the store, and adjust it if necessary, for our component's props.
Let's go ahead and write that.

```ts
export function mapStateToProps({ enthusiasmLevel, languageName }: StoreState) {
  return {
    enthusiasmLevel,
    name: languageName,
  }
}
```

Note that `mapStateToProps` only creates 2 out of 4 of the properties a `Hello` component expects.
Namely, we still want to pass in the `onIncrement` and `onDecrement` callbacks.
`mapDispatchToProps` is a function that takes a dispatcher function.
This dispatcher function can pass actions into our store to make updates, so we can create a pair of callbacks that will call the dispatcher as necessary.

```ts
export function mapDispatchToProps(dispatch: Dispatch<actions.EnthusiasmAction>) {
  return {
    onIncrement: () => dispatch(actions.incrementEnthusiasm()),
    onDecrement: () => dispatch(actions.decrementEnthusiasm()),
  }
}
```

Finally, we're ready to call `connect`.
`connect` will first take `mapStateToProps` and `mapDispatchToProps`, and then return another function that we can use to wrap our component.
Our resulting container is defined with the following line of code:

```ts
export default connect(mapStateToProps, mapDispatchToProps)(Hello);
```

When we're finished, our file should look like this:

```ts
// src/containers/Hello.tsx

import Hello from '../components/Hello';
import * as actions from '../actions/';
import { StoreState } from '../types/index';
import { connect, Dispatch } from 'react-redux';

export function mapStateToProps({ enthusiasmLevel, languageName }: StoreState) {
  return {
    enthusiasmLevel,
    name: languageName,
  }
}

export function mapDispatchToProps(dispatch: Dispatch<actions.EnthusiasmAction>) {
  return {
    onIncrement: () => dispatch(actions.incrementEnthusiasm()),
    onDecrement: () => dispatch(actions.decrementEnthusiasm()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Hello);
```

## Creating a store

Let's go back to `src/index.tsx`.
To put this all together, we need to create a store with an initial state, and set it up with all of our reducers.

```ts
import { createStore } from 'redux';
import { enthusiasm } from './reducers/index';
import { StoreState } from './types/index';

const store = createStore<StoreState>(enthusiasm, {
  enthusiasmLevel: 1,
  languageName: 'TypeScript',
});
```

`store` is, as you might've guessed, our central store for our application's global state.

Next, we're going to swap our our use of `./src/components/Hello` with `./src/containers/Hello` and use react-redux's `Provider` to wire up our props with our container.
We'll import each:

```ts
import Hello from './containers/Hello';
import { Provider } from 'react-redux';
```

and pass our `store` through to the `Provider`'s attributes:

```ts
ReactDOM.render(
  <Provider store={store}>
    <Hello />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
```

Notice that `Hello` no longer needs props, since we used our `connect` function to adapt our application's state for our wrapped `Hello` component's props.

# Ejecting

If at any point, you feel like there are certain customizations that the create-react-app setup has made difficult, you can always opt-out and get the various configuration options you need.
For example, if you'd like to add a Webpack plugin, it might be necessary to take advantage of the "eject" functionality that create-react-app provides.

Simply run

```sh
npm run eject
```

and you should be good to go!

As a heads up, you may want to commit all your work before running an eject.

# Next steps

create-react-app comes with a lot of great stuff.
Much of it is documented in the default `README.md` that was generated for our project, so give that a quick read.

If you still want to learn more about Redux, you can [check out the official website](http://redux.js.org/) for documentation.
The same goes [for MobX](https://mobx.js.org/).

If you want to eject at some point, you may need to know a little bit more about Webpack.
You can check out our [React & Webpack walkthrough here](./React & Webpack.md).

At some point you might need routing.
There are several solutons, but [react-router](https://github.com/ReactTraining/react-router), and is often used in conjunction with [react-router-redux](https://github.com/reactjs/react-router-redux) for Redux projects.