#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON_PATH = path.join(__dirname, '../gestaomv/package.json');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  return packageJson.version;
}

function bumpPatchVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

function updatePackageJson(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
}

function createCommitAndTag(version) {
  try {
    // Executa yarn format antes do commit
    console.log('🔧 Executando yarn format...');
    execSync('yarn format', { stdio: 'inherit', cwd: path.join(__dirname, '../gestaomv') });
    
    // Stage o package.json modificado e possíveis arquivos formatados
    execSync(`git add ${PACKAGE_JSON_PATH}`, { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    
    // Cria commit com a nova versão
    execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' });
    
    // Cria tag
    execSync(`git tag v${version}`, { stdio: 'inherit' });
    
    console.log(`✅ Versão atualizada para ${version}`);
    console.log(`✅ Formatação executada`);
    console.log(`✅ Commit criado: "chore: bump version to ${version}"`);
    console.log(`✅ Tag criada: v${version}`);
  } catch (error) {
    console.error('❌ Erro ao criar commit/tag:', error.message);
    process.exit(1);
  }
}

function main() {
  try {
    const currentVersion = getCurrentVersion();
    const newVersion = bumpPatchVersion(currentVersion);
    
    console.log(`📦 Fazendo bump da versão: ${currentVersion} → ${newVersion}`);
    
    updatePackageJson(newVersion);
    createCommitAndTag(newVersion);
    
  } catch (error) {
    console.error('❌ Erro durante o bump de versão:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentVersion, bumpPatchVersion, updatePackageJson };