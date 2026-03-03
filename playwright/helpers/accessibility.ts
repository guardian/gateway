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

		// eslint-disable-next-line no-console -- this is helpful information for the playwright tests
		console.table(violationData);

		throw new Error(
			`${results.violations.length} accessibility violations found`,
		);
	}
}
