import { SuccessSummary } from '@guardian/source-development-kitchen/react-components';
import { successMessageStyles } from '../styles/Shared';
import useClientState from '../lib/hooks/useClientState';

export const LayoutSuccessBoundary = ({
	successOverride,
	errorOverride,
}: {
	successOverride?: string;
	errorOverride?: string;
}) => {
	const clientState = useClientState();
	const { globalMessage: { error, success } = {} } = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;
	return (
		<>
			{successMessage && !errorMessage && (
				<SuccessSummary
					message={successMessage}
					cssOverrides={successMessageStyles}
				/>
			)}
		</>
	);
};
