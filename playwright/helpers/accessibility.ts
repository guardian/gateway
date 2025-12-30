import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Inject and check accessibility on the current page.
 */
export async function injectAndCheckAxe(page: Page): Promise<void> {
	const results = await new AxeBuilder({ page })
		.disableRules(['color-contrast'])
		.analyze();

	if (results.violations.length > 0) {
		const violationData = results.violations.map(
			({ id, impact, description, nodes }) => ({
				id,
				impact,
				description,
				nodes: nodes.length,
			}),
		);

		console.log(
			`${results.violations.length} accessibility violation${
				results.violations.length === 1 ? '' : 's'
			} ${results.violations.length === 1 ? 'was' : 'were'} detected`,
		);
		console.table(violationData);

		throw new Error(
			`${results.violations.length} accessibility violations found`,
		);
	}
}
