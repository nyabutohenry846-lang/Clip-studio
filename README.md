# ClipStudio — CapCut-inspired starter

This is an original video-editor prototype inspired by common mobile editing workflows. It is not CapCut and does not include CapCut's proprietary code, assets, templates, fonts, or services.

## Included in this starter
- Responsive editing workspace for web and Android WebView
- Import and preview a local video
- Basic in/out trim controls and playback
- Text overlay preview
- Load an audio file for local preview
- Basic WebM export with the visible text overlay (browser support varies)
- Capacitor Android project configuration

## Run the web app
1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Run `npm run start`.
4. Open the local URL printed by Vite.

## Build for Android
You need Android Studio and the Android SDK.
1. Run `npm install`.
2. Run `npm run android:add` once to generate the native Android project.
3. Run `npm run android:sync` after web changes.
4. Run `npm run android:open` to open the project in Android Studio.
5. In Android Studio, build an APK or Android App Bundle.

## Deploy the website
1. Run `npm install && npm run build`.
2. Deploy the generated `dist/` folder to a static host such as Netlify, Vercel, or Cloudflare Pages.

## Important prototype limitations
This is a first working foundation, not a feature-complete professional editor. Split currently marks the playhead but does not create independently editable clip segments. Audio is preview-loaded but is not yet mixed into the exported file. Export currently produces WebM through browser MediaRecorder; MP4/H.264 export, multi-track editing, transitions, effects, filters, cloud projects, templates, and advanced codecs need additional implementation and testing. Android export and local file permissions should be tested on physical devices.
