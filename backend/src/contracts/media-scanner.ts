export type ScanVerdict = 'clean' | 'infected';

/** Malware scanning of uploads; the vendor is not chosen yet (ADR-0004). */
export interface MediaScanner {
  scan(contents: Buffer): Promise<ScanVerdict>;
}
