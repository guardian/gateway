import React, {
	PropsWithChildren,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import {
	Button,
	SvgInfo,
	SvgAlertTriangle,
	SvgCheckmark,
} from '@guardian/source-react-components';
import {
	success,
	error,
	neutral,
	textSans,
	space,
} from '@guardian/source-foundations';
import { CsrfFormField } from '@/client/components/CsrfFormField';
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
import { AutoRow } from '@/client/styles/Grid';
import { MainForm } from '@/client/components/MainForm';
import { passwordButton, controls } from '@/client/styles/Consents';
import { trackFormFocusBlur, trackFormSubmit } from '@/client/lib/ophan';
import { logger } from '@/client/lib/clientSideLogger';

type Props = {
	submitUrl: string;
	fieldErrors: FieldError[];
	submitButtonText: string;
	labelText: string;
	// for grid layout on consents page
	gridAutoRow?: AutoRow;
	recaptchaSiteKey?: string;
	setRecaptchaErrorMessage?: React.Dispatch<React.SetStateAction<string>>;
	setRecaptchaErrorContext?: React.Dispatch<React.SetStateAction<ReactNode>>;
	autoComplete?: PasswordAutoComplete;
	formTrackingName?: string;
	onInvalid?: React.FormEventHandler<HTMLFormElement> | undefined;
	formError?: string;
	browserName?: string;
};

const feedbackMessageStyles = css`
	display: flex;
	align-items: flex-start;
	min-height: ${space[6]}px;
	div:first-of-type {
		width: ${space[6]}px;
	}
`;

const feedbackMessageIconStyles = css`
	display: flex;
	position: relative;
	top: 3px;
	svg {
		color: ${neutral[46]};
	}
`;

const smallIconStyles = css`
	svg {
		height: 18px;
		width: 18px;
		position: relative;
	}
`;

const baseMessageStyles = css`
	${textSans.small()};
	color: ${neutral[46]};
`;

const errorIconStyles = css`
	position: static;
	svg {
		fill: ${error['400']};
		height: 24px;
		width: 24px;
	}
`;

const redText = css`
	color: ${error[400]};
`;

const form = css`
	padding-top: ${space[3]}px;
`;

const passwordInput = css`
	margin-bottom: ${space[2]}px;
`;

const TooLong = () => {
	return (
		<div css={feedbackMessageStyles}>
			<div css={[feedbackMessageIconStyles, errorIconStyles]}>
				<SvgAlertTriangle />
			</div>
			<div css={[baseMessageStyles, redText]}>
				{ShortPasswordFieldErrors.MAXIMUM_72}
			</div>
		</div>
	);
};

const TooShort = () => {
	const infoIconStyles = css`
		svg {
			fill: ${neutral[46]};
			border-radius: 50%;
			/* Bit of a hack - the SVG for the tick icon is positioned more fully
       inside its viewBox than the SVG for the info icon, so this forces the
       info icon to take up the same amount of pixel space. */
			transform: scale(1.355);
		}
	`;

	return (
		<div css={feedbackMessageStyles}>
			<div css={[feedbackMessageIconStyles, smallIconStyles, infoIconStyles]}>
				<SvgInfo />
			</div>
			<div css={baseMessageStyles}>{ShortPasswordFieldErrors.AT_LEAST_8}</div>
		</div>
	);
};

const Valid = () => {
	const successIconStyles = css`
		svg {
			background: ${success[400]};
			fill: ${neutral[100]};
			border-radius: 50%;
		}
	`;

	return (
		<div css={feedbackMessageStyles}>
			<div
				css={[feedbackMessageIconStyles, smallIconStyles, successIconStyles]}
			>
				<SvgCheckmark />
			</div>
			<div
				css={[
					baseMessageStyles,
					css`
						font-weight: bold;
						color: ${success[400]};
					`,
				]}
			>
				Valid password
			</div>
		</div>
	);
};

const Checking = () => {
	return (
		<div css={feedbackMessageStyles}>
			<div css={baseMessageStyles}>Checking...</div>
		</div>
	);
};

const Weak = () => {
	return (
		<div css={feedbackMessageStyles}>
			<div css={[feedbackMessageIconStyles, errorIconStyles]}>
				<SvgAlertTriangle />
			</div>
			<div css={[baseMessageStyles, redText]}>
				<strong>Weak password:</strong>{' '}
				{ShortPasswordFieldErrors.COMMON_PASSWORD}
			</div>
		</div>
	);
};

const ValidationMessage = ({
	isWeak,
	isTooShort,
	isTooLong,
	isChecking,
}: {
	isWeak: boolean;
	isTooShort: boolean;
	isTooLong: boolean;
	isChecking: boolean;
}) => {
	if (isTooShort) {
		return <TooShort />;
	} else if (isTooLong) {
		return <TooLong />;
	} else if (isChecking) {
		return <Checking />;
	} else if (isWeak) {
		return <Weak />;
	} else {
		return <Valid />;
	}
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
	submitUrl,
	fieldErrors,
	submitButtonText,
	labelText,
	gridAutoRow,
	autoComplete,
	formTrackingName,
	onInvalid,
	children,
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
	const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);

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
		<form
			css={[form, gridAutoRow && gridAutoRow()]}
			method="post"
			action={submitUrl}
			onSubmit={(e) => {
				if (formTrackingName) {
					trackFormSubmit(formTrackingName);
				}
				if (isTooShort) {
					setError(PasswordFieldErrors.AT_LEAST_8);
				} else if (isTooLong) {
					setError(PasswordFieldErrors.MAXIMUM_72);
				} else if (isWeak) {
					setError(PasswordFieldErrors.COMMON_PASSWORD);
				}
				// If there are errors, don't submit the form and return here
				if (isTooShort || isTooLong || isWeak) {
					e.preventDefault();
					return;
				}
				// If there are no errors, disable the form and submit it
				setIsFormDisabled(true);
			}}
			onFocus={(e) =>
				formTrackingName && trackFormFocusBlur(formTrackingName, e, 'focus')
			}
			onBlur={(e) =>
				formTrackingName && trackFormFocusBlur(formTrackingName, e, 'blur')
			}
			onInvalid={onInvalid}
		>
			<CsrfFormField />
			{children}
			<div css={passwordInput}>
				<PasswordInput
					displayEye={true}
					error={error}
					label={labelText}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					autoComplete={autoComplete}
				/>
			</div>
			{!error && (
				<ValidationMessage
					isWeak={isWeak}
					isTooShort={isTooShort}
					isTooLong={isTooLong}
					isChecking={isChecking}
				/>
			)}

			<div css={controls}>
				<Button
					css={passwordButton}
					type="submit"
					iconSide="right"
					data-cy="change-password-button"
					isLoading={isFormDisabled}
					disabled={isFormDisabled}
					aria-disabled={isFormDisabled}
				>
					{submitButtonText}
				</Button>
			</div>
		</form>
	);
};

// this is mostly duplicated from the form above, as the above form is still
// being used on the welcome/onboarding page until that is redesigned
// so we created this new component to use with the `MainLayout` for the time being
export const PasswordFormMainLayout = ({
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
}: Props) => {
	const [password, setPassword] = useState<string>('');
	const [error, setError] = useState<string | undefined>(
		fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
	);
	const [isWeak, setIsWeak] = useState<boolean>(false);
	const [isTooShort, setIsTooShort] = useState<boolean>(true);
	const [isTooLong, setIsTooLong] = useState<boolean>(false);
	const [isChecking, setIsChecking] = useState<boolean>(false);

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
			<div css={error ? undefined : passwordInput}>
				<PasswordInput
					error={error}
					label={labelText}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					displayEye={true}
					autoComplete={autoComplete}
				/>
			</div>
			{!error && (
				<ValidationMessage
					isWeak={isWeak}
					isTooShort={isTooShort}
					isTooLong={isTooLong}
					isChecking={isChecking}
				/>
			)}
		</MainForm>
	);
};
