# MarTech Configuration Guide

This document explains how to complete the Adobe MarTech integration by replacing placeholder values in `scripts/scripts.js`.

## 🔧 Configuration Steps

### 1. Get Your Datastream ID

**Where:** https://platform.adobe.com/

**Steps:**
1. Log into Adobe Experience Platform
2. Navigate to **Datastreams** in the left menu
3. Find the datastream you want to use (or create one)
4. Copy the Datastream ID

**Replace in scripts/scripts.js:**
```javascript
datastreamId: 'YOUR_DATASTREAM_ID',  // ← Replace this
```

**Example:**
```javascript
datastreamId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
```

---

### 2. Get Your Organization ID (IMS Org ID)

**Where:** https://platform.adobe.com/

**Steps:**
1. Log into Adobe Experience Platform
2. Navigate to **Queries** in the left menu
3. Under **Credentials** section, find **IMS Org ID**
4. Copy the Organization ID (format: XXXXXXXX@AdobeOrg)

**Replace in scripts/scripts.js:**
```javascript
orgId: 'YOUR_ORG_ID@AdobeOrg',  // ← Replace this
```

**Example:**
```javascript
orgId: 'A1B2C3D4E5F6G7H8@AdobeOrg',
```

---

### 3. Get Your Adobe Tags Launch URL

**Where:** https://experience.adobe.com/#/data-collection/

**Steps:**
1. Log into Adobe Data Collection
2. Go to **Tags**
3. Open your Web property
4. Navigate to **Environments**
5. Find the **Development** environment
6. Copy the entire script URL (from `https://` to `.min.js`)

**Replace in scripts/scripts.js:**
```javascript
launchUrls: ['YOUR_LAUNCH_URL'],  // ← Replace this
```

**Example:**
```javascript
launchUrls: ['https://assets.adobedtm.com/1234567890abcdef/abc123def456/launch-abc123def456.min.js'],
```

---

## 📝 Quick Find & Replace

Open `scripts/scripts.js` and search for these placeholders:

| Placeholder | Line | What to Replace With |
|-------------|------|---------------------|
| `YOUR_DATASTREAM_ID` | ~54 | Your Adobe Datastream ID |
| `YOUR_ORG_ID@AdobeOrg` | ~55 | Your IMS Organization ID |
| `YOUR_LAUNCH_URL` | ~64 | Your Adobe Tags script URL |

---

## ✅ After Configuration

Once you've replaced all placeholders:

1. **Commit changes:**
   ```bash
   git add scripts/scripts.js
   git commit -m "Configure Adobe MarTech with production values"
   git push origin martech
   ```

2. **Set up Adobe Tags:**
   - Go to https://experience.adobe.com/#/data-collection/
   - Install **Adobe Client Data Layer** extension
   - Publish to Development environment

3. **Test the integration:**
   - Visit your site in incognito mode
   - Open Chrome DevTools Console
   - Look for `[alloy]` messages
   - Verify ECID is collected

4. **Verify in Adobe Experience Platform:**
   - Go to https://experience.adobe.com/platform
   - Navigate to **Profiles** > **Browse**
   - Search by ECID to see collected data

---

## 🔍 Testing Checklist

- [ ] All three placeholder values replaced
- [ ] No syntax errors in scripts.js
- [ ] Code committed and pushed
- [ ] Adobe Client Data Layer extension installed
- [ ] Tags published to Development
- [ ] ECID appears in browser console
- [ ] Profile data visible in AEP

---

## 📚 Reference Links

- **Adobe Experience Platform:** https://platform.adobe.com/
- **Adobe Data Collection (Tags):** https://experience.adobe.com/#/data-collection/
- **MarTech Plugin Docs:** https://github.com/adobe-rnd/aem-martech
- **Tutorial:** https://experienceleague.adobe.com/en/docs/platform-learn/tutorial-one-adobe/assetmgmt/assetm1/ex5

---

## 🆘 Troubleshooting

### "Cannot find module '../plugins/martech/src/index.js'"
- Make sure you ran: `git subtree add --squash --prefix plugins/martech https://github.com/adobe-rnd/aem-martech.git main`
- Verify `plugins/martech/` folder exists

### "ECID not showing in console"
- Check that all placeholder values are replaced
- Verify Adobe Tags extension is installed and published
- Check browser console for errors

### "Profile not found in AEP"
- Wait a few minutes for data to process
- Verify you copied the correct ECID from console
- Check datastream configuration in Adobe

---

## 📋 Current Status

✅ MarTech plugin added to repository
✅ head.html updated with preload/preconnect
✅ scripts.js updated with martech integration
⏳ TODO: Replace placeholder configuration values
⏳ TODO: Set up Adobe Tags extensions
⏳ TODO: Test and verify data collection
