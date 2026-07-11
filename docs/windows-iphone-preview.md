# Windows iPhone Preview Workflow

## What Works On Windows

Use the local iPhone-sized preview:

```bash
npx vite --host 0.0.0.0 --port 3000
```

Open:

```text
http://localhost:3000/iphone.html
```

This wraps the real T1GER app in a 390x844 iPhone-style frame. It is the fastest way to build layout, onboarding, navigation, paywall, and mission flows from Windows.

## What This Is Not

This is not Apple's iOS Simulator. It is a constrained mobile web preview. It will catch most responsive UI problems, but it will not catch:

- Safari-only WebKit bugs.
- iOS camera permission edge cases.
- Native Capacitor plugin behavior.
- App Store signing/build issues.

## Why The Real iOS Simulator Is Not Available On Windows

Apple distributes iOS Simulator as part of Xcode. Xcode requires macOS. Capacitor iOS projects are also managed through Xcode.

## Best Options Without Owning A Mac

1. Build UI locally with `http://localhost:3000/iphone.html`.
2. Use Chrome DevTools device mode for quick viewport testing.
3. Use BrowserStack/App Live for real iPhone browser/device testing.
4. Use a rented Mac/cloud Mac only when native iOS validation is needed.
5. Use Appetize only after a simulator `.app` build exists, which still requires Xcode somewhere.

## Recommended T1GER Loop

1. Build in Windows with the iPhone preview.
2. Run `npm run lint` and `npm run build`.
3. Run `npx cap sync ios` to keep the iOS project updated.
4. Once per milestone, validate on a real iOS environment through Mac/cloud/device service.

