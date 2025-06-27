# PWA Setup Guide - Data Enricher

The Data Enricher is now configured as a **Progressive Web App (PWA)** that can be installed on desktop and mobile devices.

## 🚀 Features Added

### ✅ PWA Manifest
- **File**: `public/manifest.json`
- **Features**: App name, icons, theme colors, display mode
- **Shortcuts**: Quick actions for new enrichment and results

### ✅ Service Worker
- **File**: `public/service-worker.js`
- **Features**: Offline caching, background sync, update notifications
- **Registration**: `src/serviceWorkerRegistration.ts`

### ✅ Install Prompt
- **Component**: `src/components/PwaInstallPrompt.tsx`
- **Features**: Custom install banner, dismiss functionality
- **Timing**: Shows after 3 seconds if installable

### ✅ PWA Icons
- **Sizes**: 96x96, 192x192, 512x512 pixels
- **Format**: PNG with "DE" branding
- **Location**: `public/icon-*.png`

## 📱 Installation

### Desktop (Chrome/Edge)
1. Visit the app in browser
2. Look for install icon in address bar
3. Click "Install Data Enricher"
4. App opens in standalone window

### Mobile (iOS/Android)
1. Open in Safari/Chrome
2. Tap Share button
3. Select "Add to Home Screen"
4. App appears on home screen

### Custom Install Prompt
- Appears automatically after 3 seconds
- Click "Install App" for one-click install
- Dismiss with "Not Now" or X button

## 🔧 Development

### Build PWA
```bash
cd ui/data-enricher
npm run build:pwa
```

### Test Locally
```bash
npm run serve
# Opens at http://localhost:3000
```

### Test PWA Features
1. Open Chrome DevTools
2. Go to Application tab
3. Check "Service Workers" and "Manifest"
4. Use "Add to homescreen" in Lighthouse

## 📊 PWA Capabilities

### ✅ Installable
- Meets PWA criteria
- Custom install prompt
- Desktop and mobile support

### ✅ Offline Ready
- Caches core app files
- Fallback to cached version
- Background sync for requests

### ✅ App-like Experience
- Standalone display mode
- Custom theme colors
- No browser UI

### ✅ Fast Loading
- Service worker caching
- Instant subsequent loads
- Performance optimized

## 🎯 User Benefits

### Desktop Installation
- **Quick Access**: Desktop shortcut
- **Full Screen**: No browser chrome
- **Notifications**: Future PWA updates
- **Offline Use**: Core functionality available

### Mobile Installation
- **Home Screen**: Native app feel
- **Faster Launch**: Instant loading
- **Data Savings**: Cached resources
- **Better UX**: Optimized mobile experience

## 🔍 Testing Checklist

### PWA Criteria
- [ ] HTTPS served (required for PWA)
- [ ] Manifest.json valid
- [ ] Service worker registered
- [ ] Icons provided (192px, 512px)
- [ ] Start URL responds with 200

### Installation Testing
- [ ] Chrome shows install prompt
- [ ] Custom install banner appears
- [ ] App installs successfully
- [ ] Opens in standalone mode
- [ ] Icons display correctly

### Offline Testing
- [ ] App loads when offline
- [ ] Core features work offline
- [ ] Graceful degradation for API calls
- [ ] Service worker updates properly

## 📝 Customization

### Update App Icons
1. Replace files in `public/`:
   - `icon-96.png`
   - `icon-192.png` 
   - `icon-512.png`
2. Keep same dimensions
3. Rebuild: `npm run build:pwa`

### Modify App Name
1. Edit `public/manifest.json`:
   ```json
   {
     "short_name": "Your App",
     "name": "Your App - Full Name"
   }
   ```
2. Update `public/index.html` title

### Change Theme Colors
1. Update `manifest.json`:
   ```json
   {
     "theme_color": "#your-color",
     "background_color": "#your-background"
   }
   ```
2. Update CSS custom properties

### Add App Shortcuts
1. Edit `manifest.json` shortcuts array:
   ```json
   {
     "shortcuts": [
       {
         "name": "Quick Action",
         "url": "/?action=quick",
         "icons": [{"src": "icon-96.png", "sizes": "96x96"}]
       }
     ]
   }
   ```

## 🚨 Important Notes

### Production Requirements
- **HTTPS**: PWAs require secure connection
- **Valid Manifest**: Must pass validation
- **Service Worker**: Must register successfully
- **Icons**: Minimum 192px and 512px required

### Browser Support
- **Chrome**: Full PWA support
- **Firefox**: Basic support
- **Safari**: iOS 11.3+ support
- **Edge**: Full support

### Deployment
When deploying to production:
1. Ensure HTTPS is enabled
2. Service worker serves from root domain
3. Manifest.json is accessible
4. Icons are properly sized

## 🔄 Updates

The PWA will automatically update when you deploy new versions:
1. Service worker detects changes
2. Downloads new files in background
3. Prompts user to refresh for updates
4. Seamless update process

## 📊 Analytics

Track PWA usage:
- Install events via `beforeinstallprompt`
- Offline usage via service worker
- Performance metrics via Web Vitals
- User engagement in standalone mode

---

**Ready to Install**: Your Data Enricher is now a fully functional PWA! 🎉