import React from 'react';
import {
	ErrorSummary,
	ErrorSummaryProps,
} from '@guardian/source-development-kitchen/react-components';
import { asStructuredError, GatewayError } from '@/shared/model/Errors';
import {
	errorContextLastTypeSpacing,
	errorContextSpacing,
	errorMessageStyles,
} from '@/client/styles/Shared';

interface GateWayErrorSummaryProps
	extends Omit<ErrorSummaryProps, 'message' | 'cssOverrides'> {
	shortRequestId?: string;
	gatewayError?: GatewayError;
}

export const GatewayErrorSummary = (props: GateWayErrorSummaryProps) => {
	const structuredError = asStructuredError(props.gatewayError);
	const fullContext = [
		props.context,
		// A CSRF error is likely to be the first error a user sees if they have cookies disabled
		// so enrich it with some extra details about how to enable cookies.
		...(structuredError?.severity === 'CSRF'
			? [
					<p>
						If the problem persists please check if your browser has cookies
						enabled. You can find details on how to enable cookies in our{' '}
						<a href="https://www.theguardian.com/info/cookies#how-to-manage-cookies-at-the-guardian">
							Cookies FAQ
						</a>
						.
					</p>,
				]
			: []),
		...(props.shortRequestId && structuredError?.severity !== 'BAU'
			? [
					<p
						css={[errorContextSpacing, errorContextLastTypeSpacing]}
						key={'requestId'}
					>
						Request ID: {props.shortRequestId}
					</p>,
				]
			: []),
	];

	return (
		<ErrorSummary
			{...props}
			context={fullContext}
			message={structuredError?.message}
			cssOverrides={errorMessageStyles}
		></ErrorSummary>
	);
};
