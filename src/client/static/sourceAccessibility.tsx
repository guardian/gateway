// https://www.theguardian.design/2a1e5182b/p/6691bb-accessibility/t/32e9fb
// While providing a clear focus state is essential to support keyboard navigation, it is less important, and arguably distracting, for mouse users.

// Source provides a utility that manages the appearance of focus styles. When enabled, focus styles will be hidden while the user interacts using the mouse. They will appear when the tab key is pressed to begin keyboard navigation.
export const init = () => {
  import('@guardian/source-foundations').then(({ FocusStyleManager }) => {
    FocusStyleManager.onlyShowFocusOnTabs();
  });
};
