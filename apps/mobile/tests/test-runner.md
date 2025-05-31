# Karakeep Mobile App Test Suite

This document describes the comprehensive test suite for the newly added local DB services and file scanning/importing services in the Karakeep mobile app.

## Test Structure

### 📁 Test Organization

```
apps/mobile/
├── tests/
│   ├── setup.ts                                    # Global test setup and mocks
│   └── test-runner.md                             # This documentation
├── lib/
│   ├── watermelon/
│   │   └── models/
│   │       └── __tests__/
│   │           ├── Bookmark.test.ts               # WatermelonDB Bookmark model tests
│   │           └── ImportedFile.test.ts           # WatermelonDB ImportedFile model tests
│   └── __tests__/
│       ├── autoImport.ImportedFilesCache.test.ts  # ImportedFilesCache with WatermelonDB tests
│       └── autoImport.FileScanning.test.ts        # File scanning and importing tests
├── vitest.config.ts                               # Vitest configuration
└── package.json                                   # Updated with test scripts
```

## 🧪 Test Categories

### 1. WatermelonDB Models Tests

#### **Bookmark Model Tests** (`lib/watermelon/models/__tests__/Bookmark.test.ts`)

- ✅ Model property validation
- ✅ Bookmark type support (link, text, asset, unknown)
- ✅ Date property handling
- ✅ Boolean property validation
- ✅ Content validation (long titles, special characters, unicode)
- ✅ Optional property handling

#### **ImportedFile Model Tests** (`lib/watermelon/models/__tests__/ImportedFile.test.ts`)

- ✅ Source URI handling (file://, content://, StorageAccessFramework URIs)
- ✅ Timestamp handling and readonly constraints
- ✅ Model operations (markAsDeleted, update)
- ✅ Data integrity and consistency
- ✅ Performance with rapid successive imports
- ✅ Edge cases (empty URIs, long paths, unicode)

### 2. ImportedFilesCache Tests

#### **WatermelonDB Cache Tests** (`lib/__tests__/autoImport.ImportedFilesCache.test.ts`)

- ✅ Cache initialization (empty and with existing records)
- ✅ File existence checking
- ✅ Adding imported files (with duplicate prevention)
- ✅ Removing imported files
- ✅ Retrieving all imported files
- ✅ Cache clearing operations
- ✅ Statistics calculation
- ✅ Error handling for all operations

### 3. File Scanning and Importing Tests

#### **Complete Import Pipeline Tests** (`lib/__tests__/autoImport.FileScanning.test.ts`)

- ✅ File discovery from configured folders
- ✅ Image file filtering by extension
- ✅ File information processing
- ✅ Filename extraction from StorageAccessFramework URIs
- ✅ Image import process (upload → bookmark creation)
- ✅ MIME type detection for various image formats
- ✅ Configuration validation
- ✅ Error handling (upload errors, bookmark creation errors)
- ✅ Batch processing of multiple files
- ✅ Performance testing with large file lists
- ✅ Concurrent scan handling

## 🔧 Test Configuration

### Vitest Setup

- **Environment**: jsdom (for React Native compatibility)
- **Setup Files**: `tests/setup.ts` (global mocks and configuration)
- **Globals**: Enabled for describe/it/expect
- **Coverage**: Available via `--coverage` flag

### Mocked Dependencies

- **React Native modules**: Platform, Alert, AppState
- **Expo modules**: SecureStore, FileSystem, BackgroundTask, TaskManager
- **External libraries**: react-native-blob-util
- **WatermelonDB**: Database, adapters, decorators, query operations
- **tRPC**: API mutations and utilities
- **App settings**: Mock settings with auto-import configuration

## 🚀 Running Tests

### Available Commands

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI (browser-based test runner)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Running Specific Test Suites

```bash
# Run only model tests
pnpm test lib/watermelon/models

# Run only ImportedFilesCache tests
pnpm test ImportedFilesCache

# Run only file scanning tests
pnpm test FileScanning

# Run a specific test file
pnpm test lib/__tests__/autoImport.FileScanning.test.ts
```

## 📊 Test Coverage Areas

### Database Operations

- ✅ Model creation and validation
- ✅ Query operations (where, fetch, fetchCount)
- ✅ Write transactions
- ✅ Record deletion (markAsDeleted)
- ✅ Error handling for database operations

### File System Operations

- ✅ Directory reading via StorageAccessFramework
- ✅ File information retrieval
- ✅ File existence checking
- ✅ Error handling for file system operations

### Auto-Import Pipeline

- ✅ End-to-end import flow
- ✅ File filtering and validation
- ✅ Asset upload process
- ✅ Bookmark creation
- ✅ Import tracking and deduplication

### Error Scenarios

- ✅ Database connection failures
- ✅ File system permission errors
- ✅ Network upload failures
- ✅ API communication errors
- ✅ Malformed data handling

## 🎯 Test Quality Metrics

### Coverage Goals

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

### Test Types Distribution

- **Unit Tests**: 70% (individual functions and methods)
- **Integration Tests**: 25% (component interactions)
- **End-to-End Tests**: 5% (complete workflows)

## 🔍 Key Test Scenarios

### Critical Path Testing

1. **New File Import**: Discover → Filter → Upload → Create Bookmark → Track
2. **Duplicate Prevention**: Check cache → Skip if exists
3. **Error Recovery**: Handle failures gracefully without data loss
4. **Performance**: Handle large file batches efficiently

### Edge Case Coverage

- Empty folders and file lists
- Malformed URIs and filenames
- Network timeouts and retries
- Database transaction failures
- Concurrent operation handling

## 🛠️ Maintenance

### Adding New Tests

1. Follow the established naming convention: `[feature].[component].test.ts`
2. Use the mocks defined in `tests/setup.ts`
3. Include both happy path and error scenarios
4. Add performance tests for data-intensive operations

### Updating Mocks

When adding new dependencies or changing existing ones:

1. Update `tests/setup.ts` with new mocks
2. Ensure mocks match the actual API interfaces
3. Update test assertions accordingly

### CI/CD Integration

Tests are designed to run in headless environments:

- No real file system dependencies
- No network calls (all mocked)
- Deterministic results
- Fast execution (<30 seconds for full suite)

## 📈 Future Enhancements

### Planned Test Additions

- [ ] Sync logic tests (Phase 4)
- [ ] UpdatingBookmarkList WatermelonDB integration tests (Phase 3)
- [ ] Cross-platform compatibility tests (iOS vs Android)
- [ ] Performance benchmarking tests
- [ ] Memory leak detection tests

### Test Automation

- [ ] Automated test runs on PR creation
- [ ] Coverage reports in CI
- [ ] Performance regression detection
- [ ] Snapshot testing for UI components
