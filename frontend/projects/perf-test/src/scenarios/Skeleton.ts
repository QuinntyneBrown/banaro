import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonCard } from 'components';

/** A loading directory card (docs/mocks/pages/directory/loading). */
@Component({
  selector: 'bn-skeleton-scenario',
  imports: [SkeletonCard],
  template: `<div bn-skeleton-card layout="media"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkeletonScenario {}
