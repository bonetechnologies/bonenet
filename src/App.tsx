import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { BonenetClient } from './pages/bonenetClient'; // Proper import for Bonenet page

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BonenetClient />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};