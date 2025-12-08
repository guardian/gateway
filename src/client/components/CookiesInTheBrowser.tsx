import { css } from '@emotion/react';
import { remSpace, textSans15 } from '@guardian/source/foundations';
import { MainBodyText } from '@/client/components/MainBodyText';

const styledText = css`
	${textSans15}
`;

const mainBodyTextMarginTopStyles = css`
	margin-top: ${remSpace[2]};
`;

export const CookiesInTheBrowser = () => {
	return (
		<MainBodyText>
			<details>
				<summary css={[styledText, { marginBottom: remSpace[2] }]}>
					Cookies in the browser:
				</summary>
				<MainBodyText>
					When we make the Guardian available for you online, we use cookies and
					similar technologies to help us to do this. Some are necessary to help
					our website work properly and can’t be switched off, and some are
					optional but may support your experience in other ways or help support
					the Guardian, including through personalised advertising.
				</MainBodyText>
				<MainBodyText cssOverrides={mainBodyTextMarginTopStyles}>
					If you read the Guardian ad free or subscribe to Guardian Ad-Lite, you
					can manage the use of cookies on our site for personalised
					advertising, and disable the sharing of data with partners for
					personalised advertising purposes by clicking the "Privacy settings"
					link in the footer of every page of our site.
				</MainBodyText>
			</details>
		</MainBodyText>
	);
};
