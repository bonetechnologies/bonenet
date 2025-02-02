import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { globalTheme } from './styles/GlobalTheme';
import { GlobalStyle } from './styles/GlobalStyle';
import { BonenetClientPage } from './pages/BonenetClientPage'; // Proper import for Bonenet page

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={globalTheme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BonenetClientPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};