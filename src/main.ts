/* eslint-disable no-console */
/***************************************************************************************************
 * Static Polyfills (Always Loaded)
 * You can manually import essential polyfills here.
 */

(function() {
	// Browser detection logic for old browsers
	function detectOldBrowser() {
		const ua: string
			= window.navigator.userAgent;

		// Detect Internet Explorer 11 or below
		const isIE: boolean
			= ua.indexOf( 'MSIE ' ) > -1 || ua.indexOf( 'Trident/' ) > -1;

		// Detect old Safari (Safari 10 or below)
		const isOldSafari = () => {
			// Detect Safari
			const isSafari: boolean
				= /^((?!chrome|android).)*safari/i.test( ua );

			// Detect absence of modern APIs (e.g., fetch or Promises, or WebAssembly)
			const isMissingModernFeatures: boolean
				= !( 'fetch' in window )
				|| !( 'Promise' in window )
				|| !( 'WebAssembly' in window );

			// Safari user agent should have Version/<version> Safari
			const safariVersionMatch: RegExpMatchArray
				= ua.match(/Version\/(\d+)\./);
			const safariVersion: number
				= safariVersionMatch
					? parseInt( safariVersionMatch[ 1 ], 10 )
					: 0;

			return isSafari
				&& ( safariVersion <= 10 || isMissingModernFeatures );
		};

		return isIE || isOldSafari();
	}

	if ( detectOldBrowser() ) {
		// Dynamically load necessary polyfills for old browsers
		import( 'core-js/es/promise' ).then(() => console.log( 'Promise polyfill loaded.' ));
		import( 'core-js/es/array' ).then(() => console.log( 'Array polyfill loaded.' ));
	}
})();

/** Polyfills needed for evergreen browsers (Chrome, Firefox, Edge, Safari, etc.) **/
import 'core-js/es/reflect'; // Necessary for Angular in modern browsers

// Zone.js is required for Angular itself (always needed)
import 'zone.js'; // Included with Angular CLI

// Import IntersectionObserver polyfill (useful for lazy loading or other features)
import 'intersection-observer';

// Add global to window, assigning the value of window itself for compatibility with certain libraries
( window as any ).global = window;

/***************************************************************************************************
 * Dynamic Polyfills (Loaded Based on Browser Detection)
 * You can dynamically load additional polyfills only when needed, using feature detection.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { ENVIRONMENT } from './environments/environment';

if ( ENVIRONMENT.PRODUCTION ) {
	enableProdMode();
}

platformBrowserDynamic()
.bootstrapModule( AppModule )
.then(() => {
	'serviceWorker' in navigator
		&& ENVIRONMENT.PRODUCTION
		&& navigator.serviceWorker.register( './ngsw-worker.js' );
})
.catch( ( err: Error ) => console.error( err ) );
