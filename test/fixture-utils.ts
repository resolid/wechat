import { random } from "@resolid/utils";
import { openAsBlob } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import nodePath from "node:path";

export async function loadFixtureFile(filename: string, mime: string): Promise<File> {
  const blob = await openAsBlob(new URL(`fixtures/${filename}`, import.meta.url));

  return new File([blob], filename, { type: mime });
}

export async function saveFile(file: File): Promise<string> {
  const dir = new URL(`../runtime`, import.meta.url).pathname;
  await mkdir(dir, { recursive: true });
  const filePath = nodePath.join(dir, `${random(12)}_${file.name}`);

  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  return filePath;
}
