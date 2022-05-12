type Props = {
  base?: string;
  path: string;
  token?: string;
  isOktaUrl?: boolean;
};

export const generateUrl = ({
  base = process.env.OKTA_ORG_URL,
  path,
  token,
  isOktaUrl = true,
}: Props) => {
  const urlParts = [
    base,
    '/',
    path,
    token ? `/${token}` : '',
    isOktaUrl ? '?useOkta=true' : '',
  ];
  return urlParts.join('');
};
