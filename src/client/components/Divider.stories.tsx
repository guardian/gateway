import React from 'react';
import { Meta } from '@storybook/react';

import { Divider } from './Divider';

const lorem =
  "I'm baby bespoke neutra austin, banjo affogato man braid cardigan kombucha ugh semiotics letterpress direct trade twee literally tofu. Tousled bitters banjo, messenger bag williamsburg farm-to-table celiac church-key pork belly.";

export default {
  title: 'Components/Divider',
  component: Divider,
} as Meta;

export const Default = () => (
  <>
    <p>{lorem}</p>
    <Divider />
    <p>{lorem}</p>
  </>
);
Default.storyName = 'when loose (defaults)';

export const Text = () => (
  <>
    <p>{lorem}</p>
    <Divider displayText="Or" size="full" />
    <p>{lorem}</p>
  </>
);
Text.storyName = 'when loose + text';

export const Full = () => (
  <>
    <p>{lorem}</p>
    <Divider size="full" />
    <p>{lorem}</p>
  </>
);
Full.storyName = 'when loose + full size';

export const FullText = () => (
  <>
    <p>{lorem}</p>
    <Divider displayText="AND" size="partial" />
    <p>{lorem}</p>
  </>
);
FullText.storyName = 'when loose + text + partial size';

export const Tight = () => (
  <>
    <p>{lorem}</p>
    <Divider spaceAbove="tight" />
    <p>{lorem}</p>
  </>
);
Tight.storyName = 'when tight';

export const TightFull = () => (
  <>
    <p>{lorem}</p>
    <Divider spaceAbove="tight" size="full" />
    <p>{lorem}</p>
  </>
);
TightFull.storyName = 'when tight + full size';

export const TightText = () => (
  <>
    <p>{lorem}</p>
    <Divider
      spaceAbove="tight"
      displayText="Or maybe the dividing text is long?"
      size="full"
    />
    <p>{lorem}</p>
  </>
);
TightText.storyName = 'when tight + text';

export const TightPartialText = () => (
  <>
    <p>{lorem}</p>
    <Divider spaceAbove="tight" size="partial" displayText="Or" />
    <p>{lorem}</p>
  </>
);
TightPartialText.storyName = 'when tight + text + partial size';
