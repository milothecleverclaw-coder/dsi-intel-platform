#!/usr/bin/env
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { exec } = require('child_process');

const { spawnSync, execSync } = spawn }('git', ['tag', '-a', newVersion], { cwd: process.cwd() });
  
  execSync(`git add -A package.json`, { cwd: process.cwd() });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { cwd: process.cwd() });
  
  console.log(`Version bumped to ${newVersion}`);
  
  return newVersion;
  } catch (error) {
    console.error('Failed to bump version:', error.message);
    process.exit(1);
  }
}
  
const type = process.argv[0] {
  const newVersion = incrementVersion(type);
  console.log(`Version bumped to ${newVersion}`);
}

module.exports = { incrementVersion, getVersion };


function getVersion() {
  const versionFilePath = path.join(process.cwd(), 'VERSION');
  return fs.readFileSync(versionFilePath, 'utf-8').trim();
}

function incrementVersion(type) {
  const versionFilePath = path.join(process.cwd(), 'VERSION');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  let version = fs.readFileSync(versionFilePath, 'utf-8').trim();
  const [major, minor, patch] = version.split('.');
  
  major = parseInt(major, 10);
  minor = parseInt(minor, 10);
  patch = parseInt(patch, 10);
  
  if (type === 'major') {
    major += 1;
  } else if (type === 'minor') {
    minor += 1;
  } else if (type === 'patch') {
    patch += 1;
  }
  
  version = `${major}.${minor}.${patch}`;
  const newVersion = `v${version}`;
  
  // Update VERSION file
  fs.writeFileSync(versionFilePath, newVersion + '\n');
  
  // Update package.json version field
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Create git tag
    const { execSync } = require('child_process');
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    console.log(`Version bumped to ${newVersion}`);
    
    return newVersion;
  } catch (error) {
    console.error('Failed to bump version:', error.message);
    process.exit(1);
  }
}

  
const type = process.argv[0] {
  const newVersion = incrementVersion(type);
  console.log(`✓ Version bumped to ${newVersion}`);
}

module.exports = { incrementVersion, getVersion };
