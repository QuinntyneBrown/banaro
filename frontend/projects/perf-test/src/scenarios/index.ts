import { Type } from '@angular/core';
import Brand from './Brand';
import Button from './Button';
import DarkTheme from './DarkTheme';
import Footer from './Footer';
import PageHeader from './PageHeader';
import SkipLink from './SkipLink';
import TopBar from './TopBar';

/** Every scenario by name. Add a new component's scenario here in the same change. */
export const scenarios: Record<string, Type<unknown>> = {
  Brand,
  Button,
  DarkTheme,
  Footer,
  PageHeader,
  SkipLink,
  TopBar,
};
