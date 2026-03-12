# MarTech Configuration Guide

This project uses the [adobe-rnd/aem-martech](https://github.com/adobe-rnd/aem-martech) plugin for Adobe Experience Platform WebSDK and Adobe Client Data Layer integration.

## Configuration via Metadata

The martech plugin is configured using page-level metadata. Add these metadata fields to your documents:

### Required Metadata

- **`datastream-id`**: Your Adobe Experience Platform datastream ID
- **`org-id`**: Your Adobe organization ID (IMS Org ID)

### Optional Metadata

- **`target`**: Set to any value to enable Adobe Target/AJO personalization (e.g., `target: true`)
- **`launch-urls`**: Comma-separated list of Adobe Launch container URLs for tag management

### Example Metadata Block

```
---
datastream-id: your-datastream-id-here
org-id: your-org-id-here@AdobeOrg
target: true
launch-urls: https://assets.adobedtm.com/launch-xxx.min.js
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
- Executes Launch tags and other non-essential scripts
- Runs ~3 seconds after page load to minimize performance impact

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

- Preload hints are configured in `head.html` for optimal performance
- Preconnect to `edge.adobedc.net` reduces DNS lookup time
- Personalization timeout is 1000ms by default (configurable)
- Analytics loading is deferred to avoid LCP impact

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
