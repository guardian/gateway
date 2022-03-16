### Apps registration with Okta

The approach for registration in native apps uses the Okta SDK along with a in-app browser tab for displaying the registration web page.

See https://www.rfc-editor.org/rfc/rfc8252.txt#:~:text=See%20Section%208.1-,Appendix%20B.%20%20Platform%2DSpecific%20Implementation%20Details,-This%20document%20primarily for recommendations for iOS ("SFAuthenticationSession") and Android (Android Custom Tab)

The main steps for the user in the registration process are as follows:

1. Enters their email address to register with (step 5 in diagram)
2. They are sent an activation email (step 11 in diagram)
3. They click the activation link within the email (step 13 in diagram)
4. This link opens a in-app browser tab in the native app again (step 14 in diagram)
5. The User enters their password and submits the form (step 19)
6. The User is taken out of the in-app browser tab and is signed in to the native app (step 25)

# Diagram

```mermaid
sequenceDiagram
autonumber
participant User
participant Native layer
participant In app Browser Tab
participant Gateway
participant Okta
participant Users Inbox

User->>Native layer: User clicks action to register
Native layer->>In app Browser Tab: open on https://profile.theguardian.com/register
In app Browser Tab->>Gateway: GET /register
Gateway->>In app Browser Tab: registration page
User->>In app Browser Tab: submits email address in registration form
In app Browser Tab->>Gateway: POST /register
Gateway->>Okta: register with Okta (no password) POST /api/v1/users?activate=false
Okta->>Gateway: user response object status: STAGED

Gateway->>Okta: activate user   POST /api/v1/users/${userId}/lifecycle/activate?sendEmail=true
Okta->>Gateway: activation token   status: PROVISIONED
Okta->>Users Inbox: Activation email
Gateway->>In app Browser Tab:email sent page (/register/email-sent)
Users Inbox->>Native layer:clicks on emailed activation link
Native layer->>In app Browser Tab: open /welcome/{activationToken}
In app Browser Tab->>Gateway:GET /welcome/{activationToken}
Gateway->>Okta:exchange activation token for state token POST /api/v1/authn ?token={activationToken}
Okta->>Gateway:state token status: RECOVERY (PASSWORD_RESET)
note over Gateway:add state token to encrypted cookie

Gateway->>In app Browser Tab:welcome page (set password) (/welcome/{activationToken}
User->>In app Browser Tab:submits password in password form
In app Browser Tab->>Gateway:POST /welcome/{activationToken}
Gateway->>Okta:set password with state token POST /api/v1/authn/credentials/reset_password? stateToken={stateToken} &newPassword={password}
Okta->>Gateway:session token User status: ACTIVE
note over Gateway:add session token as url param
Gateway->>In app Browser Tab: consents page with sessionToken
In app Browser Tab->>Native layer: listens for url response with sessionToken
Native layer->>Okta: use SDK to get user access tokens for sessionToken
Okta->>Native layer:  access, refresh and id tokens return
Native layer->>Native layer: The tokens are stored, and the user is signed in
```
