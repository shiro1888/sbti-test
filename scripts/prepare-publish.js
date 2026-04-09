const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publishDir = path.join(root, "publish");
const filesToCopy = ["index.html", "image"];

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function main() {
  resetDir(publishDir);

  for (const item of filesToCopy) {
    const source = path.join(root, item);
    if (!fs.existsSync(source)) {
      throw new Error(`Missing required asset: ${item}`);
    }
    copyRecursive(source, path.join(publishDir, item));
  }

  console.log(`Prepared Cloudflare Pages bundle at ${publishDir}`);
}

main();
