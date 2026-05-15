/**
 * db-setup.js — applies the initial schema directly to PostgreSQL.
 * Run: node src/db-setup.js
 *
 * This is a fallback when `drizzle-kit migrate` has issues.
 * It reads the migration SQL and executes it against the database.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error("❌ DATABASE_URL not set in .env");
	process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

async function run() {
	try {
		await client.connect();
		console.log("✅ Connected to database");

		// Check if tables already exist
		const { rows } = await client.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
		);

		if (rows.length > 0) {
			console.log("📋 Existing tables:", rows.map((r) => r.table_name).join(", "));
			console.log("⚠️  Database already has tables. Skipping schema creation.");
			console.log("   To reset: docker compose down -v && docker compose up -d postgresdb");
			await client.end();
			return;
		}

		// Read and execute migration SQL
		const migrationDir = path.join(import.meta.dirname, "..", "drizzle");
		const files = fs.readdirSync(migrationDir).filter((f) => f.endsWith(".sql")).sort();

		if (files.length === 0) {
			console.error("❌ No migration SQL files found in drizzle/");
			console.log("   Run: pnpm run db:generate");
			await client.end();
			process.exit(1);
		}

		for (const file of files) {
			const sql = fs.readFileSync(path.join(migrationDir, file), "utf-8");
			// Split on drizzle-kit's statement breakpoint markers
			const statements = sql
				.split("-->")
				.map((s) => s.replace(/^\s*statement-breakpoint\s*/i, "").trim())
				.filter(Boolean);

			console.log(`\n📄 Applying: ${file} (${statements.length} statements)`);

			for (const stmt of statements) {
				try {
					await client.query(stmt);
					// Show first 60 chars of each statement
					const preview = stmt.replace(/\s+/g, " ").substring(0, 60);
					console.log(`   ✓ ${preview}...`);
				} catch (err) {
					console.error(`   ✗ ${err.message}`);
					console.error(`     Statement: ${stmt.substring(0, 80)}...`);
				}
			}
		}

		console.log("\n✅ Schema setup complete!");

		// Verify
		const check = await client.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
		);
		console.log("📋 Tables:", check.rows.map((r) => r.table_name).join(", "));
	} catch (err) {
		console.error("❌ Error:", err.message);
		process.exit(1);
	} finally {
		await client.end();
	}
}

run();
