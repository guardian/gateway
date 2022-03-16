### Apps registration with Okta

The approach for registration in native apps uses the Okta SDK along with a in-app browser tab for displaying the registration web page.

See https://www.rfc-editor.org/rfc/rfc8252.txt#:~:text=See%20Section%208.1-,Appendix%20B.%20%20Platform%2DSpecific%20Implementation%20Details,-This%20document%20primarily for recommendations for iOS ("SFAuthenticationSession") and Android (Android Custom Tab)

To hand control back to the App Native layer from the In-App Browser Tab, private-use URI scheme (referred to as "custom URL scheme") redirects and claimed "https" scheme URIs (known as "Universal Links")

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
  Native layer->>In app Browser Tab: open on /register
  In app Browser Tab->>Gateway: GET /register
  Gateway->>In app Browser Tab: registration page
  User->>In app Browser Tab: submits email address in registration form
  In app Browser Tab->>Gateway: POST /register
  note over Gateway: Registration with Okta handled by Gateway
  Okta->>Users Inbox: Activation email
  Gateway->>In app Browser Tab:email sent page (/register/email-sent)
  Users Inbox->>Native layer:clicks on emailed activation link
  Native layer->>In app Browser Tab: open /welcome/{activationToken}
  In app Browser Tab->>Gateway:GET /welcome/{activationToken}
  note over Gateway: Activation done by Gateway
  Gateway->>In app Browser Tab:welcome page (set password) (/welcome/{activationToken}
  User->>In app Browser Tab:submits password in password form
  In app Browser Tab->>Gateway:POST /welcome/{activationToken}
  note over Gateway:add session cookie to browser
  Gateway->>In app Browser Tab: set Okta session Cookie and returns a redirect request to a "custom URL scheme" or claimed "https" scheme URIs
  In app Browser Tab->>Native layer: picks up redirect request
  note over Native layer: use SDK to get user access tokens using .signIn(prompt=none) method
  Native layer->>In app Browser Tab: opens /authorize and
  In app Browser Tab->>Okta: call /authorize and use Okta session cookie from previous step to get an authorization code
  Okta->>In app Browser Tab: return redirect request to the redirect_uri with an authorization code
  In app Browser Tab->>Native layer: authorization code is returned to the configured callback uri which is a "custom URL scheme"
  Native layer->>Okta: request for exchange for authorization code for tokens
  Okta->>Native layer: Id token, access token and refresh tokens are returned
  note over Native layer: The tokens are stored, and the user is authorized
```
