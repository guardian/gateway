import { GatewayErrorSummary } from '../components/GatewayErrorSummary';
import locations from '@/shared/lib/locations';
import useClientState from '../lib/hooks/useClientState';

export const ErrorLayout = ({
	errorOverride,
	errorContext,
	showErrorReportUrl,
	shortRequestId,
}: {
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	shortRequestId?: string;
}) => {
	const clientState = useClientState();
	const { globalMessage: { error } = {} } = clientState;

	const errorMessage = errorOverride || error;
	return (
		<>
			{errorMessage && (
				<GatewayErrorSummary
					gatewayError={errorMessage}
					context={errorContext}
					shortRequestId={shortRequestId}
					errorReportUrl={
						showErrorReportUrl ? locations.REPORT_ISSUE : undefined
					}
				/>
			)}
		</>
	);
};
