# Release checklist

## Automated engineering gates

- [x] Product/catalog alignment for Investing, AI, and Psychology.
- [x] Learn → Apply → Master primary navigation.
- [x] Stable Investing progression and Apply persistence retained.
- [x] Type checking, curriculum, core progression, journey, and responsive shell tests.
- [x] Full aggregate test suite after final diff.
- [x] Production web build and release preflight after final diff.
- [x] Android debug build and native unit tests after final sync.
- [x] Signed Android AAB generated from the release-candidate source.

## External acceptance

- [ ] Physical Android acceptance: camera, file picker, push permission/delivery, screen-time permission/fallback, offline/reconnect, and delete-account flow.
- [ ] Firebase production functions/secrets deployed and smoke-tested.
- [ ] RevenueCat products/entitlements configured before enabling checkout.
- [ ] Google Play listing, data safety, content rating, reviewer access, screenshots, and closed-test requirements completed.
- [ ] iOS archive and App Store setup completed on macOS if iOS ships in this release.
