import {
  getComponentType,
  parseComponentEventParams,
  generateOphanComponentEvent,
  ComponentEventParams,
} from '../ophan';

// mock the server side logger
jest.mock('@/server/lib/serverSideLogger');

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: () => ({
    stage: 'DEV',
    aws: {},
  }),
}));

describe('ophan#parseComponentEventParams', () => {
  test('it should parse component event params with all parameters', async () => {
    const input =
      'componentType=SIGN_IN_GATE&componentId=component_id&abTestName=main_test&abTestVariant=main_variant&browserId=321bca&visitId=123abc&viewId=987xyz';
    const output = await parseComponentEventParams(input);
    expect(output).toEqual({
      abTestName: 'main_test',
      abTestVariant: 'main_variant',
      browserId: '321bca',
      componentId: 'component_id',
      componentType: 'SIGN_IN_GATE',
      viewId: '987xyz',
      visitId: '123abc',
    });
  });

  test('it should parse component event params without optional parameters', async () => {
    const input =
      'componentType=SIGN_IN_GATE&componentId=component_id&viewId=987xyz';
    const output = await parseComponentEventParams(input);
    expect(output).toEqual({
      componentId: 'component_id',
      componentType: 'SIGN_IN_GATE',
      viewId: '987xyz',
    });
  });

  test('it should convert "undefined" string to "" empty string from parameters', async () => {
    const input =
      'componentType=SIGN_IN_GATE&componentId=component_id&abTestName=main_test&abTestVariant=main_variant&browserId=undefined&visitId=undefined&viewId=987xyz';
    const output = await parseComponentEventParams(input);
    expect(output).toEqual({
      abTestName: 'main_test',
      abTestVariant: 'main_variant',
      componentId: 'component_id',
      componentType: 'SIGN_IN_GATE',
      viewId: '987xyz',
      browserId: '',
      visitId: '',
    });
  });

  test('it should return undefined if unable to parse the query string', async () => {
    const input = 'componentType=SIGN_IN_GATE&componentId=component_id';
    const output = await parseComponentEventParams(input);
    expect(output).toBeUndefined();
  });

  test('it should return undefined if the query string is empty', async () => {
    const input = '';
    const output = await parseComponentEventParams(input);
    expect(output).toBeUndefined();
  });

  test('it should return undefined if the query string has unknown key', async () => {
    const input =
      'componentType=SIGN_IN_GATE&componentId=component_id&abTestName=main_test&abTestVariant=main_variant&browserId=321bca&visitId=123abc&viewId=987xyz&unknownKey=unknownValue';
    const output = await parseComponentEventParams(input);
    expect(output).toBeUndefined();
  });
});

describe('ophan#getComponentType', () => {
  test('it should convert "signingate" to "SIGN_IN_GATE"', () => {
    expect(getComponentType('signingate')).toBe('SIGN_IN_GATE');
  });

  test('it should convert "identityauthentication" to "IDENTITY_AUTHENTICATION"', () => {
    expect(getComponentType('identityauthentication')).toBe(
      'IDENTITY_AUTHENTICATION',
    );
  });

  test('it should return the same string if the component type is not "signingate" or "identityauthentication"', () => {
    expect(getComponentType('NEWSLETTER_SUBSCRIPTION')).toBe(
      'NEWSLETTER_SUBSCRIPTION',
    );
  });
});

describe('ophan#generateOphanComponentEvent', () => {
  test('it should generate a valid ophan component event from componentEventParams, action, and value', () => {
    const componentEventParams: ComponentEventParams = {
      abTestName: 'main_test',
      abTestVariant: 'main_variant',
      browserId: '321bca',
      componentId: 'component_id',
      componentType: 'SIGN_IN_GATE',
      viewId: '987xyz',
      visitId: '123abc',
    };

    const output = generateOphanComponentEvent(
      componentEventParams,
      'SIGN_IN',
      'a_value',
    );
    expect(output).toEqual({
      abTest: {
        name: 'main_test',
        variant: 'main_variant',
      },
      action: 'SIGN_IN',
      component: {
        componentType: 'SIGN_IN_GATE',
        id: 'component_id',
      },
      value: 'a_value',
    });
  });

  test('it should generate a valid ophan component event from componentEventParams and action', () => {
    const componentEventParams: ComponentEventParams = {
      abTestName: 'main_test',
      abTestVariant: 'main_variant',
      browserId: '321bca',
      componentId: 'component_id',
      componentType: 'SIGN_IN_GATE',
      viewId: '987xyz',
      visitId: '123abc',
    };

    const output = generateOphanComponentEvent(componentEventParams, 'SIGN_IN');

    expect(output).toEqual({
      abTest: {
        name: 'main_test',
        variant: 'main_variant',
      },
      action: 'SIGN_IN',
      component: {
        componentType: 'SIGN_IN_GATE',
        id: 'component_id',
      },
    });
  });

  test('it should not include ab test if ab test name missing', () => {
    const componentEventParams: ComponentEventParams = {
      abTestVariant: 'main_variant',
      browserId: '321bca',
      componentType: 'SIGN_IN_GATE',
      componentId: 'component_id',
      viewId: '987xyz',
      visitId: '123abc',
    };

    const output = generateOphanComponentEvent(componentEventParams, 'SIGN_IN');

    expect(output).toEqual({
      action: 'SIGN_IN',
      component: {
        componentType: 'SIGN_IN_GATE',
        id: 'component_id',
      },
    });
  });

  test('it should not include ab test if ab test variant missing', () => {
    const componentEventParams: ComponentEventParams = {
      abTestName: 'main_test',
      browserId: '321bca',
      componentType: 'SIGN_IN_GATE',
      componentId: 'component_id',
      viewId: '987xyz',
      visitId: '123abc',
    };

    const output = generateOphanComponentEvent(componentEventParams, 'SIGN_IN');

    expect(output).toEqual({
      action: 'SIGN_IN',
      component: {
        componentType: 'SIGN_IN_GATE',
        id: 'component_id',
      },
    });
  });

  test('it should not include ab test if ab test missing', () => {
    const componentEventParams: ComponentEventParams = {
      browserId: '321bca',
      componentType: 'SIGN_IN_GATE',
      componentId: 'component_id',
      viewId: '987xyz',
      visitId: '123abc',
    };

    const output = generateOphanComponentEvent(componentEventParams, 'SIGN_IN');

    expect(output).toEqual({
      action: 'SIGN_IN',
      component: {
        componentType: 'SIGN_IN_GATE',
        id: 'component_id',
      },
    });
  });
});
