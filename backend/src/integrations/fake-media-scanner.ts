import type { MediaScanner, ScanVerdict } from '../contracts/media-scanner';

const EICAR = 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE';

/**
 * Development scanner (ADR-0004): every file is clean except one carrying the EICAR test string.
 * Readiness reports not ready in production while this is bound.
 */
export class FakeMediaScanner implements MediaScanner {
  async scan(contents: Buffer): Promise<ScanVerdict> {
    return contents.includes(EICAR) ? 'infected' : 'clean';
  }
}
