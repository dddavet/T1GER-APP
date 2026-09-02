import { readFileSync, writeFileSync } from 'node:fs';

// OneSignal 5.5.2 rewrites the same Android manifest after EVERY Gradle project,
// even when no Huawei service exists. On Windows this races file-mapped readers.
// Keep its compatibility cleanup, but write only when it actually changes data.
const path = 'node_modules/onesignal-cordova-plugin/build-extras-onesignal.gradle';
const original = '   androidManifest.text = fileContentsReplaced';
const patched = '   if (androidManifest.text != fileContentsReplaced) { androidManifest.text = fileContentsReplaced }';
const source = readFileSync(path, 'utf8');
if (source.includes(patched)) {
  console.log('OneSignal manifest-write guard already applied.');
} else if (source.includes(original)) {
  writeFileSync(path, source.replace(original, patched));
  console.log('Applied OneSignal no-op manifest-write guard.');
} else {
  throw new Error('OneSignal Gradle script changed upstream: review/remove the manifest-write compatibility patch.');
}
