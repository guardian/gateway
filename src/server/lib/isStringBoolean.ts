export const isStringBoolean = (maybeBoolean?: string): boolean | undefined => {
  if (!maybeBoolean) {
    return undefined;
  }

  if (maybeBoolean === 'true') {
    return true;
  }

  return false;
};
