import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

// Always read the folder fresh — never cache a stale file list.
export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

/**
 * Reads /public/sequence directly off disk and returns the real list of
 * frame filenames, naturally sorted by the number in the filename.
 *
 * This removes every assumption about extension, zero-padding, or frame
 * count — whatever files actually exist is exactly what gets used.
 */
export async function GET() {
  const dir = path.join(process.cwd(), "public", "sequence");

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return NextResponse.json(
      { files: [], error: `Could not read ${dir}. Does public/sequence exist?` },
      { status: 200 }
    );
  }

  const files = entries.filter((name) =>
    IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
  );

  // Natural numeric sort using the first number found in each filename.
  const withNumbers = files.map((name) => {
    const match = name.match(/\d+/);
    return { name, num: match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER };
  });

  withNumbers.sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));

  return NextResponse.json(
    {
      files: withNumbers.map((f) => f.name),
      count: withNumbers.length,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
