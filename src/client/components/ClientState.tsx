import React, {
	createContext,
	FunctionComponent,
	PropsWithChildren,
} from 'react';

import { ClientState } from '@/shared/model/ClientState';

export const defaultClientState = {
	clientHosts: { idapiBaseUrl: '', oauthBaseUrl: '' },
	recaptchaConfig: { recaptchaSiteKey: '' },
	queryParams: {
		returnUrl: 'https://theguardian.com',
	},
};

export const ClientStateContext =
	createContext<ClientState>(defaultClientState);

type ClientStateProps = {
	clientState: ClientState;
};

export const ClientStateProvider: FunctionComponent<
	PropsWithChildren<ClientStateProps>
> = (props) => {
	return (
		<ClientStateContext.Provider value={props.clientState}>
			{props.children}
		</ClientStateContext.Provider>
	);
};
