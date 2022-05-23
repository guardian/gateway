// https://developer.okta.com/docs/reference/api/groups/#group-attributes
export interface Group {
  id: string;
  profile: {
    name: string;
    description?: string;
  };
}
