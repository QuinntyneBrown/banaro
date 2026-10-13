import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  Signal,
  signal,
} from '@angular/core';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';
export type ToastCloseReason = 'timeout' | 'user' | 'action' | 'programmatic';

export interface ToastOptions {
  variant?: ToastVariant;
  title: string;
  body?: string;
  action?: { label: string; run: () => void };
  kind?: 'rsvp';
}

export interface ToastRef {
  dismiss(): void;
  readonly closed: Promise<ToastCloseReason>;
}

/** The application's catalogue text for the close button ("Dismiss notification"). */
export const TOAST_DISMISS_LABEL = new InjectionToken<Signal<string>>('TOAST_DISMISS_LABEL');

/** One toast as the region renders it. */
export interface ToastItem {
  readonly id: number;
  readonly options: ToastOptions;
  readonly variant: ToastVariant;
}

const VISIBLE = 3;
const AUTO_DISMISS_MS = 6_000;

interface Entry extends ToastItem {
  resolve: (reason: ToastCloseReason) => void;
  remaining: number;
  timer?: ReturnType<typeof setTimeout>;
  startedAt?: number;
  acted: boolean;
}

/**
 * Owns the toast queue (L2-028): at most three visible, newest on top, the rest first-in,
 * first-out. Success and info close after 6 s of visible, unpaused time; warning and danger stay
 * until dismissed. On the server every toast is closed at once.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly visibleEntries = signal<Entry[]>([]);
  private readonly queue: Entry[] = [];
  private nextId = 1;

  /** Visible toasts, newest first. */
  readonly visible = computed<ToastItem[]>(() => this.visibleEntries());

  show(options: ToastOptions): ToastRef {
    let resolve!: (reason: ToastCloseReason) => void;
    const closed = new Promise<ToastCloseReason>((r) => (resolve = r));
    const variant = options.variant ?? 'info';
    const entry: Entry = {
      id: this.nextId++,
      options,
      variant,
      resolve,
      remaining: variant === 'success' || variant === 'info' ? AUTO_DISMISS_MS : Infinity,
      acted: false,
    };
    if (!this.browser) {
      resolve('programmatic');
      return { dismiss: () => undefined, closed };
    }
    if (this.visibleEntries().length < VISIBLE) this.reveal(entry);
    else this.queue.push(entry);
    return { dismiss: () => this.close(entry.id, 'programmatic'), closed };
  }

  dismissAll(): void {
    for (const entry of this.queue.splice(0)) entry.resolve('programmatic');
    for (const entry of this.visibleEntries()) this.close(entry.id, 'programmatic');
  }

  /** The member closed the toast. */
  dismiss(id: number): void {
    this.close(id, 'user');
  }

  /** Runs the action once, then closes the toast (L2-028 criterion 3). */
  act(id: number): void {
    const entry = this.find(id);
    if (!entry || entry.acted) return;
    entry.acted = true;
    this.close(id, 'action');
    entry.options.action?.run();
  }

  /** Pointer or focus rests on the toast: hold its timer (L2-028 criterion 7). */
  pause(id: number, paused: boolean): void {
    const entry = this.find(id);
    if (!entry || entry.remaining === Infinity) return;
    if (paused && entry.timer) {
      clearTimeout(entry.timer);
      entry.timer = undefined;
      entry.remaining -= Date.now() - (entry.startedAt ?? Date.now());
    } else if (!paused && !entry.timer) {
      this.start(entry);
    }
  }

  private reveal(entry: Entry): void {
    this.visibleEntries.update((list) => [entry, ...list]);
    if (entry.remaining !== Infinity) this.start(entry);
  }

  private start(entry: Entry): void {
    entry.startedAt = Date.now();
    entry.timer = setTimeout(() => this.close(entry.id, 'timeout'), Math.max(0, entry.remaining));
  }

  private close(id: number, reason: ToastCloseReason): void {
    const queued = this.queue.findIndex((e) => e.id === id);
    if (queued >= 0) {
      this.queue.splice(queued, 1)[0].resolve(reason);
      return;
    }
    const entry = this.find(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    this.visibleEntries.update((list) => list.filter((e) => e.id !== id));
    entry.resolve(reason);
    const next = this.queue.shift();
    if (next) this.reveal(next);
  }

  private find(id: number): Entry | undefined {
    return this.visibleEntries().find((e) => e.id === id);
  }
}
