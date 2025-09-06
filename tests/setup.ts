// Jest setup file for global test configuration

// Set test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
export const createMockVault = () => {
  return {
    adapter: {
      fs: {
        promises: {
          readdir: jest.fn(),
          readFile: jest.fn(),
          writeFile: jest.fn(),
          stat: jest.fn(),
        },
      },
    },
    create: jest.fn(),
    read: jest.fn(),
    cachedRead: jest.fn(),
    modify: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    getFiles: jest.fn(),
    getAllLoadedFiles: jest.fn(),
  };
};

export const createMockApp = () => {
  return {
    vault: createMockVault(),
    workspace: {
      getActiveFile: jest.fn(),
      openLinkText: jest.fn(),
    },
    metadataCache: {
      getCache: jest.fn(),
      getFileCache: jest.fn(),
      on: jest.fn(),
    },
  };
};