# Flow diagrams for common Gateway routes

These flow diagrams are a WIP, mostly used to help visualise some complex functions in Gateway for the purposes of mocking Okta flows in testing.

## Sign in

```mermaid
flowchart TD
  A[GET /signin] --> B[POST /signin] --> oktaSignInController --> authenticateWithOkta --> getUserGroups --> performAuthorizationCodeFlow

```

## Register

```mermaid
flowchart TD
  A[GET /register] --> B[POST /register] --> OktaRegistration --> registerWithOkta --> setEncryptedStateCookieForOktaRegistration --> C[302 /register/email-sent]
  registerWithOkta --> createUser
  createUser --> catch --> sendRegistrationEmailByUserState
```

## Resend registration email

```mermaid
flowchart TD
  A[GET /register/email-sent] --> B[POST /register/email-sent/resend] --> OktaResendEmail
  B --> catch --> A
  OktaResendEmail --> registerWithOkta --> A
```

## Reset password

```mermaid
flowchart TD
  get[GET /reset-password] --> post[POST /reset-password] --> sendChangePasswordEmailController --> sendEmailInOkta --> getUser --> userFound{User found?} -- Yes --> userStatus{User status?}
  userStatus -- ACTIVE --> sendForgotPasswordEmail --> getEmailSent
  userStatus -- STAGED --> activateUser --> sendCreatePasswordEmail --> getEmailSent
  userStatus -- PROVISIONED --> reactivateUser --> sendCreatePasswordEmail --> getEmailSent
  userStatus -- RECOVERY/PASSWORD_EXPIRED --> dangerouslyResetPassword --> sendResetPasswordEmail --> getEmailSent
  getEmailSent[GET /reset-password/email-sent]
  userFound -- No --> getEmailSent
  post --> catch --> get
```
