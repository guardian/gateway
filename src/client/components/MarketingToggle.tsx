import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import { ToggleSwitch } from '@guardian/source-react-components-development-kitchen';
import { palette, space, textSans } from '@guardian/source-foundations';
import type { FC } from 'react';
import React from 'react';

interface MarketingToggleProps {
	id: string;
	description?: string;
	title?: string;
	selected?: boolean;
	divCss?: SerializedStyles;
	onClick: (id: string) => void;
	labelBorder?: boolean;
}

export const MarketingToggle: FC<MarketingToggleProps> = (props) => {
	const { id, description, title, selected, onClick } = props;
	return (
		<div
			css={[
				props.divCss ??
					css`
						margin-top: ${space[3]}px;
						position: relative;
						${textSans.small()}
					`,
			]}
		>
			<div css={{ left: 0 }}>
				<ToggleSwitch
					cssOverrides={css`
						display: flex;
						button {
							align-self: flex-start;
						}
						border-top: 1px solid ${palette.neutral[86]};
						padding-top: ${space[2]}px;
					`}
					label={title}
					labelPosition="left"
					fontWeight="bold"
					id={id}
					checked={!!selected}
					onClick={(e) => {
						e.preventDefault();
						onClick(id);
					}}
					labelBorder={props.labelBorder}
				/>
			</div>
			<p
				css={css`
                    margin-top: ${space[1]}px;
                    padding-right: 90px;
                }`}
			>
				{description}
			</p>
		</div>
	);
};
