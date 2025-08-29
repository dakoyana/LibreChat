// Minimal, dependency-free fallbacks for forks where '@librechat/client' isn't available.
// If you later add the shared package/workspace, you can delete this file
// and switch imports in App.jsx back to '@librechat/client'.

import * as React from 'react';
import * as RadixToast from '@radix-ui/react-toast';

/**
 * ThemeProvider: no-op wrapper that still supports the same props.
 * It lets the rest of the app render without the shared package.
 */
export const ThemeProvider = ({ children /* initialTheme, themeRGB */ }) => {
  return <>{children}</>;
};

/**
 * ToastProvider: simple passthrough using Radix's context under the hood.
 */
export const ToastProvider = ({ children }) => {
  return <>{children}</>;
};

/**
 * Toast: no-op component to avoid runtime errors where the app expects <Toast />.
 * Radix <Viewport> is already rendered from App.jsx.
 */
export const Toast = () => null;
