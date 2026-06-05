import { access, copyFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "app", "cert", "practicing-certificate.pdf");
const destDir = path.join(root, "public", "cert");
const dest = path.join(destDir, "practicing-certificate.pdf");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(source))) {
  if (await exists(dest)) {
    console.warn(
      "app/cert/practicing-certificate.pdf not found; using existing public/cert copy."
    );
    process.exit(0);
  }
  throw new Error(
    "Missing certificate template. Add app/cert/practicing-certificate.pdf."
  );
}

await mkdir(destDir, { recursive: true });
await copyFile(source, dest);
console.log("Copied certificate template to public/cert/practicing-certificate.pdf");
