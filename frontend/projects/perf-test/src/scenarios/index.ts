import { Type } from '@angular/core';
import Alert from './Alert';
import AuthCard from './AuthCard';
import Avatar from './Avatar';
import Banner from './Banner';
import Brand from './Brand';
import Button from './Button';
import ButtonBusy from './ButtonBusy';
import Choice from './Choice';
import DarkTheme from './DarkTheme';
import Dialog from './Dialog';
import EmptyState from './EmptyState';
import ErrorPage from './ErrorPage';
import Field from './Field';
import Footer from './Footer';
import FormLayout from './FormLayout';
import FormSummary from './FormSummary';
import List from './List';
import Menu from './Menu';
import PageHeader from './PageHeader';
import SearchBox from './SearchBox';
import Skeleton from './Skeleton';
import SkillChips from './SkillChips';
import SkipLink from './SkipLink';
import Stepper from './Stepper';
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
  Choice,
  DarkTheme,
  Dialog,
  EmptyState,
  ErrorPage,
  Field,
  Footer,
  FormLayout,
  FormSummary,
  List,
  Menu,
  PageHeader,
  SearchBox,
  Skeleton,
  SkillChips,
  SkipLink,
  Stepper,
  Textarea,
  Toast,
  ToastStack,
  TopBar,
};
