# Flow diagrams for common Gateway routes

**_Note: These diagrams are outdated and describe behaviour for the older Okta Classic API. For more up to date flows using the newer Okta IDX API, see the [IDX Documentation](./okta/idx/README.md)_**

## Sign in

_Note: See [IDX Sign In](./okta/idx/sign-in-idx.md) for the most up to date flow_

```mermaid
flowchart TD
  A[GET /signin] --> B[POST /signin] --> oktaSignInController --> authenticateWithOkta --> getUserGroups --> performAuthorizationCodeFlow

```

## Register / Create Account

_Note: See [IDX Create Account](./okta/idx/create-account-idx.md) for the most up to date flow for new users_

```mermaid
flowchart TD
  A[GET /register] --> B[POST /register] --> OktaRegistration --> registerWithOkta --> redirectToEmailSent2[302 /register/email-sent]
  registerWithOkta --> createUser
  createUser --> catch --> sendRegistrationEmailByUserState
  sendRegistrationEmailByUserState --> getUser
  getUser --> userStatus{User status?}
  userStatus -- ACTIVE --> emailValidated{Email validated?}
  emailValidated -- Yes --> sendAccountExistsEmail --> redirectToEmailSent
  emailValidated -- No --> hasPassword{Has password?}
  hasPassword -- Yes --> sendEmailToUnvalidatedUser --> redirectToEmailSent
  hasPassword -- No --> resetAndSetPassword[Reset and set placeholder password] --> sendEmailToUnvalidatedUser
  userStatus -- STAGED --> activateUser --> sendAccountWithoutPasswordExistsEmail --> redirectToEmailSent
  userStatus -- PROVISIONED --> reactivateUser --> sendAccountWithoutPasswordExistsEmail
  userStatus -- RECOVERY/PASSWORD_EXPIRED --> dangerouslyResetPassword --> sendResetPasswordEmail --> redirectToEmailSent
  redirectToEmailSent[302 /register/email-sent]
```

### Resend registration email

```mermaid
flowchart TD
  A[GET /register/email-sent] --> B[POST /register/email-sent/resend] --> OktaResendEmail
  B --> catch --> A
  OktaResendEmail --> registerWithOkta --> A
```

## Reset password

_Note: See [IDX Reset Password](./okta/idx/reset-password-idx.md) for the most up to date flow_

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
