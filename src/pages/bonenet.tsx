// bonenet.tsx

import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
/** MOUSETRAIL COMPONENT (Matrix-like) **/
interface MouseTrailProps {
  colors: string[];
}

const MouseTrail: React.FC<MouseTrailProps> = ({ colors }) => {
  const matrixChars = '01▓░▒>+-$@%&#abcdefABCDEF';

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const charEl = document.createElement('span');
      // Use fixed positioning so the shapes do NOT expand the document
      charEl.style.position = 'fixed';
      // Position at the mouse pointer within the viewport
      charEl.style.left = `${e.clientX}px`;
      charEl.style.top = `${e.clientY}px`;
      charEl.style.pointerEvents = 'none';
      charEl.style.zIndex = '9999';

      // Random color from theme
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      charEl.style.color = randomColor;
      charEl.style.fontFamily = 'monospace';
      charEl.style.fontSize = `${Math.random() * 8 + 12}px`; // 12-20px
      charEl.style.userSelect = 'none';

      // Random "Matrix" character
      const randIndex = Math.floor(Math.random() * matrixChars.length);
      charEl.textContent = matrixChars.charAt(randIndex);

      // Animate it falling
      charEl.style.animation = 'matrixFall 1s linear forwards';

      document.body.appendChild(charEl);

      // Clean up after 1s
      setTimeout(() => charEl.remove(), 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [colors]);

  return null;
};

/** THEMES */
const greenTheme = {
  name: 'green',
  background: '#1a1a1d',
  foreground: '#00ff99',
  borderColor: '#00ff99',
  boxShadowColor: '#00ff99',
  xterm: {
    background: '#1a1a1d',
    foreground: '#00ff99',
  },
  trailColors: ['#00ff99', '#00cc88', '#009966'],
};

const redTheme = {
  name: 'red',
  background: '#2b1b1b',
  foreground: '#ff6666',
  borderColor: '#ff6666',
  boxShadowColor: '#ff6666',
  xterm: {
    background: '#2b1b1b',
    foreground: '#ff6666',
  },
  trailColors: ['#ff6666', '#cc5050', '#993d3d'],
};

const amberTheme = {
  name: 'amber',
  background: '#332b1b',
  foreground: '#ffb347',
  borderColor: '#ffb347',
  boxShadowColor: '#ffb347',
  xterm: {
    background: '#332b1b',
    foreground: '#ffb347',
  },
  trailColors: ['#ffb347', '#ff9933', '#ffcc66'],
};

const allThemes = [greenTheme, redTheme, amberTheme];

const TelnetContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;

  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.foreground};
  font-family: 'Courier New', Courier, monospace;

  /* If the entire page might scroll, style that scrollbar: */
  overflow: auto;

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.foreground};
    border-radius: 4px;
    box-shadow: 0 0 8px ${(props) => props.theme.foreground};
  }

  scrollbar-color: ${(props) => props.theme.foreground} ${(props) => props.theme.background};
  scrollbar-width: thin;

  @keyframes matrixFall {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      transform: translateY(80px);
      opacity: 0;
    }
  }
`;

const TerminalWrapper = styled.div`
  width: 80%;
  height: 70%;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 0 20px ${(props) => props.theme.boxShadowColor};

  /* IMPORTANT: allow scrolling in the terminal area */
  overflow: auto;

  /*
    1) For WebKit-based browsers (Chrome, Safari, Edge Chromium),
       define a custom scrollbar
  */
  ::-webkit-scrollbar {
    width: 8px; /* scrollbar thickness */
  }
  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.foreground};
    border-radius: 4px;
    box-shadow: 0 0 8px ${(props) => props.theme.foreground};
  }

  /* 2) For Firefox, a partial fallback using scrollbar-color/width */
  scrollbar-color: ${(props) => props.theme.foreground} ${(props) => props.theme.background};
  scrollbar-width: thin; /* "auto" or "thin" */
`;

const InputContainer = styled.div`
  width: 80%;
  margin-top: 20px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  color: ${(props) => props.theme.foreground};
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  outline: none;
  box-shadow: 0 0 10px ${(props) => props.theme.boxShadowColor};

  &:focus {
    border-color: ${(props) => props.theme.foreground};
  }
`;

const Header = styled.h1<{ nextThemeColor: string }>`
  font-size: 2rem;
  color: ${(props) => props.theme.foreground};
  margin-bottom: 20px;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.nextThemeColor};
    cursor: pointer;
  }
