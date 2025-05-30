# Auto Import Feature

The Auto Import feature allows users to automatically import new images from their photo library into Karakeep as asset bookmarks.

## Features

- **Automatic Scanning**: Periodically scans the photo library for new images
- **Configurable Interval**: Users can set scan intervals from 5 to 180 minutes
- **Background Processing**: Works in the background on iOS using background fetch
- **Permission Management**: Handles media library permissions gracefully
- **Test Functionality**: Users can test the scanning functionality

## How It Works

1. **Permission Request**: The app requests media library access when auto-import is enabled
2. **Periodic Scanning**: The service scans for new photos based on the configured interval
3. **Image Upload**: New images are uploaded to the server as assets
4. **Bookmark Creation**: Asset bookmarks are created for each imported image
5. **Duplicate Prevention**: Tracks imported images to prevent duplicates

## Settings

### Enable Auto Import

Toggle to enable/disable the auto-import functionality.

### Scan Interval

Configure how often the app should scan for new images (5-180 minutes).

### Test Scan

Run a test scan to see what images would be imported without actually importing them.

### Test Background Task (Development Only)

Test the background task functionality to simulate automatic scanning behavior.

## Technical Implementation

### Components

- `AutoImportService`: Singleton service that handles scanning and importing
- `useAutoImport`: React hook for interacting with the service
- Auto-import settings page: UI for configuring the feature

### Background Processing

- **iOS**: Uses `expo-background-task` and `expo-task-manager` for background execution
- **Android**: Relies on foreground intervals when the app is active

### Permissions

- **iOS**: `NSPhotoLibraryUsageDescription` in Info.plist, `UIBackgroundModes` with "background-processing"
- **Android**: `READ_EXTERNAL_STORAGE` and `READ_MEDIA_IMAGES` permissions

### Migration from expo-background-fetch

The implementation has been updated to use the new `expo-background-task` API which replaces the deprecated `expo-background-fetch`. Key changes:

- Updated to use `BackgroundTask.registerTaskAsync()` instead of `BackgroundFetch.registerTaskAsync()`
- Background task results now use `BackgroundTaskResult.Success` and `BackgroundTaskResult.Failed`
- Simplified configuration options (removed deprecated properties)
- Background mode changed from "background-fetch" to "background-processing"

## Limitations

1. **Folder Selection**: Currently scans all photos rather than specific folders due to platform limitations
2. **Background Limits**: Background execution is limited by OS restrictions
3. **Battery Impact**: Frequent scanning may impact battery life

## Future Improvements

1. **Smart Folder Selection**: Better folder/album selection interface
2. **Selective Import**: Allow users to choose which images to import
3. **Metadata Preservation**: Preserve image metadata during import
4. **Conflict Resolution**: Better handling of duplicate images
5. **Progress Indicators**: Show import progress to users
