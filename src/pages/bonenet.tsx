// bonenet.tsx

import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

/** MOUSETRAIL COMPONENT (re-written to accept color array) **/
interface MouseTrailProps {
  colors: string[];
}

const MouseTrail: React.FC<MouseTrailProps> = ({ colors }) => {
  React.useEffect(() => {
    const shapes = ['50%', '0%', 'polygon(50% 0%, 0% 100%, 100% 100%)'];
    // circle, square, triangle

    const handleMouseMove = (e: MouseEvent) => {
      // create shape
      const shapeEl = document.createElement('div');
      shapeEl.style.position = 'absolute';
      shapeEl.style.width = `${Math.random() * 12 + 8}px`;
      shapeEl.style.height = shapeEl.style.width;
      shapeEl.style.pointerEvents = 'none';
      shapeEl.style.top = `${e.pageY}px`;
      shapeEl.style.left = `${e.pageX}px`;

      // random shape
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      shapeEl.style.borderRadius = randomShape; // circle/square or clip-path triangle
      // random color from the theme-provided array
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      shapeEl.style.backgroundColor = randomColor;

      // match the fade-out animation you already had
      shapeEl.style.animation = 'fade-out 0.3s forwards ease-out';
      shapeEl.style.zIndex = '9999';

      document.body.appendChild(shapeEl);

      setTimeout(() => {
        shapeEl.remove();
      }, 300); // matches the 0.3s animation
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [colors]);

  return null;
};

/** ====================================
 *  THEMES: Include trailColors array
 *  ==================================== */
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
  trailColors: ['#00ff99', '#00cc88', '#009966'], // <-- for mouse trail
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

// You can add as many themes as you want here
const allThemes = [greenTheme, redTheme, amberTheme];

/** ====================================
 *  STYLED COMPONENTS
 *  ==================================== */

const TelnetContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.foreground};
  font-family: 'Courier New', Courier, monospace;

  /* keyframes fade-out for the MouseTrail shapes */
  @keyframes fade-out {
    0% {
      transform: scale(1);
      opacity: 1;
      box-shadow: 0 0 10px ${(props) => props.theme.foreground},
                  0 0 20px ${(props) => props.theme.foreground};
    }
    50% {
      transform: scale(1.2);
      opacity: 0.6;
      /* a bit darker or second color might be used:
         We'll just reference theme.foreground for simplicity. */
      box-shadow: 0 0 15px ${(props) => props.theme.foreground},
                  0 0 30px ${(props) => props.theme.foreground};
    }
    100% {
      transform: scale(2);
      opacity: 0;
      box-shadow: 0 0 5px ${(props) => props.theme.foreground},
                  0 0 10px ${(props) => props.theme.foreground};
    }
  }
`;

const TerminalWrapper = styled.div`
  width: 80%;
  height: 70%;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 0 20px ${(props) => props.theme.boxShadowColor};
  overflow: hidden;
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

/** ====================================
 *  REACT COMPONENT
 *  ==================================== */
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
      themeIndex: 0, // start with the 1st theme in the array (green)
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
    if (this.terminal) {
      this.terminal.dispose();
    }
    if (this.socket) {
      this.socket.close();
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
  }

  private handleThemeSwitch = () => {
    this.setState(
      (prev) => {
        const nextIndex = (prev.themeIndex + 1) % allThemes.length;
        return { themeIndex: nextIndex };
      },
      () => {
        // Also update xterm's theme
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
      this.setState(
        { isAuthenticated: true, authToken: token },
        this.startKeepAliveIfNeeded
      );
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
      if (!currentInput.trim()) {
        return;
      }
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
    // Current theme
    const currentTheme = allThemes[this.state.themeIndex];

    // Next theme index (for hover preview)
    const nextIndex = (this.state.themeIndex + 1) % allThemes.length;
    const nextThemeColor = allThemes[nextIndex].foreground;

    return (
      <ThemeProvider theme={currentTheme}>
        <TelnetContainer>
          {/* PASS THEME'S trailColors to MouseTrail */}
          <MouseTrail colors={currentTheme.trailColors} />

          <Header
            nextThemeColor={nextThemeColor}
            onClick={this.handleThemeSwitch}
          >
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