import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';
import PressStart2P from '../../assets/PressStart2P-Regular.ttf';

export const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
    @font-face {
        font-family: 'Press Start 2P';
        src: url(${PressStart2P}) format('truetype');
        font-weight: 400;
        font-style: normal;
    }
    
    * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  }

  button {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  }

  code {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  }
`; 