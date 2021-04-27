# react-custom-dom-events

## Easily integrate custom DOM events in React functional components

This project is a continuation of [`react-custom-events`](https://www.npmjs.com/package/react-custom-events). 

## Motivation

There are situations in which the React callback prop handling makes it impossible or at least unconvenient to handle user interactions. 

Common practice is to map user interactions to context or even worse to global state change that then acts as some kind of event provider 
or broadcaster. This could work for most cases, but it introduces strict dependencies between components their environment. Especially in 
situations in which you have no knowledge about the surrounding of the ui components – like ui library development – a generic and self 
contained solution could be required.

Using native custom DOM events could be the better choice because components usually are already depending on the existance of the DOM and 
they allow making use of the native behavior of DOM events like bubbling and such. 

This way you can easily orchestrate event emitting and event listening components – even if there are multiple emitters or multiple 
listeners which is hard to manage if you rely on a single context or global store to broadcast your state changes. 

## React current state

The way of React handling "events" is to pass callbacks to child components via properties. That leads to drilling callback props through 
the component hirarchie whether the components on the route down the hirarchie should have knowledge about these props or not. This is often 
avoided by using [Context](https://reactjs.org/docs/context.html) which could lead to unwanted complexity. Especially if you can not 
provide the context as a part of your ui component but rely on the existance of a specific context provider in the application that utilizes 
your components you introduce a dependency that you can not count on. 

Another problem is that you often need to write callback functions that acts as some kind of orchestrator to then call different other 
functions to resolve user interactions on multiple components. This results in unwanted coupling bewteen components and extra complexity 
for handling the callback composition. 

To avoid all this, you can use custom DOM events, that could be emitted by any component and other components can listen on. They could 
bubble through the DOM tree – which usually represents your component hirarchie – and can be handled on different levels. 

So the handling and orchestration is already provided by the native behavior of custom DOM events. No need to reinvent the logic behind that.

## How to use

### Installation

```sh
npm i @chroma-x/react-custom-dom-events
```

### Event emission

The emitting element could be a `RefObject<HTMLElement>`, `MutableRefObject<HTMLElement>` or a `HTMLElement`.

```typescript
import { useRef } from 'react';
import { emitCustomDomEvent } from '@chroma-x/react-custom-dom-events';

const emittingElement = useRef(null);

const handleClick = (): void => {
  emitCustomDomEvent(emittingElement, 'myCustomEvent');
};

return (
  <button ref={emittingElement} onClick={handleClick}>Emit custom event</button>
);
```

Attach payload to the event

```typescript
emitCustomDomEvent<string>(emittingElement, 'myCustomEvent', 'Event payload');
```

Custom event options

```typescript
emitCustomEvent<string>(emittingElement, 'myCustomEvent', 'Event payload', {
  bubbles: true,
  cancelable: true, 
  composed: true
});
```

### Event listening

The listening element could be a `RefObject<HTMLElement>`, `MutableRefObject<HTMLElement>` or a `HTMLElement`.

The provided callback is called with a native custom event of which you can use the common features like preventing the default behavior
and so on. The payload is as usual part of the event as the member `detail`.

```typescript
import { useRef } from 'react';
import { useCustomDomEventListener } from '@chroma-x/react-custom-dom-events';

const listenerElement = useRef(null);

useCustomDomEventListener<string>(listenerElement, 'myCustomEvent', (event): void => {
  event.stopPropagation();
  console.debug(event.detail);
});

return (
  <div ref ={listenerElement} />
);
```

`useCustomDomEventListener` returns a closure that allows you to remove the added event listener if required. 

```typescript
import { useRef } from 'react';
import { useCustomDomEventListener } from '@chroma-x/react-custom-dom-events';

const listenerElement = useRef(null);

const removeListener = useCustomDomEventListener<string>(listenerElement, 'myCustomEvent', (event): void => {
  event.stopPropagation();
  console.debug(event.detail);
});

const handleClick = (): void => {
  removeListener();
};

return (
  <div ref={listenerElement}>
    <button onClick={handleClick}>Remove event listener</button>
  </div>
);
```

`useCustomDomEventListener` makes use of the useEffect hook, so it can be used in functional components only.

There is no need to handle the removal of the event listener. Listeners are removed on component unmount by reacts useEffect destructor.
