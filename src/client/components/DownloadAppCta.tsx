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

interface DownloadAppCtaProps {
	title: string;
}

const GUARDIAN_APP = 'https://guardian.go.link/home?adj_t=23c4pq34';
const FEAST_APP = 'https://guardian-feast.go.link/home?adj_t=23zc21c3';

const styles = () => css`
	display: grid;
	grid-template-areas:
		'apple_store_button line qr_code'
		'google_play_button line qr_code';
`;

export const DownloadAppCta = ({ title }: DownloadAppCtaProps) => {
	const device = detectDevice();

	if (device === 'mobile') {
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
	}

	return (
		<div css={styles}>
			<div
				css={css`
					grid-area: apple_store_button;
				`}
			>
				<img
					css={css`
						width: 120px;
						height: 40px;
					`}
					alt="Apple store button"
					src={APPLE_STORE}
				/>
			</div>
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
			<div
				css={css`
					grid-area: line;
				`}
			></div>
			<div
				css={css`
					grid-area: qr_code;
				`}
			>
				<img
					css={css`
						width: 74px;
						height: 74px;
					`}
					alt={`Scan to get the Guardian ${title === 'Guardian Feast app' ? 'Feast' : ''} app`}
					src={title === 'The Guardian app' ? GUARDIAN_QR_CODE : FEAST_QR_CODE}
				/>
			</div>
		</div>
	);
};
