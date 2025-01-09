import { vi, test, expect, beforeEach, afterEach, describe } from 'vitest';
import { generateConfig } from './generate';
import { vol } from 'memfs';

vi.mock('node:fs');

beforeEach(() => {
  vol.fromJSON({
    'package.json': `
    {
      "dependencies": {},
      "devDependencies": {}
    }`,
  });
});

afterEach(() => {
  vol.reset();
});

describe('major updates', () => {
  test('are not ignored when the option is checked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(0);
  });

  test('are ignored when the option is unchecked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: false,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore[0]).toStrictEqual({
      'dependency-name': '*',
      'update-types': ['version-update:semver-major'],
    });
  });
});

describe('minor updates', () => {
  test('are not ignored when the option is checked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(0);
  });

  test('are ignored when the option is unchecked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: false,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore[0]).toStrictEqual({
      'dependency-name': '*',
      'update-types': ['version-update:semver-minor'],
    });
  });
});

describe('patch updates', () => {
  test('are not ignored when the option is checked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(0);
  });

  test('are ignored when the option is unchecked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: false,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore[0]).toStrictEqual({
      'dependency-name': '*',
      'update-types': ['version-update:semver-patch'],
    });
  });
});

describe('separate security groups', () => {
  test('are generated when the option is checked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(
      dependabotConfig.updates[0].groups['production-security-fixes']
    ).toBeDefined();
    expect(
      dependabotConfig.updates[0].groups['development-security-fixes']
    ).toBeDefined();
  });

  test('are not generated when the option is unchecked', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: false,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(
      dependabotConfig.updates[0].groups['production-security-fixes']
    ).toBeUndefined();
    expect(
      dependabotConfig.updates[0].groups['development-security-fixes']
    ).toBeUndefined();
  });
});

describe('labels are generated', () => {
  test('when the labels option is given multiple labels', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies,autoupdate',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].labels).toStrictEqual([
      'dependencies',
      'autoupdate',
    ]);
  });

  test('when the labels option is given a single label', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'autoupdate',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].labels).toStrictEqual(['autoupdate']);
  });
});

describe('versioning strategy', () => {
  test("is generated as 'auto' when the option is set to 'auto'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'auto',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0]['versioning-strategy']).toStrictEqual(
      'auto'
    );
  });

  test("is generated as 'increase' when the option is set to 'increase'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0]['versioning-strategy']).toStrictEqual(
      'increase'
    );
  });

  test("is generated as 'increase-if-necessary' when the option is set to 'increase-if-necessary'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase-if-necessary',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0]['versioning-strategy']).toStrictEqual(
      'increase-if-necessary'
    );
  });

  test("is generated as 'lockfile-only' when the option is set to 'lockfile-only'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'lockfile-only',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0]['versioning-strategy']).toStrictEqual(
      'lockfile-only'
    );
  });

  test("is generated as 'widen' when the option is set to 'widen'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'widen',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0]['versioning-strategy']).toStrictEqual(
      'widen'
    );
  });
});

describe('schedule interval', () => {
  test("is generated as 'daily' when the option is set to 'daily'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'daily',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].schedule.interval).toStrictEqual(
      'daily'
    );
  });

  test("is generated as 'weekly' when the option is set to 'weekly'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].schedule.interval).toStrictEqual(
      'weekly'
    );
  });

  test("is generated as 'monthly' when the option is set to 'monthly'", () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'monthly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].schedule.interval).toStrictEqual(
      'monthly'
    );
  });
});

