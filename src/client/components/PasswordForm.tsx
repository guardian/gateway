import React, {
	PropsWithChildren,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import { textSans15 } from '@guardian/source/foundations';
import { css } from '@emotion/react';
import {
	PasswordAutoComplete,
	PasswordInput,
} from '@/client/components/PasswordInput';
import { FieldError } from '@/shared/model/ClientState';
import {
	PasswordFieldErrors,
	ShortPasswordFieldErrors,
} from '@/shared/model/Errors';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { MainForm } from '@/client/components/MainForm';
import { logger } from '@/client/lib/clientSideLogger';
import {
	SvgAlertRound,
	SvgInfoRound,
	SvgTickRound,
} from '@guardian/source/react-components';

type Props = {
	submitUrl: string;
	fieldErrors: FieldError[];
	submitButtonText: string;
	labelText: string;
	recaptchaSiteKey?: string;
	setRecaptchaErrorMessage?: React.Dispatch<React.SetStateAction<string>>;
	setRecaptchaErrorContext?: React.Dispatch<React.SetStateAction<ReactNode>>;
	autoComplete?: PasswordAutoComplete;
	formTrackingName?: string;
	onInvalid?: React.FormEventHandler<HTMLFormElement> | undefined;
	formError?: string;
	browserName?: string;
	largeFormMarginTop?: boolean;
};

const baseMessageStyles = css`
	${textSans15};
	display: flex;
	align-items: center;
`;

const InfoMessage = ({ children }: { children: ReactNode }) => {
	const infoMessageStyles = css`
		${baseMessageStyles};
		color: var(--color-alert-info);
		svg {
			fill: var(--color-alert-info);
		}
	`;
	return (
		<div css={infoMessageStyles}>
			<SvgInfoRound size="small" />
			{children}
		</div>
	);
};

const AlertMessage = ({ children }: { children: ReactNode }) => {
	const alertMessageStyles = css`
		${baseMessageStyles};
		color: var(--color-alert-error);
		svg {
			fill: var(--color-alert-error);
		}
	`;

	return (
		<div css={alertMessageStyles}>
			<SvgAlertRound size="small" />
			{children}
		</div>
	);
};

const SuccessMessage = ({ children }: { children: ReactNode }) => {
	const successMessageStyles = css`
		${baseMessageStyles};
		color: var(--color-alert-success);
		svg {
			fill: var(--color-alert-success);
		}
	`;

	return (
		<div css={successMessageStyles}>
			<SvgTickRound size="small" />
			{children}
		</div>
	);
};

const TooLong = () => (
	<AlertMessage>{ShortPasswordFieldErrors.MAXIMUM_72}</AlertMessage>
);

const TooShort = () => (
	<AlertMessage>{ShortPasswordFieldErrors.AT_LEAST_8}</AlertMessage>
);

const ValidLength = () => (
	<SuccessMessage>{ShortPasswordFieldErrors.AT_LEAST_8}</SuccessMessage>
);

const LengthRequired = () => (
	<InfoMessage>{ShortPasswordFieldErrors.AT_LEAST_8}</InfoMessage>
);

const Checking = () => <InfoMessage>Checking...</InfoMessage>;

const Weak = () => (
	<AlertMessage>{ShortPasswordFieldErrors.WEAK_PASSWORD}</AlertMessage>
);

const StrongPasswordRequired = () => (
	<InfoMessage>{ShortPasswordFieldErrors.STRONG_PASSWORD_REQUIRED}</InfoMessage>
);

const StrongPassword = () => (
	<SuccessMessage>
		{ShortPasswordFieldErrors.STRONG_PASSWORD_REQUIRED}
	</SuccessMessage>
);

const ValidationMessage = ({
	isDirty,
	isWeak,
	isTooShort,
	isTooLong,
	isChecking,
}: {
	isDirty: boolean;
	isWeak: boolean;
	isTooShort: boolean;
	isTooLong: boolean;
	isChecking: boolean;
}) => {
	// eslint-disable-next-line functional/no-let
	let lengthMessage, complexityMessage;
	if (!isDirty) {
		return (
			<div>
				<LengthRequired />
				<StrongPasswordRequired />
			</div>
		);
	}
	if (isTooShort) {
		lengthMessage = <TooShort />;
	} else if (isTooLong) {
		lengthMessage = <TooLong />;
	} else {
		lengthMessage = <ValidLength />;
	}
	if (isChecking) {
		complexityMessage = <Checking />;
	} else if (isWeak) {
		complexityMessage = <Weak />;
	} else {
		complexityMessage = <StrongPassword />;
	}
	return (
		<div>
			{lengthMessage}
			{complexityMessage}
		</div>
	);
};

const cryptoSubtleFeatureTest = (browserName?: string): boolean => {
	try {
		return (
			browserName?.toLowerCase() !== 'internet explorer' &&
			typeof window !== 'undefined' &&
			'crypto' in window &&
			'subtle' in window.crypto &&
			'digest' in window.crypto.subtle
		);
	} catch (e) {
		logger.error('Error testing for crypto.subtle support', e);
		return false;
	}
};

const sha1 = async (str: string): Promise<string> => {
	const buffer = new TextEncoder().encode(str);
	const hash = await crypto.subtle.digest('SHA-1', buffer);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
};

const isBreached = AwesomeDebouncePromise(
	async (password: string): Promise<boolean> => {
		try {
			const hashedPassword = await sha1(password);
			const firstFive = hashedPassword.substring(0, 5);
			const remainingHash = hashedPassword.substring(5);

			const response = await fetch(
				`https://api.pwnedpasswords.com/range/${firstFive}`,
			);

			if (response.ok) {
				const text = await response.text();

				if (text.includes(remainingHash.toUpperCase())) {
					return true;
				}
			} else {
				logger.warn(
					'breach password check failed with status',
					response.status,
				);
			}

			// return false as the password is not breached or a fallback in case the api is down
			return false;
		} catch (error) {
			logger.warn('breach password check failed with error', error);
			return false;
		}
	},
	300,
);

export const PasswordForm = ({
	children,
	submitUrl,
	fieldErrors,
	submitButtonText,
	labelText,
	recaptchaSiteKey,
	setRecaptchaErrorMessage,
	setRecaptchaErrorContext,
	autoComplete,
	formTrackingName,
	formError,
	browserName,
}: PropsWithChildren<Props>) => {
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState<string | undefined>(
		fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
	);
	const [isWeak, setIsWeak] = useState<boolean>(false);
	const [isTooShort, setIsTooShort] = useState<boolean>(true);
	const [isTooLong, setIsTooLong] = useState<boolean>(false);
	const [isChecking, setIsChecking] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const handleSetPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		setIsDirty(e.target.value.length > 0);
	};

	useEffect(() => {
		// Typing anything clears the big red error, falling back to the dynamic validation message
		if (password.length > 0) setError(undefined);
		setIsTooShort(password.length < 8);
		setIsTooLong(password.length > 72);

		if (password.length >= 8 && password.length <= 72) {
			// Only make api calls to check if breached when length rules are not broken
			setIsChecking(true);
			if (cryptoSubtleFeatureTest(browserName)) {
				void isBreached(password).then((breached) => {
					if (breached) {
						// Password is breached ❌
						setIsWeak(true);
					} else {
						// Password is valid ✔
						setIsWeak(false);
					}
					setIsChecking(false);
				});
			} else {
				// Assume password is valid if crypto.subtle is not supported
				// will be checked on the server side anyway for breached passwords
				setIsWeak(false);
				setIsChecking(false);
			}
		} else {
			// Password is not an acceptable length ❌
			setIsWeak(false);
		}
	}, [browserName, password]);

	return (
		<MainForm
			formAction={submitUrl}
			submitButtonText={submitButtonText}
			onSubmit={(e) => {
				// eslint-disable-next-line functional/no-let
				let errorOccurred = false;

				if (isTooShort) {
					setError(PasswordFieldErrors.AT_LEAST_8);
					errorOccurred = true;
					e.preventDefault();
				} else if (isTooLong) {
					setError(PasswordFieldErrors.MAXIMUM_72);
					errorOccurred = true;
					e.preventDefault();
				} else if (isWeak) {
					setError(PasswordFieldErrors.COMMON_PASSWORD);
					errorOccurred = true;
					e.preventDefault();
				}

				return {
					errorOccurred,
				};
			}}
			recaptchaSiteKey={recaptchaSiteKey}
			setRecaptchaErrorMessage={setRecaptchaErrorMessage}
			setRecaptchaErrorContext={setRecaptchaErrorContext}
			formTrackingName={formTrackingName}
			disableOnSubmit={true}
			formErrorMessageFromParent={formError}
		>
			{children}
			<PasswordInput
				error={error}
				label={labelText}
				onChange={handleSetPassword}
				displayEye={true}
				autoComplete={autoComplete}
			/>
			{!error && (
				<ValidationMessage
					isDirty={isDirty}
					isWeak={isWeak}
					isTooShort={isTooShort}
					isTooLong={isTooLong}
					isChecking={isChecking}
				/>
			)}
		</MainForm>
	);
};
