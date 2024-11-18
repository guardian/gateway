import axe from 'axe-core';

export const terminalLog = (violations: axe.Result[]) => {
	cy.task(
		'log',
		`${violations.length} accessibility violation${
			violations.length === 1 ? '' : 's'
		} ${violations.length === 1 ? 'was' : 'were'} detected`,
	);
	// pluck specific keys to keep the table readable
	const violationData = violations.map(
		({ id, impact, description, nodes }) => ({
			id,
			impact,
			description,
			nodes: nodes.length,
		}),
	);

	cy.task('table', violationData);
};

// for use on page reloads after axction taken
export const injectAndCheckAxe = () => {
	cy.injectAxe();
	cy.configureAxe({
		rules: [
			{
				selector: '[data-cy="exclude-a11y-check"]',
				matches: 'color-contrast-evaluate',
				id: 'color-contrast',
			},
		],
	});
	cy.checkA11y(undefined, undefined, terminalLog);
};
