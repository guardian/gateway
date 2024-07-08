describe('Email input component', () => {
	beforeEach(() => {
		cy.mockPurge();
	});

	it('should show an error message when nothing submitted ', () => {
		cy.visit('/register/email');
		cy.get('[data-cy=main-form-submit-button]').click();
		cy.contains('Please enter your email.');
	});

	it('should show an error message when an invalid email is submitted', () => {
		cy.visit('/register/email');
		cy.get('input[name="email"]').type('invalid.email.com');
		cy.get('[data-cy=main-form-submit-button]').click();
		cy.contains('Please enter a valid email format.');
	});

	it('does not show an error message when a valid email is submitted', () => {
		cy.visit('/register/email');
		cy.get('input[name="email"]').type('test@email.com');
		cy.get('[data-cy=main-form-submit-button]').focus();
		cy.contains('Please enter a valid email format.').should('not.exist');
		cy.contains('Please enter your email.').should('not.exist');
	});

	it('should correct error once a valid email is submitted', () => {
		cy.visit('/register/email');
		cy.get('input[name="email"]').type('invalid.email.com');
		cy.get('[data-cy=main-form-submit-button]').click();
		cy.contains('Please enter a valid email format.');
		cy.get('input[name="email"]').type('test@email.com');
		cy.get('[data-cy=main-form-submit-button]').focus();
		cy.contains('Please enter a valid email format.').should('not.exist');
		cy.contains('Please enter your email.').should('not.exist');
	});
});
