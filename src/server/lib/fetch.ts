import { RequestInit } from 'node-fetch';

// Imports the node-fetch library asynchonously using import(), supported in CJS since node v12.17.
// This solution avoids the import() being transpiled into a require() by Webpack/Typescript.
// Subsequent fetch requests will not re-import the module because it's cached after first load.
// Change necessary because of switch to ESM in version 3.x and our use of CJS.
// Solution taken from: https://github.com/node-fetch/node-fetch/issues/1279#issuecomment-915063354
const _importDynamic = new Function('modulePath', 'return import(modulePath)');
export async function fetch(...args: (string | RequestInit | undefined)[]) {
  const { default: fetch } = await _importDynamic('node-fetch');
  return fetch(...args);
}
