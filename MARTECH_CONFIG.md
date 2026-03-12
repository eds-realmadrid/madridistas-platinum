# MarTech Configuration Guide

This project uses the [adobe-rnd/aem-martech](https://github.com/adobe-rnd/aem-martech) plugin for Adobe Experience Platform WebSDK and Adobe Client Data Layer integration.

## Default Configuration

The martech plugin is configured with the following default values in `scripts.js`:

- **`datastreamId`**: `57d34a92-1686-4574-ae1e-7ea17064d5f1`
- **`orgId`**: `2D10A5EF56EBE7097F000101@AdobeOrg`
- **`launch-url`**: `https://assets.adobedtm.com/145b4bb02250/7acb236f9bde/launch-125e7f9e1eeb-development.min.js`
- **`personalization`**: Enabled by default (Adobe Target/AJO)

These defaults apply to all pages automatically. No metadata configuration is required unless you need to override these values.

## Configuration via Metadata (Optional Overrides)

You can override the default configuration on a per-page basis using metadata:

### Optional Metadata

- **`datastream-id`**: Override the default datastream ID
- **`org-id`**: Override the default organization ID
- **`target`**: Set to `false` to disable Adobe Target/AJO personalization on a specific page
- **`launch-url`**: Override the default Launch container URL

### Example Metadata Block

To disable personalization on a specific page:

```
---
target: false
---
```

To override all values:

```
---
datastream-id: your-datastream-id-here
org-id: your-org-id-here@AdobeOrg
target: false
launch-url: https://assets.adobedtm.com/launch-xxx.min.js
---
```

## How It Works

The martech integration follows Adobe's three-phase loading approach:

### 1. Eager Phase (loadEager)
- Initializes the MarTech plugin
- Handles personalization (Target/AJO) before content renders
- Prevents content flicker by waiting for personalization before displaying content

### 2. Lazy Phase (loadLazy)
- Loads analytics after main content renders
- Executes after header and footer are loaded
- Avoids impacting Largest Contentful Paint (LCP)

### 3. Delayed Phase (loadDelayed)
- Loads Adobe Launch container script using `loadScript()` helper
- Launch script is loaded as a traditional script tag (not ES module)
- Executes ~3 seconds after page load to minimize performance impact
- Compatible with Content Security Policy using 'strict-dynamic'

## Consent Management

The library defaults to "pending" consent for privacy compliance. Update user consent when your consent management system provides user preferences:

```javascript
import { updateUserConsent } from '../plugins/martech/src/index.js';

updateUserConsent({
  collect: boolean,    // Allow data collection
  marketing: boolean,  // Allow marketing use
  personalize: boolean, // Allow personalization
  share: boolean       // Allow data sharing
});
```

## Prerequisites

Before using this integration, ensure you have:

1. **Adobe Experience Platform** access with basic permissions
2. **Adobe Analytics** configured
3. **Adobe Target** or **Adobe Journey Optimizer** (if using personalization)
4. **Adobe Launch** container configured to:
   - Use self-hosted alloy instance (v2.34.0+)
   - Set instance name to "alloy" in extension build options

## Additional Functions

The plugin exports additional functions for custom implementations:

- `pushToDataLayer()`: Push generic payloads to Adobe Client Data Layer
- `sendEvent()`: Proxy to alloy sendEvent
- `sendAnalyticsEvent()`: Helper for sending analytics events
- `isPersonalizationEnabled()`: Check if personalization is active

## Performance Considerations

- Preconnect to `edge.adobedc.net` in `head.html` reduces DNS lookup time
- Scripts load dynamically via ES6 imports (CSP-compliant with `'strict-dynamic'`)
- Personalization timeout is 1000ms by default (configurable)
- Analytics loading is deferred to avoid LCP impact
- No preload hints used to avoid CSP violations with strict-dynamic policy

## Testing

Test your martech implementation on different environments:

- **Local**: `http://localhost:3000`
- **Preview**: `https://{branch}--{repo}--{owner}.aem.page/`
- **Production**: `https://main--{repo}--{owner}.aem.live/`

Use browser developer tools to verify:
- Adobe Client Data Layer events in console
- Network requests to `edge.adobedc.net`
- Target/AJO offers delivered (if personalization enabled)
- Launch container loading (if configured)

## Troubleshooting

### Personalization Not Working
- Verify `target` metadata is set on the page
- Check that `datastream-id` and `org-id` are correct
- Ensure Target activities are configured and active
- Check browser console for errors

### Analytics Events Not Sending
- Verify datastream configuration in Adobe Experience Platform
- Check network tab for requests to `edge.adobedc.net`
- Ensure consent is not blocking data collection

### Launch Tags Not Loading
- Verify `launch-urls` metadata contains valid URLs
- Check that Launch container is published
- Ensure Launch is configured to use self-hosted alloy instance

## Security & Privacy

- Never commit credentials or IDs to git repositories
- Consult legal counsel before changing default consent behavior
- Follow GDPR/CCPA requirements for data collection
- Use `.hlxignore` to prevent sensitive files from being served

## Updating the Plugin

To update to the latest version of the martech plugin:

```bash
git subtree pull --squash --prefix plugins/martech https://github.com/adobe-rnd/aem-martech.git main
```
