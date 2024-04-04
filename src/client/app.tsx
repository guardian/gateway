import React, { useEffect } from 'react';
import { css, Global } from '@emotion/react';
import { neutral } from '@guardian/source-foundations';
import { fontFaces } from '@/client/lib/fonts';
import { ClientStateProvider } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { GatewayRoutes } from '@/client/routes';
import { tests } from '@/shared/model/experiments/abTests';
import { useAB } from '@/client/components/ABReact';

interface Props extends ClientState {
	location: string;
}

export const App = (props: Props) => {
	// initialise the AB Test Framework:
	// load the AB Hook
	const ABTestAPI = useAB();

	// use effect to initialise and register events if needed
	useEffect(() => {
		// get all runnable tests
		const allRunnableTests = ABTestAPI.allRunnableTests(tests);
		// track them in ophan
		ABTestAPI.trackABTests(allRunnableTests);
		// register any impression events
		ABTestAPI.registerImpressionEvents(allRunnableTests);
		// register any completion events
		ABTestAPI.registerCompleteEvents(allRunnableTests);
	}, [ABTestAPI]);

	return (
		<>
			<Global
				styles={css`
					${fontFaces}
					html {
						height: 100%;
						box-sizing: border-box;
					}
					body {
						height: 100%;
						color: ${neutral[7]};
					}
					#app {
						min-height: 100%;
						display: flex;
						flex-direction: column;
					}
					*,
					*:before,
					*:after {
						box-sizing: inherit;
					}
					/* Badge is hidden for Gateway, because we're using
          the legal text to do this job */
					.grecaptcha-badge {
						visibility: hidden;
					}
				`}
			/>
			<ClientStateProvider clientState={props}>
				<GatewayRoutes location={props.location} />
			</ClientStateProvider>
		</>
	);
};
