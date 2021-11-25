// Used to mock the `load` and `error` events for scripts so the @guardian/libs `loadScript` method functions as intended.
// Based on the original technique used on line 10 of https://github.com/guardian/libs/blob/main/src/loadScript.test.ts
// when we detect that a script has been added to the DOM:
// - if the src is the recaptcha script, trigger a load event
// - if the src is not the recaptcha script, trigger an error event
export const setupRecaptchaScriptMutationObserver = (
  validRecaptchaScriptUrl = 'https://www.google.com/recaptcha/api.js?render=explicit',
  invalidRecaptchaScriptUrl = 'bad-url',
) => {
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode.nodeName === 'SCRIPT') {
          const addedScript = addedNode as HTMLScriptElement;

          if (addedScript.src.includes(validRecaptchaScriptUrl)) {
            addedNode.dispatchEvent(new Event('load'));
          }

          if (addedScript.src.includes(invalidRecaptchaScriptUrl)) {
            addedNode.dispatchEvent(new Event('error'));
          }
        }
      });
    });
  }).observe(document.body, {
    childList: true,
  });
};

/**
 * Sets up a mock grecaptcha object on window to be used by the `useRecaptcha` hook.
 * Adds a script to the DOM to trigger the `load` event on the recaptcha script.
 */
export const setupRecaptchaObject = () => {
  // Define grecpatcha on the window object so we can mock it.
  Object.defineProperty(global.window, 'grecaptcha', {
    configurable: true,
    get() {
      return this.stored_x;
    },
  });

  // Set up test so a script is on the body so we can mock the loadScript method from @guardian/libs.
  document.body.setAttribute('innerHTML', '');
  document.body.appendChild(document.createElement('script'));
};
