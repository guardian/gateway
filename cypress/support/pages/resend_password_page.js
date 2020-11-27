const ResetPasswordPage = require('./reset_password_page');

class ResendPasswordResetPage {
  static URL = `/reset/resend`;
  static CONTENT = {
    PAGE_TITLE: 'Forgotten password link expired',
  };
}

module.exports = ResendPasswordResetPage;
