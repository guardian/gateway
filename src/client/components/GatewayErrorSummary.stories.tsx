import { Meta } from '@storybook/react';
import React from 'react';
import { GatewayErrorSummary } from '@/client/components/GatewayErrorSummary';
import { StructuredGatewayError } from '@/shared/model/Errors';
import {
	errorContextLastTypeSpacing,
	errorContextSpacing,
} from '@/client/styles/Shared';

export default {
	title: 'Components/GatewayErrorSummary',
	component: GatewayErrorSummary,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => (
	<GatewayErrorSummary
		gatewayError="Literally everything went wrong"
		shortRequestId="123e4567"
		context="Not a single thing went right"
	></GatewayErrorSummary>
);
Default.storyName = 'default';

export const WithoutContextOrRequestId = () => (
	<GatewayErrorSummary gatewayError="something went wrong but we have no context about it."></GatewayErrorSummary>
);

const bauError: StructuredGatewayError = {
	message: 'You entered a field wrong or something',
	severity: 'BAU',
};

export const WithStructuredBAUError = () => (
	<GatewayErrorSummary
		gatewayError={bauError}
		context={
			<p css={[errorContextSpacing, errorContextLastTypeSpacing]}>
				since this is a BAU error we do not display the request id here
			</p>
		}
		shortRequestId="123e4567"
	></GatewayErrorSummary>
);

const UnexpectedError: StructuredGatewayError = {
	message: 'An unexpected error happened unexpectedly',
	severity: 'UNEXPECTED',
};

export const WithStructuredUnexpectedError = () => (
	<GatewayErrorSummary
		gatewayError={UnexpectedError}
		context={
			<p css={[errorContextSpacing, errorContextLastTypeSpacing]}>
				Since this was not expected we display the request id
			</p>
		}
		shortRequestId="123e4567"
	></GatewayErrorSummary>
);

const CsrfError: StructuredGatewayError = {
	message: 'An unexpected error happened unexpectedly',
	severity: 'CSRF',
};

export const WithStructuredCSRFError = () => (
	<GatewayErrorSummary
		gatewayError={CsrfError}
		context={
			<p css={[errorContextSpacing, errorContextLastTypeSpacing]}>
				Since this was a CSRF error we show cookie help details
			</p>
		}
		shortRequestId="123e4567"
	></GatewayErrorSummary>
);
