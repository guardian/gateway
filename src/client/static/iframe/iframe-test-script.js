/* eslint-disable functional/immutable-data -- This is a browser testing script */
/* eslint-disable no-undef -- This is a browser testing script */
/* eslint-env browser -- This is a browser testing script */
/* eslint-disable no-console -- This is a browser testing script */
/**
 * Browser testing script for iframe integration
 * Open browser console and run this script to test iframe functionality
 *
 * Usage:
 * 1. Open browser developer tools
 * 2. Go to Console tab
 * 3. Copy and paste this script
 * 4. Tests will run automatically, or call window.iframeTests.runAllTests()
 */

// Test 1: Check if iframe headers are properly detected
async function testIframeHeaders() {
	console.log('🧪 Testing iframe header detection...');

	try {
		// Test with sec-fetch-dest header
		const response1 = await fetch('/signin', {
			headers: {
				'sec-fetch-dest': 'iframe',
			},
		});

		console.log('✅ sec-fetch-dest test:', {
			status: response1.status,
			xFrameOptions: response1.headers.get('x-frame-options'),
		});

		// Test with custom header
		const response2 = await fetch('/signin', {
			headers: {
				'x-iframe-request': 'true',
			},
		});

		console.log('✅ x-iframe-request test:', {
			status: response2.status,
			xFrameOptions: response2.headers.get('x-frame-options'),
		});
	} catch (error) {
		console.error('❌ Header test failed:', error);
	}
}

// Test 2: Check iframe CSP configuration
function testCSP() {
	console.log('🧪 Testing Content Security Policy...');

	const metaTags = document.querySelectorAll(
		'meta[http-equiv="Content-Security-Policy"]',
	);
	metaTags.forEach((meta, index) => {
		const content = meta.getAttribute('content');
		if (content?.includes('frame-ancestors')) {
			console.log(`✅ CSP ${index + 1}:`, content);
		}
	});
}

// Test 3: Check iframe loading capabilities
function testIframeLoading() {
	console.log('🧪 Testing iframe loading...');

	const iframe = document.createElement('iframe');
	iframe.src = '/signin';
	iframe.style.width = '400px';
	iframe.style.height = '300px';
	iframe.style.border = '1px solid #ccc';
	iframe.sandbox = 'allow-scripts allow-forms allow-same-origin';

	iframe.onload = () => {
		console.log('✅ Iframe loaded successfully');
		try {
			const doc = iframe.contentDocument;
			if (doc) {
				const forms = doc.querySelectorAll('form');
				console.log(`✅ Found ${forms.length} form(s) in iframe`);
			}
		} catch (e) {
			console.log('⚠️ Cross-origin restrictions apply:', e.message);
		}
	};

	iframe.onerror = (error) => {
		console.error('❌ Iframe failed to load:', error);
	};

	document.body.appendChild(iframe);

	// Remove after 10 seconds
	setTimeout(() => {
		document.body.removeChild(iframe);
		console.log('🧹 Test iframe removed');
	}, 10000);
}

// Test 4: Check cookie behavior
async function testCookieBehavior() {
	console.log('🧪 Testing cookie behavior...');

	// Clear existing cookies for clean test
	document.cookie.split(';').forEach(function (c) {
		document.cookie = c
			.replace(/^ +/, '')
			.replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
	});

	// Make request that should set cookies
	try {
		const response = await fetch('/signin', {
			headers: {
				'sec-fetch-dest': 'iframe',
			},
			credentials: 'include',
		});

		console.log('✅ Response received');
		console.log('📄 Current cookies:', document.cookie);

		// Check Set-Cookie headers (might not be visible due to security)
		const setCookie = response.headers.get('set-cookie');
		if (setCookie) {
			console.log('🍪 Set-Cookie header:', setCookie);
		} else {
			console.log('⚠️ Set-Cookie headers not visible (browser security)');
		}
	} catch (error) {
		console.error('❌ Cookie test failed:', error);
	}
}

// Run all tests
async function runAllTests() {
	console.log('🚀 Starting iframe integration tests...');
	console.log('====================================');

	await testIframeHeaders();
	console.log('');

	testCSP();
	console.log('');

	testIframeLoading();
	console.log('');

	await testCookieBehavior();
	console.log('');

	console.log('✨ All tests completed!');
}

// Auto-run if script is loaded
if (typeof window !== 'undefined') {
	// Run tests after page loads
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			console.log(
				'🔧 Iframe testing script loaded. Use window.iframeTests.runAllTests() to run tests.',
			);
		});
	} else {
		console.log(
			'🔧 Iframe testing script loaded. Use window.iframeTests.runAllTests() to run tests.',
		);
	}
}

// Export functions for manual testing
window.iframeTests = {
	runAllTests,
	testIframeHeaders,
	testCSP,
	testIframeLoading,
	testCookieBehavior,
};
