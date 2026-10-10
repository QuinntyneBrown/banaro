import { Type } from '@angular/core';
import Alert from './Alert';
import Brand from './Brand';
import Button from './Button';
import ButtonBusy from './ButtonBusy';
import DarkTheme from './DarkTheme';
import ErrorPage from './ErrorPage';
import Field from './Field';
import Footer from './Footer';
import FormSummary from './FormSummary';
import PageHeader from './PageHeader';
import SearchBox from './SearchBox';
import SkipLink from './SkipLink';
import Textarea from './Textarea';
import TopBar from './TopBar';

/** Every scenario by name. Add a new component's scenario here in the same change. */
export const scenarios: Record<string, Type<unknown>> = {
  Alert,
  Brand,
  Button,
  ButtonBusy,
  DarkTheme,
  ErrorPage,
  Field,
  Footer,
  FormSummary,
  PageHeader,
  SearchBox,
  SkipLink,
  Textarea,
  TopBar,
};
