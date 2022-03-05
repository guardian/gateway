export const removeQueryParam = (search: string, param: string) => {
  const qs = new URLSearchParams(search);
  qs.delete(param);
  return qs.toString();
};
