type Props = {
  base?: string;
  path: string;
  token?: string;
  isIdapiUrl?: boolean;
};

export const generateUrl = ({
  base = process.env.OKTA_ORG_URL,
  path,
  token,
  isIdapiUrl = false,
}: Props) => {
  const urlParts = [
    base,
    '/',
    path,
    token ? `/${token}` : '',
    isIdapiUrl ? '?useIdapi=true' : '',
  ];
  return urlParts.join('');
};
