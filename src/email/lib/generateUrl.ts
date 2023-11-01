type Props = {
	base?: string;
	path: string;
	token?: string;
	isIdapiUrl?: boolean;
	consents?: string;
};

export const generateUrl = ({
	base = process.env.OKTA_ORG_URL,
	path,
	token,
	isIdapiUrl = false,
	consents,
}: Props) => {
	const urlParts = [
		base,
		'/',
		path,
		token ? `/${token}` : '',
		consents ? `/${consents}` : '',
		isIdapiUrl ? '?useIdapi=true' : '',
	];
	return urlParts.join('');
};
