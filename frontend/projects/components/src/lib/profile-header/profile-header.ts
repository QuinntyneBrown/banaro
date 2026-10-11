import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { AvatarTile } from '../avatar/avatar';
import { Status } from '../badge/badge';
import { Skeleton } from '../skeleton/skeleton';

/**
 * The top of a builder's profile: portrait or initials, name, role, place and presence, with the
 * page's actions (L2-011 criterion 1). Hidden facts arrive as null and render nothing.
 */
@Component({
  selector: 'header[bn-profile-header]',
  imports: [NgTemplateOutlet, Skeleton, Status],
  templateUrl: './profile-header.html',
  styleUrl: './profile-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'profile-head', '[attr.aria-busy]': "loading() ? 'true' : null" },
})
export class ProfileHeader {
  readonly name = input.required<string>();
  readonly headingLevel = input<1 | 2 | 3>(1);
  readonly role = input<string | null>(null);
  readonly place = input<string | null>(null);
  readonly photo = input<string | null>(null);
  readonly photoAlt = input('');
  readonly initials = input('');
  readonly initialsLabel = input('');
  readonly tone = input<AvatarTile>('sage');
  readonly presence = input<{ online: boolean; text: string } | null>(null);
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly photoFailed = signal(false);
}
