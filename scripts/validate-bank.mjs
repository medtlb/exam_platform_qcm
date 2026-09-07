#!/usr/bin/env node
// Validates a question bank file (or a raw batch file) against the schema
// and composition rules from AGENT.md §4/§5. Fails loudly (non-zero exit)
// on: schema violation, <5 options, empty/complete `correct` array,
// duplicate id, duplicate/near-duplicate prompt, composition drift,
// missing explanation.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateBank } from "../src/lib/validate.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { mode: "full", file: null, track: "douanes" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--batch") {
      args.mode = "batch";
      args.file = argv[i + 1];
      i++;
    } else if (argv[i] === "--file") {
      args.file = argv[i + 1];
      i++;
    } else if (argv[i] === "--track") {
      args.track = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function loadJson(relativePath) {
  const abs = path.resolve(repoRoot, relativePath);
  const raw = await readFile(abs, "utf-8");
  return JSON.parse(raw);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const defaultFile = args.track === "tresor" ? "src/data/tresor/questions.json" : "src/data/questions.json";
  const file = args.file ?? (args.mode === "batch" ? null : defaultFile);

  if (!file) {
    console.error("usage: validate-bank.mjs [--batch <path>] [--file <path>]");
    process.exit(2);
  }

  let bank;
  try {
    bank = await loadJson(file);
  } catch (err) {
    console.error(`✗ could not read/parse ${file}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(bank)) {
    console.error(`✗ ${file} does not contain a JSON array`);
    process.exit(1);
  }

  const checkComposition = args.mode !== "batch";
  const { valid, errors } = validateBank(bank, { checkComposition, track: args.track });

  console.log(`checked ${bank.length} item(s) from ${file}`);

  if (!valid) {
    console.error(`\n✗ ${errors.length} error(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log("✓ valid");
}

main();
