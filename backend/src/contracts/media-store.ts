/** Private file storage for uploads, outside anything served statically (ADR-0004). */
export interface MediaStore {
  put(path: string, contents: Buffer): Promise<void>;
  get(path: string): Promise<Buffer>;
  exists(path: string): Promise<boolean>;
  move(from: string, to: string): Promise<void>;
  delete(path: string): Promise<void>;
  allFiles(): Promise<string[]>;
}
