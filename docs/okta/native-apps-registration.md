### Apps registration with Okta

The approach for registration in native apps uses the Okta SDK along with a webview for displaying the registration web page.

The main steps for the user in the registration process are as follows:

1. Enters their email address to register with (step 5 in diagram)
2. They are sent an activation email (step 11 in diagram)
3. They click the activation link within the email (step 13 in diagram)
4. This link opens a webview in the native app again (step 14 in diagram)
5. The User enters their password and submits the form (step 19)
6. The User is taken out of the webview and is signed in to the native app (step 25)

# Diagram

```mermaid
sequenceDiagram
autonumber
participant User
participant Native layer
participant Webview
participant Gateway
participant Okta
participant Users Inbox

User->>Native layer: lands on registration page (/register)
Native layer->>Webview: open on /register
Webview->>Gateway: GET /register
Gateway->>Webview: registration page
User->>Webview: submits email address in registration form
Webview->>Gateway: POST /register
Gateway->>Okta: register with Okta (no password) POST /api/v1/users?activate=false
Okta->>Gateway: user response object status: STAGED

Gateway->>Okta: activate user   POST /api/v1/users/${userId} /lifecycle/activate?sendEmail=true
Okta->>Gateway: activation token   status: PROVISIONED
Okta->>Users Inbox: Activation email
Gateway->>Webview:email sent page (/register/email-sent)
Users Inbox->>Native layer:clicks on emailed activation link
Native layer->>Webview: open /welcome/{activationToken}
Webview->>Gateway:GET /welcome/{activationToken}
Gateway->>Okta:exchange activation token for state token POST /api/v1/authn ?token={activationToken}
Okta->>Gateway:state token status: RECOVERY (PASSWORD_RESET)
note over Gateway:add state token to encrypted cookie

Gateway->>Webview:welcome page (set password) (/welcome/{activationToken}
User->>Webview:submits password in password form
Webview->>Gateway:POST /welcome/{activationToken}
Gateway->>Okta:set password with state token POST /api/v1/authn/credentials/reset_password? stateToken={stateToken} &newPassword={password}
Okta->>Gateway:session token User status: ACTIVE
note over Gateway:add session token as url param
Gateway->>Webview: consents page with sessionToken
Webview->>Native layer: listens for url response with sessionToken
Native layer->>Okta: use SDK to get user access tokens for sessionToken
Okta->>Native layer:  access, refresh and id tokens return
Native layer->>Native layer: The tokens are stored, and the user is signed in
```
