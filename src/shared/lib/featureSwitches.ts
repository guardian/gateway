/**
 * Interface for FeatureSwitches.
 * Add feature switch name as the key, and type usually as `boolean`.
 * We use an interface instead of a plain object so that if
 * a property is removed/missing, typescript will complain.
 *
 * @interface FeatureSwitches
 */
interface FeatureSwitches {
	demoSwitch: boolean;
	passcodesEnabled: {
		DEV: boolean;
		CODE: boolean;
		PROD: boolean;
	};
}

export const featureSwitches: FeatureSwitches = {
	demoSwitch: false,
	passcodesEnabled: {
		DEV: true,
		CODE: true,
		PROD: true,
	},
};
