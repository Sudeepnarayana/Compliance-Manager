import { defineConfig } from "prisma/config";
import fs from "fs";
import path from "path";

// Helper to manually load environment files into process.env
function loadEnvFile(fileName: string) {
  const filePath = path.resolve(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      // Basic key-value parse ignoring comments and empty lines
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        // Strip wrapping quotes if any
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val.trim();
      }
    }
  }
}

// Load environments in priority order
loadEnvFile(".env.local");
loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    directUrl: process.env.POSTGRES_URL_NON_POOLING,
  },
});
