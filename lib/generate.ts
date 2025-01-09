import path from 'node:path';
import fs from 'node:fs';
import semver from 'semver';

export interface GeneratorOptions {
  labels: string;
  output: string;
  majorUpdates: boolean;
  minorUpdates: boolean;
  patchUpdates: boolean;
  separateSecurityFixes: boolean;
  versioningStrategy: DependabotVersioningStrategy;
  scheduleInterval: DependabotScheduleInterval;
}

type KeyCombos<T, O = T> = T extends infer U
  ?
      | [T]
      | (KeyCombos<Exclude<O, U>> extends infer U extends any[]
          ? U extends U
            ? [T | U[number]]
            : never
          : never)
  : never;

type DependabotVersioningStrategy =
  | 'auto'
  | 'increase'
  | 'increase-if-necessary'
  | 'lockfile-only'
  | 'widen';

type DependabotScheduleInterval = 'daily' | 'weekly' | 'monthly';

type DependabotUpdateTypes = 'major' | 'minor' | 'patch';

type DependabotIgnoredUpdateTypes =
  | 'version-update:semver-major'
  | 'version-update:semver-minor'
  | 'version-update:semver-patch';

interface DependabotGroupConfig {
  'applies-to': 'security-updates' | 'version-updates';
  'dependency-type': 'production' | 'development';
  'update-types'?: KeyCombos<DependabotUpdateTypes>;
}

interface DependabotIgnoreConfig {
  'dependency-name': string;
  'update-types'?: DependabotIgnoredUpdateTypes[];
}

interface DependabotUpdateConfig {
  'package-ecosystem': 'npm';
  labels: string[];
  directory: string;
  schedule: {
    interval: DependabotScheduleInterval;
  };
  'versioning-strategy': DependabotVersioningStrategy;
  groups: Record<string, DependabotGroupConfig>;
  ignore: DependabotIgnoreConfig[];
}

interface DependabotConfig {
  version: 2;
  updates: DependabotUpdateConfig[];
}

function parsePackageJson(packageJsonPath: string) {
  let json = fs.readFileSync(packageJsonPath, 'utf8');

  let parsedJson = JSON.parse(json);

  return parsedJson;
}

export function generateConfig(
  options: GeneratorOptions,
  packageJsonPaths: string[]
) {
  const dependabotConfig: DependabotConfig = {
    version: 2,
    updates: [],
  };

  const updateTypes: DependabotUpdateTypes[] = [];

  if (options.majorUpdates) {
    updateTypes.push('major');
  }

  if (options.minorUpdates) {
    updateTypes.push('minor');
  }

  if (options.patchUpdates) {
    updateTypes.push('patch');
  }

  const baseUpdateTypes = updateTypes as KeyCombos<DependabotUpdateTypes>;

  for (const packageJsonPath of packageJsonPaths) {
    const packageJsonDirname = path.relative(
      process.cwd(),
      path.dirname(packageJsonPath)
    );

    const updateConfig: DependabotUpdateConfig = {
      'package-ecosystem': 'npm',
      labels: options.labels.split(','),
      directory: `/${packageJsonDirname}`,
      schedule: { interval: options.scheduleInterval },
      'versioning-strategy': options.versioningStrategy,
      groups: {
        'production-dependencies': {
          'applies-to': 'version-updates',
          'dependency-type': 'production',
          'update-types': baseUpdateTypes,
        },
        'development-dependencies': {
          'applies-to': 'version-updates',
          'dependency-type': 'development',
          'update-types': baseUpdateTypes,
        },
      },
      ignore: [],
    };

    if (options.separateSecurityFixes) {
      updateConfig.groups['production-security-fixes'] = {
        'applies-to': 'security-updates',
        'dependency-type': 'production',
      };

      updateConfig.groups['development-security-fixes'] = {
        'applies-to': 'security-updates',
        'dependency-type': 'development',
      };
    }

    const packageJson = parsePackageJson(packageJsonPath);

    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const dependabotIgnoredDependencyVersions: DependabotIgnoreConfig[] = [];

    for (const dependencyName in allDependencies) {
      const semverRange = allDependencies[dependencyName];

      const currentVersionFromRange = semver.coerce(semverRange);

      if (currentVersionFromRange === null) {
        throw new Error(`Couldn't convert '${semverRange}' to valid SemVer.`);
      }

      const nextMajor = `${currentVersionFromRange.major + 1}.0.0`;
      const nextMinor = `${currentVersionFromRange.major}.${currentVersionFromRange.minor + 1}.0`;
      const nextPatch = `${currentVersionFromRange.major}.${currentVersionFromRange.minor}.${currentVersionFromRange.patch + 1}`;

      const allowMajor = semver.satisfies(nextMajor, semverRange);
      const allowMinor = semver.satisfies(nextMinor, semverRange);
      const allowPatch = semver.satisfies(nextPatch, semverRange);

      const ignoredUpdateTypes: DependabotIgnoredUpdateTypes[] = [];

      if (!allowMajor && options.majorUpdates) {
        ignoredUpdateTypes.push('version-update:semver-major');
      }

      if (!allowMinor && options.minorUpdates) {
        ignoredUpdateTypes.push('version-update:semver-minor');
      }

      if (!allowPatch && options.patchUpdates) {
        ignoredUpdateTypes.push('version-update:semver-patch');
      }

      if (ignoredUpdateTypes.length === 3) {
        dependabotIgnoredDependencyVersions.push({
          'dependency-name': dependencyName,
        });
      } else if (ignoredUpdateTypes.length > 0) {
        dependabotIgnoredDependencyVersions.push({
          'dependency-name': dependencyName,
          'update-types': ignoredUpdateTypes,
        });
      }
    }

    updateConfig.ignore = dependabotIgnoredDependencyVersions;

    if (!options.majorUpdates) {
      updateConfig.ignore.push({
        'dependency-name': '*',
        'update-types': ['version-update:semver-major'],
      });
    }

    if (!options.minorUpdates) {
      updateConfig.ignore.push({
        'dependency-name': '*',
        'update-types': ['version-update:semver-minor'],
      });
    }

    if (!options.patchUpdates) {
      updateConfig.ignore.push({
        'dependency-name': '*',
        'update-types': ['version-update:semver-patch'],
      });
    }

    dependabotConfig.updates.push(updateConfig);
  }

  return dependabotConfig;
}