describe("generates dependency specific ignore when the dependency's constraint", () => {
  test("doesn't allow for major updates", () => {
    vol.fromJSON({
      'package.json': `
      {
        "dependencies": {
          "commander": "^13.0.0"
        },
        "devDependencies": {}
      }`,
    });

    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore[0]).toStrictEqual({
      'dependency-name': 'commander',
      'update-types': ['version-update:semver-major'],
    });
  });

  test("doesn't allow for minor updates", () => {
    vol.fromJSON({
      'package.json': `
      {
        "dependencies": {
          "commander": "~13.0.0"
        },
        "devDependencies": {}
      }`,
    });

    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore[0]).toStrictEqual({
      'dependency-name': 'commander',
      'update-types': [
        'version-update:semver-major',
        'version-update:semver-minor',
      ],
    });
  });

  test("doesn't allow for patch updates", () => {
    vol.fromJSON({
      'package.json': `
      {
        "dependencies": {
          "commander": "13.0.0"
        },
        "devDependencies": {}
      }`,
    });

    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig.updates).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore).toHaveLength(1);
    expect(dependabotConfig.updates[0].ignore[0]).toStrictEqual({
      'dependency-name': 'commander',
    });
  });
});

describe('config is correctly generated', () => {
  test('when there is a single package.json path', () => {
    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json']
    );

    expect(dependabotConfig).toStrictEqual({
      version: 2,
      updates: [
        {
          'package-ecosystem': 'npm',
          labels: ['dependencies'],
          directory: '/',
          schedule: { interval: 'weekly' },
          'versioning-strategy': 'increase',
          groups: {
            'production-dependencies': {
              'applies-to': 'version-updates',
              'dependency-type': 'production',
              'update-types': ['major', 'minor', 'patch'],
            },
            'development-dependencies': {
              'applies-to': 'version-updates',
              'dependency-type': 'development',
              'update-types': ['major', 'minor', 'patch'],
            },
            'production-security-fixes': {
              'applies-to': 'security-updates',
              'dependency-type': 'production',
            },
            'development-security-fixes': {
              'applies-to': 'security-updates',
              'dependency-type': 'development',
            },
          },
          ignore: [],
        },
      ],
    });
  });

  test('when there are multiple package.json paths', () => {
    vol.fromJSON({
      'package.json': `
      {
        "dependencies": {},
        "devDependencies": {}
      }`,
      'mock-app/package.json': `
      {
        "dependencies": {},
        "devDependencies": {}
      }`,
    });

    const dependabotConfig = generateConfig(
      {
        labels: 'dependencies',
        output: '.github',
        majorUpdates: true,
        minorUpdates: true,
        patchUpdates: true,
        separateSecurityFixes: true,
        versioningStrategy: 'increase',
        scheduleInterval: 'weekly',
      },
      ['package.json', 'mock-app/package.json']
    );

    expect(dependabotConfig).toStrictEqual({
      version: 2,
      updates: [
        {
          'package-ecosystem': 'npm',
          labels: ['dependencies'],
          directory: '/',
          schedule: { interval: 'weekly' },
          'versioning-strategy': 'increase',
          groups: {
            'production-dependencies': {
              'applies-to': 'version-updates',
              'dependency-type': 'production',
              'update-types': ['major', 'minor', 'patch'],
            },
            'development-dependencies': {
              'applies-to': 'version-updates',
              'dependency-type': 'development',
              'update-types': ['major', 'minor', 'patch'],
            },
            'production-security-fixes': {
              'applies-to': 'security-updates',
              'dependency-type': 'production',
            },
            'development-security-fixes': {
              'applies-to': 'security-updates',
              'dependency-type': 'development',
            },
          },
          ignore: [],
        },
        {
          'package-ecosystem': 'npm',
          labels: ['dependencies'],
          directory: '/mock-app',
          schedule: { interval: 'weekly' },
          'versioning-strategy': 'increase',
          groups: {
            'production-dependencies': {
              'applies-to': 'version-updates',
              'dependency-type': 'production',
              'update-types': ['major', 'minor', 'patch'],
            },
            'development-dependencies': {
              'applies-to': 'version-updates',
              'dependency-type': 'development',
              'update-types': ['major', 'minor', 'patch'],
            },
            'production-security-fixes': {
              'applies-to': 'security-updates',
              'dependency-type': 'production',
            },
            'development-security-fixes': {
              'applies-to': 'security-updates',
              'dependency-type': 'development',
            },
          },
          ignore: [],
        },
      ],
    });
  });
});
