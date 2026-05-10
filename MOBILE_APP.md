# MindCare AI Mobile App

The React app is configured as a Capacitor mobile app.

## Mobile Projects

- Android: `client/android`
- iOS: `client/ios`

## Build Web Assets And Sync

```bash
cd client
npm run mobile:build
```

## Android APK / AAB

Install Android Studio with the Android SDK, then:

```bash
cd client
npm run mobile:open:android
```

In Android Studio, use:

- `Build > Build Bundle(s) / APK(s) > Build APK(s)` for a test APK
- `Build > Generate Signed Bundle / APK` for Play Store release

## iOS App

iOS builds require macOS and Xcode:

```bash
cd client
npm run mobile:open:ios
```

Then archive/sign the app from Xcode.

## Production Services

The mobile build uses:

- API: `https://server-sepia-two-58.vercel.app/api`
- ML service: `https://ml-service-nine.vercel.app`
