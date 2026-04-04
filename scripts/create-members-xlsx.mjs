/**
 * Generates public/data/members.xlsx — run: node scripts/create-members-xlsx.mjs
 * Replace the file with your own export from Excel anytime (same path).
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "data");
const outFile = path.join(outDir, "members.xlsx");

const rows = [
  ["Name", "Email", "Member ID", "Chapter", "Status"],
  ["Sample Member One", "member1@example.com", "ICTPI-1001", "Bengaluru", "Active"],
  ["Sample Member Two", "member2@example.com", "ICTPI-1002", "Mysuru", "Active"],
  ["Sample Member Three", "member3@example.com", "ICTPI-1003", "Hubballi", "Honorary"],
];

fs.mkdirSync(outDir, { recursive: true });
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Members");
XLSX.writeFile(wb, outFile);
console.log("Wrote", outFile);
