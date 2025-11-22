const fs = require('fs');
const path = require('path');

describe('Feature 1.1: Project Structure Setup', () => {
  const rootDir = __dirname;

  const requiredDirs = [
    'server',
    'server/routes',
    'server/services',
    'server/middleware',
    'server/utils',
    'client',
    'client/js',
    'client/js/shared',
    'client/css',
    'client/assets',
    'tests',
    'tests/unit',
    'tests/e2e',
    'prisma',
    'assets',
    'assets/screenshots'
  ];

  const requiredFiles = [
    '.gitignore',
    '.env.example',
    'package.json'
  ];

  test('should have all required directories', () => {
    requiredDirs.forEach(dir => {
      const dirPath = path.join(rootDir, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });
  });

  test('should have all required root files', () => {
    requiredFiles.forEach(file => {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).isFile()).toBe(true);
    });
  });

  test('package.json should have correct metadata', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
    );

    expect(packageJson.name).toBe('financial-app');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.description).toBeDefined();
  });

  test('.gitignore should include essential patterns', () => {
    const gitignore = fs.readFileSync(
      path.join(rootDir, '.gitignore'),
      'utf8'
    );

    expect(gitignore).toContain('node_modules');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('*.sqlite');
  });
});
