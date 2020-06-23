export interface Configuration {
  port: number;
  idapiClientAccessToken: string;
  idapiBaseUrl: string;
  playSessionCookieSecret: string;
  baseUri: string;
  defaultReturnUri: string;
  stage: string;
  gaUID: {
    id: string;
    hash: string;
  };
}

export enum GA_UID {
  DEV = 'UA-33592456-10',
  CODE = 'UA-33592456-10',
  PROD = 'UA-78705427-4',
}

// for helmet csp
export enum GA_UID_HASH {
  DEV = `'sha256-411aj9j2RJj78RLGlCL/KDMK0fe6OEh8Vp6NzyYIkP4='`,
  CODE = `'sha256-411aj9j2RJj78RLGlCL/KDMK0fe6OEh8Vp6NzyYIkP4='`,
  PROD = `'sha256-eK1AOAxz59vbOJnu9xunP2iz4Sar2B6if0ZkiINBfGM='`,
}
