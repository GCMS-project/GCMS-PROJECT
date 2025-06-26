import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/I18nProvider';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  console.log('App with full authentication system rendering...');
  
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <div className="App">
              <AppRoutes />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

export default App;