`;

/** MAIN REACT COMPONENT */
interface TelnetClientState {
  isAuthenticated: boolean;
  authToken: string | null;
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  themeIndex: number;
}

export class TelnetClient extends React.Component<{}, TelnetClientState> {
  private terminalRef = React.createRef<HTMLDivElement>();
  private inputRef = React.createRef<HTMLInputElement>();

  private terminal: Terminal | null = null;
  private socket: WebSocket | null = null;
  private fitAddon: FitAddon | null = null;

  private lastPongTime: number = Date.now();
  private keepAliveInterval: number | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      isAuthenticated: false,
      authToken: null,
      commandHistory: [],
      historyIndex: -1,
      currentInput: '',
      themeIndex: 0,
    };
  }

  componentDidMount() {
    const currentTheme = allThemes[this.state.themeIndex].xterm;
    this.terminal = new Terminal({
      theme: {
        background: currentTheme.background,
        foreground: currentTheme.foreground,
      },
      cursorBlink: true,
      disableStdin: true,
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    if (this.terminalRef.current) {
      this.terminal.open(this.terminalRef.current);
      this.fitAddon.fit();
    }

    this.socket = new WebSocket('wss://xterm.bonenet.ai:26000');
    this.socket.onopen = () => {
      this.writeToTerminal('Connected to the server.\r\n');
    };
    this.socket.onerror = () => {
      this.writeToTerminal('\r\nError: Unable to connect to the server.\r\n');
    };
    this.socket.onclose = () => {
      this.writeToTerminal('\r\nConnection closed.\r\n');
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
    };
    this.socket.onmessage = (event) => {
      this.handleServerMessage(event);
    };

    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  componentWillUnmount() {
    if (this.terminal) this.terminal.dispose();
    if (this.socket) this.socket.close();
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
  }

  private handleThemeSwitch = () => {
    this.setState(
      (prev) => {
        const nextIndex = (prev.themeIndex + 1) % allThemes.length;
        return { themeIndex: nextIndex };
      },
      () => {
        if (this.terminal) {
          const newXtermTheme = allThemes[this.state.themeIndex].xterm;
          this.terminal.setOption('theme', {
            background: newXtermTheme.background,
            foreground: newXtermTheme.foreground,
          });
        }
      }
    );
  };

  private writeToTerminal(text: string) {
    if (this.terminal) {
      this.terminal.write(text.replace(/\r?\n/g, '\r\n'));
      this.terminal.scrollToBottom();
    }
  }

  private handleServerMessage(event: MessageEvent) {
    const data =
      typeof event.data === 'string' ? event.data : '[Non-string data]';

    if (data.trim() === 'pong') {
      this.lastPongTime = Date.now();
      return;
    }
    if (data.startsWith('AUTH - ')) {
      const token = data.substring('AUTH - '.length).trim();
      this.setState({ isAuthenticated: true, authToken: token }, this.startKeepAliveIfNeeded);
      return;
    }
    this.writeToTerminal(data);
  }

  private startKeepAliveIfNeeded = () => {
    if (this.state.isAuthenticated && !this.keepAliveInterval) {
      this.keepAliveInterval = window.setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send('ping');
        }
      }, 10000);
    }
  };

  private handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { commandHistory, historyIndex, currentInput } = this.state;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!currentInput.trim()) return;
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(currentInput);
      }
      this.writeToTerminal(`\r\n> ${currentInput}\r\n`);
      this.setState({
        commandHistory: [...commandHistory, currentInput],
        historyIndex: -1,
        currentInput: '',
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex === -1 && commandHistory.length > 0) {
        this.setState({
          historyIndex: commandHistory.length - 1,
          currentInput: commandHistory[commandHistory.length - 1],
        });
      } else if (historyIndex > 0) {
        this.setState({
          historyIndex: historyIndex - 1,
          currentInput: commandHistory[historyIndex - 1],
        });
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
        this.setState({
          historyIndex: historyIndex + 1,
          currentInput: commandHistory[historyIndex + 1],
        });
      } else {
        this.setState({
          historyIndex: -1,
          currentInput: '',
        });
      }
    }
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentInput: e.target.value });
  };

  render() {
    const currentTheme = allThemes[this.state.themeIndex];
    const nextIndex = (this.state.themeIndex + 1) % allThemes.length;
    const nextThemeColor = allThemes[nextIndex].foreground;

    return (
      <ThemeProvider theme={currentTheme}>
        <TelnetContainer>
          {/* Matrix-like MouseTrail */}
          <MouseTrail colors={currentTheme.trailColors} />

          <Header nextThemeColor={nextThemeColor} onClick={this.handleThemeSwitch}>
            BONENET
          </Header>

          <TerminalWrapper ref={this.terminalRef} />

          <InputContainer>
            <StyledInput
              ref={this.inputRef}
              type="text"
              value={this.state.currentInput}
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
            />
          </InputContainer>
        </TelnetContainer>
      </ThemeProvider>
    );
  }
}