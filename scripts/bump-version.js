import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_JSON_PATH = join(__dirname, "../gestaomv/package.json");

function getCurrentVersion() {
	const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8"));
	return packageJson.version;
}

function bumpPatchVersion(version) {
	const [major, minor, patch] = version.split(".").map(Number);
	return `${major}.${minor}.${patch + 1}`;
}

function updatePackageJson(newVersion) {
	const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8"));
	packageJson.version = newVersion;
	writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function createCommitAndTag(version) {
	try {
		// Stage o package.json modificado e possíveis arquivos formatados
		execSync(`git add ${PACKAGE_JSON_PATH}`, { stdio: "inherit" });
		execSync("git add .", { stdio: "inherit" });

		// Cria commit com a nova versão
		execSync(`git commit -m "chore: bump version to ${version}"`, {
			stdio: "inherit",
		});

		// Cria tag
		execSync(`git tag v${version}`, { stdio: "inherit" });

		console.log(`✅ Versão atualizada para ${version}`);
		console.log(`✅ Commit criado: "chore: bump version to ${version}"`);
		console.log(`✅ Tag criada: v${version}`);
	} catch (error) {
		console.error("❌ Erro ao criar commit/tag:", error.message);
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
		console.error("❌ Erro durante o bump de versão:", error.message);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export default { getCurrentVersion, bumpPatchVersion, updatePackageJson };
