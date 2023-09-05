export type GeoLocation = 'GB' | 'US' | 'AU' | 'EU' | 'ROW';
export type PermissionedGeolocation =
	| 'AU_permissioned'
	| 'US_permissioned'
	| 'EU_permissioned'; // only used by consent pages:read functions to localise content
