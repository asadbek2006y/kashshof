/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    // The generated Prisma client's own internal imports use explicit ".js" extensions (the
    // NodeNext/ESM convention — see tsconfig.json), which point at compiled output that doesn't
    // exist under ts-jest's on-the-fly transform. Strip the extension so Jest resolves the
    // sibling .ts source instead, same as tsc/tsx already do natively.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
};
