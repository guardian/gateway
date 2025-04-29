# OAuth Token Verification Guide

_This document provides a guide for verifying OAuth tokens issued by Okta, usually on the server side and/or an API._

_If you are looking for a guide on how to integrate authentication in your application, please refer to the [Web apps integration guide](./web-apps-integration-guide.md) or the [Native apps integration guide](./native-apps-integration-guide.md) instead._

## tl;dr

See the [token verification process](#token-verification-process) section for a step-by-step guide on how to verify an OAuth token issued by Okta.

## Overview

When a client application receives an [OAuth token](./oauth.md#oauthoidc-tokens-claims-and-scopes) after a successful authentication, it may use that token, specifically the [`access_token`](./oauth.md#access-token) to access an API on behalf of the user. The API **MUST** verify the token before using it to authorize access to the requested resource/endpoint.

The verification process ensures that the token is valid, not expired, and has the necessary scopes to access the requested resource.

In most cases, token verification can be done locally on the API server using public key verification using the [JSON Web Key Set (JWKS)](https://datatracker.ietf.org/doc/html/rfc7517) provided by Okta. This is the recommended approach for performance.

However, in some cases, you will need to verify the token with Okta to make sure that it has not been revoked. Our rule around this is that if a resource required a scope ending in the `.secure` suffix, then the token must be verified with Okta. This is because the `.secure` scopes are usually used for sensitive resources that require a higher level of security, for example, when posting a comment on an article.

See the [API Scopes](./oauth.md#api-scopes) documentation for more information about scopes.

## Token Verification Process

You will need the `issuer` and `audience` values to verify the token. The identity team will provide you with the issuer URL and the audience value, which in Okta can be found in the dashboard under `Security > API > Authorization Servers` and in most cases we'll want the `Guardian Authorization Server`.

1. Get the token from the request. The token is usually passed in the `Authorization` header as a Bearer token.

   ```
   Authorization: Bearer <access_token>
   ```

2. Ideally use one of the libraries listed below to verify the token. The libraries will handle the verification process for you, including fetching the JWKS from Okta and verifying the token signature and the expiry.

   - If the token is not valid, the library will throw an exception or return an error. You should handle this error and return a 401 Unauthorized response to the client.

   - If you need to verify the token manually, steps are visited below.

3. If the token is valid, you should check the scopes in the token to make sure that the user has the necessary permissions to access the requested resource. The scopes are usually included in the `scp` claim of the token.

   - If the token does not have the necessary scopes, you should return a 403 Forbidden response to the client.
   - If the token has the necessary scopes, you can proceed to access the requested resource.

4. If the token has a `.secure` scope, you should verify the token with Okta to make sure that it has not been revoked.
   This can be done by making a request to the OAuth `/userinfo` endpoint.

   - If the token is valid, it will return a 200 OK response with the latest user information.
   - If the token is not valid, it will return a 401 Unauthorized response. You should handle this error and return a 401 Unauthorized response to the client.

5. If the token is valid and has the necessary scopes, you can proceed to access the requested resource.

### Scala API

- `com.gu.identity.identity-auth-core`
  - [maven](https://mvnrepository.com/artifact/com.gu.identity/identity-auth-core)
  - [code](https://github.com/guardian/identity/blob/main/identity-auth-core/src/main/scala/com/gu/identity/auth/OktaAuthService.scala#L24C7-L24C22)
  - example implementations available in [`members-data-api`](https://github.com/guardian/mobile-save-for-later)
- `com.gu.identity.identity-auth-play`
  - [maven](https://mvnrepository.com/artifact/com.gu.identity/identity-auth-play)
  - [code](https://github.com/guardian/identity/blob/main/identity-auth-play/src/main/scala/com/gu/identity/play/OktaPlayAuthService.scala)
  - example implementations available in [`support-frontend`](https://github.com/guardian/support-frontend)

These libraries were created by the Identity team and are used in various Guardian applications. If you need help using them, please reach out to us!

These libraries handle both the local and remote token verification process for you.

### Typescript/Javascript API

Currently we don't have a library made by the Identity team for Typescript/Javascript. However, there are various libraries available that can be used to verify Okta tokens.

We recommend using the [`@okta/jwt-verifier`](https://github.com/okta/okta-jwt-verifier-js) library for verifying Okta tokens. This library is maintained by Okta and is widely used in the community.

However it only supports the local verification process. If you need to verify the token with Okta remotely, you have to implement the logic yourself.

The Identity team is working on a library for Typescript/Javascript that will handle both local and remote verification.

If you need help using the `@okta/jwt-verifier` library, please reach out to us!

Example usage within the Guardian can be found in [GitHub](https://github.com/search?q=org%3Aguardian%20%40okta%2Fjwt-verifier&type=code).

### Manual token verification/Other languages

If you are using a different language or framework, we first suggest try using a library from https://jwt.io/libraries for token verification.

If you are unable to find a library that works for you, you can implement the token verification process manually. The following steps outline the process for verifying an OAuth Access Token issued by Okta.

1. Get and set up the JWKS from the authorization server. The JWKS is a JSON object that contains the public keys used to verify the token signature. The JWKS can be obtained from the following URL:

   ```
   https://<issuer>/v1/keys
   ```

   Replace `<issuer>` with the issuer URL of the authorization server. The identity team will provide you with the issuer URL.

   The response will something like the following:

   ```json
   {
   	"keys": [
   		{
   			"kty": "RSA",
   			"alg": "RS256",
   			"kid": "KEY_ID",
   			"use": "sig",
   			"e": "AQAB",
   			"n": "MODULUS"
   		}
   	]
   }
   ```

   The `kid` value is the key ID used to identify the key used to sign the token. The `n` and `e` values are the modulus and exponent of the RSA public key, respectively.

   Ideally the response should be cached to avoid making a request to the JWKS endpoint for every token verification. Okta returns a `Cache-Control` header with the response, which can be used to set the cache expiration time.

2. Decode the token into it's parts, i.e header, payload and signature. The token is an encoded string with three parts separated by dots (`.`). The first part is the header, the second part is the payload and the third part is the signature.

   ```js
   const [headerStr, payloadStr, signature] = token.split('.');
   ```

   The header and payload are Base64Url encoded JSON objects, while the signature is a Base64Url encoded string.

   The header contains the algorithm used to sign the token and the key ID used to identify the key.

   The payload contains the claims of the token, including the scopes and expiry time.

   The signature is used to verify the token signature.

   ```js
   const header = JSON.parse(base64UrlToString(headerStr));
   const payload = JSON.parse(base64UrlToString(payloadStr));
   ```

   If any are missing, the token is invalid. A `400 Bad Request` response should be returned to the client.

3. Validate the header contains required fields.

   See: https://developer.okta.com/docs/api/openapi/okta-oauth/guides/overview/#reserved-claims-in-the-header-section

   The header should contain the following fields:

   - `alg`: The algorithm used to sign the token. This should be `RS256`.
   - `kid`: The key ID used to identify the key. This should match the `kid` value in the JWKS (which we'll check later).

   If the header does not contain these fields, the token is invalid. A `400 Bad Request` response should be returned to the client.

4. Validate the payload contains the required fields.

   See: https://developer.okta.com/docs/api/openapi/okta-oauth/guides/overview/#reserved-claims-in-the-payload-section

   The payload should contain the following fields:

   - `auth_time`: The time the user authenticated. This is a Unix timestamp in seconds.
   - `cid`: The client ID of the application that requested the access token.
   - `exp`: The expiry time of the token. This is a Unix timestamp in seconds.
   - `iat`: The time the token was issued. This is a Unix timestamp in seconds.
   - `iss`: The issuer URL of the authorization server.
   - `jti`: The unique ID of the token. This is a UUID.
   - `scp`: The scopes granted to the token. This is an array of strings.
   - `uid`: The Okta ID of the user.
   - `ver`: The version of the token.

   If the payload does not contain these fields, the token is invalid. A `400 Bad Request` response should be returned to the client.

   The payload can also contain other fields, such as custom fields (claims), but these are not required for verification, though your application may require them for authorization.

   In this step we don't check the values of the fields, only that they exist. The values will be checked in the next steps.

5. Verify the token signature.

   The signature is used to verify the token signature. The signature is created by signing the header and payload with the private key of the authorization server. The public key is used to verify the signature.

   To verify the signature, we need to get the public key from the JWKS. We can do this by finding the key with the matching `kid` value in the JWKS.

   ```js
   // Get the JWKS from the authorization server
   // This should be cached to avoid making a request to the JWKS endpoint for every token verification
   const jwksResponse = await fetch(jwksUri);
   // Parse the response as JSON
   const jwks = await jwksResponse.json();
   // Find the key with the matching kid value
   const key = jwks.keys.find((key) => key.kid === header.kid);
   ```

   If the key is not found, the token is invalid. A `401 Unauthorized` response should be returned to the client.

   You will need to use a cryptography library to verify the signature. In JavaScript, you can use the [`Web Crypto API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) module with the [`SubtleCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) interface to verify the signature.

   ```js
   // create the algorithm to use for the verification
   const algorithm: HmacImportParams = {
   	name: 'RSASSA-PKCS1-v1_5',
   	hash: { name: 'SHA-256' },
   };

   // import the public key using the jwk format
   // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
   const publicKey = await crypto.subtle.importKey(
   	// format
   	'jwk', // JSON Web Key format
   	// json web key object, see https://datatracker.ietf.org/doc/html/rfc7517 for more information
   	{
   		kty: key.kty,
   		n: key.n,
   		e: key.e,
   		alg: key.alg,
   		use: key.use,
   	},
   	algorithm, // algorithm to use
   	false, // whether the key is extractable
   	['verify'], // what the key can be used for
   );

   // create the data to verify, i.e the header and payload
   const data = `${header}.${payload}`;

   // verify the signature
   const isValid = await crypto.subtle.verify(
   	algorithm,
   	publicKey,
   	stringToBuffer(base64UrlToString(sig)), // buffer of the signature
   	stringToBuffer(data), // buffer of the data to verify
   );

    // boolean value
    if (!isValid) {
    	// signature is invalid
    	// return 401 Unauthorized response
    }
   ```

6. Verify the access token claims.

   The claims are the fields in the payload. We need to verify the following claims:

   - `exp`: The expiry time of the token. This should be in the future. If the token is expired, it is invalid. A `401 Unauthorized` response should be returned to the client.
   - `iat`: The time the token was issued. This should be in the past. If the token is issued in the future, it is invalid. A `401 Unauthorized` response should be returned to the client.
   - `iss`: The issuer URL of the authorization server. This should match the issuer URL provided by the identity team. If it does not match, the token is invalid. A `401 Unauthorized` response should be returned to the client.
   - `aud`: The audience of the token. This should match the audience value provided by the identity team. If it does not match, the token is invalid. A `401 Unauthorized` response should be returned to the client.

   ```js
   // get the current time in seconds
   const now = Math.floor(Date.now() / 1000);
   // check if the token is expired
   if (payload.exp < now) {
   	// token is expired
   	// return 401 Unauthorized response
   }
   // check if the token is issued in the future
   if (payload.iat > now) {
   	// token is issued in the future
   	// return 401 Unauthorized response
   }
   // check if the issuer matches
   if (payload.iss !== issuer) {
   	// issuer does not match
   	// return 401 Unauthorized response
   }
   // check if the audience matches
   if (payload.aud !== audience) {
   	// audience does not match
   	// return 401 Unauthorized response
   }
   ```

   You may also want to check for other claims depending on your API requirements. For example, at the Guardian we check that we have the `legacy_identity_id` claim, which is the identity id of the user, as well as for the `email`/`sub` claim which is the email address of the user.

   If these are missing and your API requires them, you should return a `403 Forbidden` response to the client.

7. Verify the scopes.

   The scopes are included in the `scp` claim of the token. You should check if the token has the necessary scopes to access the requested resource.

   ```js
   // get the scopes from the payload
   const scopes = payload.scp;
   // check if the token has the necessary scopes
   if (!scopes.includes('required_scope')) {
   	// token does not have the necessary scopes
   	// return 403 Forbidden response
   }
   ```

   If your endpoint is requires a scope ending in `.secure`, you should verify the token with Okta to make sure that it has not been revoked. This can be done by making a request to the OAuth [`/userinfo`](https://developer.okta.com/docs/api/openapi/okta-oauth/oauth/tag/CustomAS/#tag/CustomAS/operation/userinfoCustomAS) endpoint.

   ```js
   if (scopes.includes('guardian.some-api.update.secure')) {
   	// token has a .secure scope
   	// verify the token with Okta
   	const userInfoResponse = await fetch(`${issuer}/v1/userinfo`, {
   		headers: {
   			Authorization: `Bearer ${token}`,
   		},
   	});
   	if (!userInfoResponse.ok) {
   		// token is not valid
   		// return 401 Unauthorized response
   	}
   	// continue with the request
   }
   ```

   We use `/userinfo` endpoint instead of the `/introspect` endpoint as you don't need to pass any additional information about the token. The `/userinfo` endpoint will also return the latest user information, which can be useful for your API.

8. If the token is valid and has the necessary scopes, you can proceed to access the requested resource.
