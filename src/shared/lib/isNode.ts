export const isNode = process?.release?.name === 'node';
export const isBrowser = !isNode;
