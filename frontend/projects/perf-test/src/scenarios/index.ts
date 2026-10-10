import { Type } from '@angular/core';
import Alert from './Alert';
import AuthCard from './AuthCard';
import Avatar from './Avatar';
import Banner from './Banner';
import Brand from './Brand';
import Button from './Button';
import ButtonBusy from './ButtonBusy';
import DarkTheme from './DarkTheme';
import ErrorPage from './ErrorPage';
import Field from './Field';
import Footer from './Footer';
import FormSummary from './FormSummary';
import Menu from './Menu';
import PageHeader from './PageHeader';
import SearchBox from './SearchBox';
import SkipLink from './SkipLink';
import Textarea from './Textarea';
import Toast from './Toast';
import ToastStack from './ToastStack';
import TopBar from './TopBar';

/** Every scenario by name. Add a new component's scenario here in the same change. */
export const scenarios: Record<string, Type<unknown>> = {
  Alert,
  AuthCard,
  Avatar,
  Banner,
  Brand,
  Button,
  ButtonBusy,
  DarkTheme,
  ErrorPage,
  Field,
  Footer,
  FormSummary,
  Menu,
  PageHeader,
  SearchBox,
  SkipLink,
  Textarea,
  Toast,
  ToastStack,
  TopBar,
};
