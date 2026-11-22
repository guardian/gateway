export type DeviceType = 'mobile' | 'desktop';

interface NavigatorUAData {
	mobile: boolean;
	platform: string;
}

export const detectDevice = (): DeviceType => {
	if (typeof navigator === 'undefined') return 'desktop';

	// iPadOS 13+ reports as a Mac. This line makes sure it is handled as a mobile device
	// Order matters. This has to be before the UA Chrome check below.
	if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) {
		return 'mobile';
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
	// Supported only in Chrome
	const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData })
		.userAgentData;
	if (typeof uaData?.mobile === 'boolean') {
		return uaData.mobile ? 'mobile' : 'desktop';
	}

	// Safari / Firefox fallback
	if (/Android|iPhone|iPod/i.test(navigator.userAgent)) return 'mobile';

	return 'desktop';
};
