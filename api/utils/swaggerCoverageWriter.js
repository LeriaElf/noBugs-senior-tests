import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const OUTPUT_DIR = "swagger-coverage/output";
const BASE_PATH = "/api/v1";

export function writeCoverageFile(method, urlPath, statusCode) {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fullPath = BASE_PATH + urlPath;

  const coverage = {
    openapi: "3.0.1",
    info: { title: "coverage", version: "v1" },
    paths: {
      [fullPath]: {
        [method.toLowerCase()]: {
          responses: {
            [String(statusCode)]: { description: String(statusCode) },
          },
        },
      },
    },
  };

  writeFileSync(join(OUTPUT_DIR, `${randomUUID()}-coverage.json`), JSON.stringify(coverage));
}
