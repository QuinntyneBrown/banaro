import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { MediaStore } from '../contracts/media-store';

/** A private local directory, with random file names chosen by the caller (ADR-0004). */
export class LocalMediaStore implements MediaStore {
  constructor(private readonly root: string) {}

  async put(file: string, contents: Buffer): Promise<void> {
    const target = this.resolve(file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }

  get(file: string): Promise<Buffer> {
    return readFile(this.resolve(file));
  }

  async exists(file: string): Promise<boolean> {
    return stat(this.resolve(file)).then(
      () => true,
      () => false,
    );
  }

  async move(from: string, to: string): Promise<void> {
    const target = this.resolve(to);
    await mkdir(path.dirname(target), { recursive: true });
    await rename(this.resolve(from), target);
  }

  async delete(file: string): Promise<void> {
    await rm(this.resolve(file), { force: true });
  }

  async allFiles(): Promise<string[]> {
    const entries = await readdir(this.root, { recursive: true, withFileTypes: true }).catch(
      () => [],
    );
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(this.root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'),
      );
  }

  /** Keeps every path inside the root. */
  private resolve(file: string): string {
    const target = path.resolve(this.root, file);
    if (!target.startsWith(path.resolve(this.root) + path.sep)) {
      throw new Error(`Path outside media storage: ${file}`);
    }
    return target;
  }
}
