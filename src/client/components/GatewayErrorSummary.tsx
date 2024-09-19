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

export interface GateWayErrorSummaryProps
	extends Omit<ErrorSummaryProps, 'message' | 'cssOverrides'> {
	shortRequestId?: string;
	gatewayError?: GatewayError;
}

export const GatewayErrorSummary = (props: GateWayErrorSummaryProps) => {
	const structuredError = asStructuredError(props.gatewayError);
	const fullContext =
		props.shortRequestId && structuredError?.severity !== 'BAU'
			? [
					props.context,
					<p
						css={[errorContextSpacing, errorContextLastTypeSpacing]}
						key={'requestId'}
					>
						Request ID: {props.shortRequestId}
					</p>,
				]
			: props.context;

	return (
		<ErrorSummary
			{...props}
			context={fullContext}
			message={structuredError?.message}
			cssOverrides={errorMessageStyles}
		></ErrorSummary>
	);
};
