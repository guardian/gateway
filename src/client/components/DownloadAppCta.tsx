import {
	Hide,
	LinkButton,
	SvgDownload,
} from '@guardian/source/react-components';
import { css } from '@emotion/react';
import {
	APPLE_STORE,
	FEAST_QR_CODE,
	GOOGLE_PLAY,
	GUARDIAN_QR_CODE,
} from '@/client/assets/decorative';
import { detectDevice } from '@/client/lib/getDeviceType';
import {
	neutral,
	remSpace,
	textSansBold12,
} from '@guardian/source/foundations';

interface DownloadAppCtaProps {
	title: string;
}

interface QrCodeProps {
	title: string;
}

interface DownloadButtonProps {
	title: string;
}

const GUARDIAN_APP = 'https://guardian.go.link/home?adj_t=23c4pq34';
const FEAST_APP = 'https://guardian-feast.go.link/home?adj_t=23zc21c3';

const styles = css`
	display: grid;
	grid-template-columns: 2fr 3fr;
	grid-template-areas:
		'apple_store_button qr_code'
		'google_play_button qr_code';
	gap: 8px;
`;

const qrCodeImageStyles = css`
	display: flex;
	flex-direction: column;

	${textSansBold12};
	gap: ${remSpace[1]};
`;

const qrCodeStyles = css`
	grid-area: qr_code;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		height: 90px;
		border-left: 1px solid ${neutral[73]};
	}
`;

const appleStoreButtonStyles = css`
	grid-area: apple_store_button;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
`;

const DownloadButton = ({ title }: DownloadButtonProps) => {
	return (
		<>
			<Hide from="tablet">
				<LinkButton
					href={title === 'The Guardian app' ? GUARDIAN_APP : FEAST_APP}
					priority="primary"
					size="xsmall"
					type="button"
					isLoading={false}
					icon={SvgDownload({
						size: 'xsmall',
					})}
				>
					Download
				</LinkButton>
			</Hide>
			<Hide until="tablet">
				<LinkButton
					href={title === 'The Guardian app' ? GUARDIAN_APP : FEAST_APP}
					priority="primary"
					size="small"
					type="button"
					isLoading={false}
					icon={SvgDownload({
						size: 'small',
					})}
				>
					Download
				</LinkButton>
			</Hide>
		</>
	);
};

const AppleStoreButton = () => {
	return (
		<div css={appleStoreButtonStyles}>
			<img
				css={css`
					width: 120px;
					height: 40px;
				`}
				alt="Apple store button"
				src={APPLE_STORE}
			/>
		</div>
	);
};

const GoogleStoreButton = () => {
	return (
		<div
			css={css`
				grid-area: google_play_button;
			`}
		>
			<img
				css={css`
					width: 120px;
					height: 40px;
				`}
				alt="Google Play button"
				src={GOOGLE_PLAY}
			/>
		</div>
	);
};

const QrCode = ({ title }: QrCodeProps) => {
	return (
		<div css={qrCodeStyles}>
			<figure className="qr_code" css={qrCodeImageStyles}>
				<img
					css={css`
						width: 74px;
						height: 74px;
					`}
					alt={`Scan to get the Guardian ${title === 'Guardian Feast app' ? 'Feast' : ''} app`}
					src={title === 'The Guardian app' ? GUARDIAN_QR_CODE : FEAST_QR_CODE}
				/>
				<figcaption>Scan to get the App</figcaption>
			</figure>
		</div>
	);
};

export const DownloadAppCta = ({ title }: DownloadAppCtaProps) => {
	const device = detectDevice();

	if (device === 'mobile') {
		return <DownloadButton title={title} />;
	}

	return (
		<div css={styles}>
			<AppleStoreButton />
			<GoogleStoreButton />
			<QrCode title={title} />
		</div>
	);
};
