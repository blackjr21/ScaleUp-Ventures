const fs = require('fs');
const path = require('path');

describe('Feature 1.2: Install Dependencies', () => {
  let packageJson;

  beforeAll(() => {
    const packagePath = path.join(__dirname, '../../package.json');
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  });

  describe('Production Dependencies', () => {
    const requiredDeps = [
      'express',
      'cors',
      'dotenv',
      'bcryptjs',
      'jsonwebtoken',
      '@prisma/client',
      'joi'
    ];

    test.each(requiredDeps)('should have %s installed', (dep) => {
      expect(packageJson.dependencies).toHaveProperty(dep);
    });
  });

  describe('Development Dependencies', () => {
    const requiredDevDeps = [
      'jest',
      'nodemon',
      '@playwright/test',
      'supertest'
    ];

    test.each(requiredDevDeps)('should have %s installed', (dep) => {
      expect(packageJson.devDependencies).toHaveProperty(dep);
    });

    test('should have prisma installed (in regular or dev dependencies)', () => {
      const hasPrisma = packageJson.dependencies?.prisma || packageJson.devDependencies?.prisma;
      expect(hasPrisma).toBeDefined();
    });
  });

  describe('Scripts Configuration', () => {
    const requiredScripts = {
      'test': 'jest',
      'dev': 'nodemon server/index.js',
      'start': 'node server/index.js'
    };

    test.each(Object.entries(requiredScripts))(
      'should have script "%s" configured',
      (scriptName, scriptCommand) => {
        expect(packageJson.scripts).toHaveProperty(scriptName);
        expect(packageJson.scripts[scriptName]).toContain(scriptCommand);
      }
    );
  });

  describe('Node Modules', () => {
    test('node_modules directory should exist', () => {
      const nodeModulesPath = path.join(__dirname, '../../node_modules');
      expect(fs.existsSync(nodeModulesPath)).toBe(true);
    });

    test('critical packages should be installed in node_modules', () => {
      const criticalPackages = ['express', 'prisma', 'jest'];
      const nodeModulesPath = path.join(__dirname, '../../node_modules');

      criticalPackages.forEach(pkg => {
        const pkgPath = path.join(nodeModulesPath, pkg);
        expect(fs.existsSync(pkgPath)).toBe(true);
      });
    });
  });
});
