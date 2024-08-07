class ResetPasswordPage {
	static URL = '/reset-password';
	static CONTENT = {
		ERRORS: {
			GENERIC: 'Sorry, something went wrong. Please try again.',
			NO_ACCOUNT:
				'There is no account for that email address, please check for typos or create an account',
			NO_EMAIL: 'Email field must not be blank.',
		},
	};

	goto() {
		cy.visit(ResetPasswordPage.URL);
	}

	emailAddressField() {
		return cy.get('input[name="email"]');
	}

	invalidEmailAddressField() {
		return cy.get('input[name="email"]:invalid');
	}

	submitEmailAddress(email: string) {
		this.emailAddressField().type(email);
		this.clickResetPassword();
	}

	clickResetPassword() {
		cy.contains('Request password reset').click();
	}
}

export default ResetPasswordPage;
