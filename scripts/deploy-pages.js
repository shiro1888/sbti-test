const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publishDir = path.join(root, "publish");

function getArgValue(flagNames) {
  for (let i = 0; i < process.argv.length; i += 1) {
    if (flagNames.includes(process.argv[i]) && process.argv[i + 1]) {
      return process.argv[i + 1];
    }
  }
  return undefined;
}

function getPositionalProjectName() {
  return process.argv.slice(2).find((arg) => !arg.startsWith("-"));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const projectName =
    getArgValue(["--project", "-p"]) ||
    getPositionalProjectName() ||
    process.env.CF_PAGES_PROJECT ||
    process.env.CLOUDFLARE_PAGES_PROJECT;

  if (!projectName) {
    console.error(
      "Missing Cloudflare Pages project name. Use `npm run deploy:pages -- --project <name>`."
    );
    process.exit(1);
  }

  run("node", ["scripts/prepare-publish.js"]);
  run("npx", ["wrangler", "pages", "deploy", publishDir, "--project-name", projectName]);
}

main();
