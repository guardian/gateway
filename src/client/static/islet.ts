import { createElement } from 'react';
import { hydrate } from 'react-dom';

/**
 * use `whenIdle` to execute the given callback when the browser is 'idle'
 *
 * @param callback Fired when `requestIdleCallback` runs, when event loop is idle. If not executed within the `timeout`, the callback is added to the event loop. If `requestIdleCallback` is not supported, use `setTimeout` fallback.
 */
const whenIdle = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 500 });
  } else {
    setTimeout(callback, 300);
  }
};

/**
 * Use `whenVisible` to delay execution of the callback until a given element is visible
 * in the viewport.
 *
 * Uses `IntersectionObserver` to determine when the element is visible.
 * If `IntersectionObserver` is not supported use `setTimeout` failover to call back at the end of the call stack
 *
 * @param element : The html element that we want to observe;
 * @param callback : This is fired when the element is visible in the viewport
 */
const whenVisible = (element: HTMLElement, callback: () => void) => {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      // Disconnect this IntersectionObserver once seen
      io.disconnect();
      callback();
    });

    io.observe(element);
  } else {
    // IntersectionObserver is not supported so failover to calling back at the end of the call stack
    setTimeout(() => callback(), 0);
  }
};

/**
 * This function dynamically imports, and then hydrates a specific component in
 * a specific part of the page, or executes the named method from the imported
 * script.
 *
 * @param name The name of the component we want to hydrate/named function and script we want to execute.
 * @param type Determine if we want to hydrate a `component` or execute a named function from a `script`.
 * @param element The location on the DOM where the component to hydrate exists
 * @param props The props to pass to the component or arguments to the function
 */
const performImport = (
  name: string,
  type: string,
  element: HTMLElement,
  props?: Record<string, unknown>,
) => {
  let folder: string;

  if (type === 'component') {
    folder = 'components';
  } else if (type === 'script') {
    folder = 'lib';
  } else {
    throw new Error(`Unknown islet type: ${type}`);
  }

  import(
    /* webpackInclude: /\.importable\.(m?)(j|t)s(x?)/ */
    `../${folder}/${name}.importable`
  )
    .then((module) => {
      if (type === 'component') {
        console.log(`Hydrating island ${name}`);
        hydrate(createElement(module[name], props), element);
      } else if (type === 'script') {
        console.log(`Script island ${name}`);
        module[name](props);
      }

      element.setAttribute('data-gu-ready', 'true');
    })
    .catch((error) => {
      if (name && error.message.includes(name)) {
        console.error(
          `🚨 Error importing ${name}. Components must live in the root of /components and follow the [MyComponent].importable.(m?)(j|t)s(x?) naming convention 🚨`,
        );
      }
      throw error;
    });
};

/**
 * Islets are a way to partially hydrate a component in a specific part of the page,
 * or execute a named function from a script on the client.
 *
 * The code here looks for parts of the dom that have been marked using the `gu-island`
 * marker, hydrating/executing each one using the following properties:
 *
 * deferUntil - Used to optionally defer execution
 * name - The name of the component/method. Used to dynamically import the code
 * props - The data for the component that has been serialised in the dom, or arguments to the imported function
 * element - The `gu-island` custom element which is wrapping the content
 */
export const init = (): void => {
  const elements = document.querySelectorAll('gu-islet');

  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      const alreadyHydrated = element.dataset.guReady;
      if (alreadyHydrated) {
        return;
      }

      const name = element.getAttribute('data-name');
      const type = element.getAttribute('data-type');
      const deferUntil = element.getAttribute('data-defer-until');
      const props = JSON.parse(element.getAttribute('data-props') || '{}');

      if (!name || !type) {
        return;
      }

      switch (deferUntil) {
        case 'idle':
          console.log('when idle');
          whenIdle(() => performImport(name, type, element, props));
          break;
        case 'visible':
          console.log('when visible');
          whenVisible(element, () => performImport(name, type, element, props));
          break;
        default:
          console.log('now');
          performImport(name, type, element, props);
      }
    }
  });
};
