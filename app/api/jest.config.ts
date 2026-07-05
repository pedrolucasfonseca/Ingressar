import type { Config } from 'jest'

const config: Config = {
    projects: [
        {
            displayName: 'unit',
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
            transform: {
                '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
            },
        },
        {
            displayName: 'integration',
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
            setupFiles: ['<rootDir>/tests/integration/env.ts'],
            setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
            transform: {
                '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
            },
        },
    ],
}

export default config