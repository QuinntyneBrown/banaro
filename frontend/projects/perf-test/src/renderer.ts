import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { scenarios } from './scenarios';

export type RenderType = 'mount' | 'update';

export interface PerfResult {
  scenario: string;
  iterations: number;
  renderType: RenderType;
  durationMs: number;
}

declare global {
  interface Window {
    __perfResult?: PerfResult;
    __perfError?: string;
  }
}

/**
 * Renders `?scenario=Button&iterations=500&renderType=mount` and measures the render.
 * - `mount`: creates every instance and runs its first change detection.
 * - `update`: mounts first, then measures one more change detection pass over every instance.
 * The result lands on `window.__perfResult` and `body[data-perf-status]` becomes `done` (or `error`).
 */
@Component({
  selector: 'bn-perf-renderer',
  template: `<ng-container #host />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Renderer {
  private readonly host = viewChild.required('host', { read: ViewContainerRef });
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => this.run());
  }

  private run(): void {
    const params = new URLSearchParams(this.document.location.search);
    const name = params.get('scenario') ?? '';
    const iterations = Number(params.get('iterations') ?? 1);
    const renderType = (params.get('renderType') ?? 'mount') as RenderType;
    const scenario: Type<unknown> | undefined = scenarios[name];

    try {
      if (!scenario) throw new Error(`Unknown scenario "${name}"`);
      const host = this.host();
      const mount = () => {
        const refs = [];
        for (let i = 0; i < iterations; i++) {
          const ref = host.createComponent(scenario);
          ref.changeDetectorRef.detectChanges();
          refs.push(ref);
        }
        return refs;
      };

      let durationMs: number;
      performance.mark('bn-render-start');
      if (renderType === 'update') {
        const refs = mount();
        const start = performance.now();
        for (const ref of refs) ref.changeDetectorRef.detectChanges();
        durationMs = performance.now() - start;
      } else {
        const start = performance.now();
        mount();
        durationMs = performance.now() - start;
      }
      performance.mark('bn-render-end');
      performance.measure('bn-render', 'bn-render-start', 'bn-render-end');

      window.__perfResult = { scenario: name, iterations, renderType, durationMs };
      this.document.body.dataset['perfStatus'] = 'done';
    } catch (error) {
      window.__perfError = String(error);
      this.document.body.dataset['perfStatus'] = 'error';
    }
  }
}
