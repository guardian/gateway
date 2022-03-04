import React from 'react';
import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import type { Props } from '@guardian/source-react-components';
import { css } from '@emotion/react';
import {
  neutral,
  success,
  textSans,
  focusHalo,
  visuallyHidden,
  descriptionId,
  generateSourceId,
} from '@guardian/source-foundations';

const inputStyles = css`
  ${visuallyHidden}
`;

const labelStyles = css`
  user-select: none;
  position: relative;
  ${textSans.small()};
  display: flex;
  color: ${neutral[7]};
  align-items: center;
  cursor: pointer;
`;

const siblingStyles = css`
  input + span {
    background-color: rgba(153, 153, 153, 0.5);
  }

  input:focus + span {
    ${focusHalo};
  }

  input:checked + span {
    background: ${success[500]};
  }

  input:checked + span:before {
    opacity: 1;
    z-index: 1;
  }

  input:checked + span:after {
    left: 1.375rem;
    background: ${neutral[100]};
  }
`;

const switchStyles = css`
  flex: none;
  border: none;
  margin: 0px 0px 0px 8px;
  padding: 0;
  display: inline-block;
  text-align: center;
  position: relative;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  cursor: pointer;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 15.5px;

  &:before {
    content: '';
    position: absolute;
    top: 6px;
    height: 11px;
    width: 6px;
    right: 10px;
    opacity: 0;
    border-bottom: 2px solid ${success[400]};
    border-right: 2px solid ${success[400]};
    transform: rotate(45deg);
    transition: opacity 0.1s ease-in;
  }

  &:after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: #fff;
    will-change: left;
    transition: left 0.15s ease-in-out;
    height: 18px;
    width: 18px;
    top: 3px;
    left: 4px;
  }
`;

export interface ToggleSwitchInputProps extends Props {
  /**
   * Whether the ToggleSwitch is checked.
   * Gateway uses the [uncontrolled approach](https://reactjs.org/docs/uncontrolled-components.html),
   * Use defaultChecked to indicate the whether the ToggleSwitch is checked initially.
   */
  defaultChecked?: boolean;
  /**
   * Optional Id for the switch. Defaults to a generated indexed Source ID e.g. "src-component-XXX}"
   */
  id?: string;
  /**
   * Appears to the left of the switch by default.
   */
  label?: string;
}

export const ToggleSwitchInput = ({
  id,
  label,
  defaultChecked,
  cssOverrides,
}: ToggleSwitchInputProps): EmotionJSX.Element => {
  const switchName = id ?? generateSourceId();
  const labelId = descriptionId(switchName);

  return (
    <label id={labelId} css={[labelStyles, siblingStyles, cssOverrides]}>
      {label}
      <input
        css={inputStyles}
        name={switchName}
        type="checkbox"
        role="switch"
        defaultChecked={defaultChecked}
        aria-labelledby={labelId}
      ></input>
      <span
        aria-hidden="true"
        aria-labelledby={labelId}
        css={switchStyles}
      ></span>
    </label>
  );
};
