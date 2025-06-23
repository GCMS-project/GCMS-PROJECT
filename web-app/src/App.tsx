import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './i18n/I18nProvider';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => (
  <ThemeProvider>
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  </ThemeProvider>
);

export default App;
