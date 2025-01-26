import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { BonecoinPage } from './pages/BonecoinPage';
import { TelnetClient } from './pages/bonenet'; // Proper import for Bonenet page

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<TelnetClient />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};