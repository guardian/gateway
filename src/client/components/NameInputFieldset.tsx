import { css } from '@emotion/react';
import { space, textSans } from '@guardian/source-foundations';
import { TextInput } from '@guardian/source-react-components';
import React, { useState } from 'react';

const fieldSpacing = css`
  margin-bottom: ${space[2]}px;
`;

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[4]}px 0 0 0;
  ${textSans.medium()}
`;

const NameInputFieldset = () => {
  const [firstNameError, setFirstNameError] = useState<string>();
  const [lastNameError, setLastNameError] = useState<string>();
  return (
    <fieldset css={fieldset}>
      <TextInput
        required
        label={'First Name'}
        name="first-name"
        type="text"
        error="Please enter your First name"
        autoComplete="given-name"
        css={fieldSpacing}
      />
      <TextInput
        required
        label={'Last Name'}
        name="last-name"
        type="text"
        autoComplete="family-name"
        error="Please enter your Last name"
      />
    </fieldset>
  );
};

export default NameInputFieldset;
