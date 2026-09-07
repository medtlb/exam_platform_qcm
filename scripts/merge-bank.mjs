#!/usr/bin/env node
// Merges every batch file in src/data/raw/*.json (or src/data/tresor/raw/*.json
// with --track tresor) into the track's questions.json, then runs full
// validation (schema + composition) on the merged result.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateBank } from "../src/lib/validate.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { track: "douanes" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--track") {
      args.track = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function main() {
  const { track } = parseArgs(process.argv.slice(2));
  if (track !== "douanes" && track !== "tresor") {
    console.error(`✗ unknown track "${track}" — expected "douanes" or "tresor"`);
    process.exit(2);
  }

  const rawDir =
    track === "tresor"
      ? path.resolve(repoRoot, "src/data/tresor/raw")
      : path.resolve(repoRoot, "src/data/raw");
  const outFile =
    track === "tresor"
      ? path.resolve(repoRoot, "src/data/tresor/questions.json")
      : path.resolve(repoRoot, "src/data/questions.json");

  const files = (await readdir(rawDir)).filter((f) => f.endsWith(".json")).sort();
  if (files.length === 0) {
    console.error(`✗ no batch files found in ${rawDir}`);
    process.exit(1);
  }

  const bank = [];
  for (const file of files) {
    const raw = await readFile(path.join(rawDir, file), "utf-8");
    const batch = JSON.parse(raw);
    if (!Array.isArray(batch)) {
      console.error(`✗ ${file} does not contain a JSON array`);
      process.exit(1);
    }
    bank.push(...batch);
  }

  bank.sort((a, b) => a.id.localeCompare(b.id));

  await writeFile(outFile, JSON.stringify(bank, null, 2) + "\n", "utf-8");
  console.log(`merged ${files.length} batch file(s), ${bank.length} question(s) -> ${outFile}`);

  const { valid, errors } = validateBank(bank, { checkComposition: true, track });
  if (!valid) {
    console.error(`\n✗ ${errors.length} error(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("✓ merged bank is valid");

  const bySection = {};
  const byDifficulty = {};
  const byTopic = {};
  for (const q of bank) {
    bySection[q.section] = (bySection[q.section] ?? 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
    byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
  }
  console.log("\nby section:", bySection);
  console.log("by difficulty:", byDifficulty);
  console.log("by topic:", byTopic);
}

main();
