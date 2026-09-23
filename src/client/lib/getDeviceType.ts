export type DeviceType = 'mobile' | 'desktop';

interface NavigatorUAData {
	mobile: boolean;
	platform: string;
}

export const detectDevice = (): DeviceType => {
	if (typeof navigator === 'undefined') return 'desktop';

	const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData })
		.userAgentData;

	if (typeof uaData?.mobile === 'boolean') {
		return uaData.mobile ? 'mobile' : 'desktop';
	}

	return 'desktop';
};
