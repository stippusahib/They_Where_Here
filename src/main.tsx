import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/dela-gothic-one/400.css';
import '@fontsource/zen-maru-gothic/500.css';
import '@fontsource/zen-maru-gothic/700.css';
import '@fontsource/noto-sans-malayalam/400.css';
import '@fontsource/noto-sans-malayalam/700.css';
import '@/ui/tokens.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
