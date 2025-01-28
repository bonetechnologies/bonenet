import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import MatrixLikeMouseEffect from '../components/matrixLikeMouseEffect';
import { allThemes } from '../components/bonenet_client_color_schemes';

// STYLED COMPONENTS

const BonenetContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.foreground};
  font-family: 'Courier New', Courier, monospace;
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
`;

const TerminalWrapper = styled.div`
  position: relative;
  width: 80%;
  height: 70%;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 0 20px ${(props) => props.theme.boxShadowColor};
  overflow: auto;
  //margin-bottom: 10px; /* Match spacing with input bar */

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
`;

const LatencyOverlay = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  color: #ffffff;
  font-size: 0.9rem;
  pointer-events: none;
  z-index: 999;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s;
`;

const InputContainer = styled.div`
  width: 80%;
  margin-top: 10px;
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
  margin-bottom: 10px;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.nextThemeColor};
    cursor: pointer;
  }
`;

const HackerMenuBar = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px; /* Matches spacing with TerminalWrapper and InputContainer */
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 0 10px ${(props) => props.theme.boxShadowColor};
  height: 44px; /* Approx. match the input bar height */
  box-sizing: border-box;
  padding: 0 10px; /* Keep some horizontal padding for aesthetics */
  flex-shrink: 0;  // ensure it doesn't shrink in a flex container

  .indicator-button {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 10px;
    cursor: pointer;
    /* The ring is always the theme's foreground color: */
    border: 2px solid ${(props) => props.theme.foreground};
    /* Disconnected: center is black */
    background-color: black;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }

  /* Connected: center is theme's foreground color */
  &.connected .indicator-button {
    background-color: ${(props) => props.theme.foreground};
  }
`;

// COMPONENT

interface BonenetClientState {
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  themeIndex: number;
  latencies: number[];
  averageLatency: number;
  isConnected: boolean;
  showLatency: boolean; // toggles latency overlay
}

export class BonenetClient extends React.Component<{}, BonenetClientState> {
  private terminalRef = React.createRef<HTMLDivElement>();
  private inputRef = React.createRef<HTMLInputElement>();

  private terminal: Terminal | null = null;
  private socket: WebSocket | null = null;
  private fitAddon: FitAddon | null = null;

  private keepAliveInterval: number | null = null;
  private lastPingSentTime: number = 0; // Track when ping was sent

  constructor(props: {}) {
    super(props);
    this.state = {
      commandHistory: [],
      historyIndex: -1,
      currentInput: '',
      themeIndex: 0,
      latencies: [],
      averageLatency: 0,
      isConnected: false,
      showLatency: false,
    };
  }

  componentDidMount() {
    const currentTheme = allThemes[this.state.themeIndex].xterm;

    // Create & configure xterm.js
    this.terminal = new Terminal({
      theme: {
        background: currentTheme.background,
        foreground: currentTheme.foreground,
      },
      cursorBlink: false,  // Turn off blinking cursor
      disableStdin: true,  // Make terminal read-only
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    if (this.terminalRef.current) {
      this.terminal.open(this.terminalRef.current);
      this.fitAddon.fit();
    }

    // Init WebSocket
    this.initWebSocket();

    // Focus input immediately
    this.inputRef.current?.focus();

    window.addEventListener('resize', this.handleWindowResize);

    // Global window click => Focus the input
    window.addEventListener('click', this.handleWindowClick);
  }

  componentWillUnmount() {
    // Cleanup
    if (this.terminal) this.terminal.dispose();
    if (this.socket) this.socket.close();
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);

    // Remove global click listener
    window.removeEventListener('click', this.handleWindowClick);

    // Remove the resize listener
    window.removeEventListener('resize', this.handleWindowResize);
  }

  private handleWindowClick = () => {
    // Whenever the user clicks anywhere, focus the input
    this.inputRef.current?.focus();
  };

  private initWebSocket() {
    // Clear any old keepAlive
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    // Reset latency data
    this.setState({ latencies: [], averageLatency: 0 });

    this.socket = new WebSocket('wss://xterm.bonenet.ai');

    this.socket.onopen = () => {
      this.writeToTerminal('Connected to the server.\r\n');
      this.setState({ isConnected: true });
      this.startKeepAlive();
    };

    this.socket.onerror = () => {
      this.writeToTerminal('\r\nError: Unable to connect to the server.\r\n');
    };

    this.socket.onclose = () => {
      this.writeToTerminal('\r\nConnection closed.\r\n');
      this.setState({ isConnected: false });
      // Reset latency on disconnect
      this.setState({ latencies: [], averageLatency: 0 });

      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
    };

    this.socket.onmessage = (event) => {
      this.handleServerMessage(event);
    };
  }

  // Keep-alive pings
  private startKeepAlive() {
    if (!this.keepAliveInterval) {
      this.keepAliveInterval = window.setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.lastPingSentTime = Date.now();
          this.socket.send('ping');
        }
      }, 10000);
    }
  }

  private handleServerMessage(event: MessageEvent) {
    const data = typeof event.data === 'string' ? event.data : '[Non-string data]';

    if (data.trim() === 'pong') {
      const latency = Date.now() - this.lastPingSentTime;
      this.updateLatency(latency);
      return;
    }

    // Otherwise, write to terminal
    this.writeToTerminal(data);
  }

  private updateLatency(latency: number) {
    this.setState((prev) => {
      const newLatencies = [...prev.latencies, latency];
      if (newLatencies.length > 10) newLatencies.shift();
      const sum = newLatencies.reduce((acc, l) => acc + l, 0);
      const avg = Math.round(sum / newLatencies.length);
      return { latencies: newLatencies, averageLatency: avg };
    });
  }

  private writeToTerminal(text: string) {
    if (this.terminal) {
      // Replace \n with \r\n for proper carriage return
      this.terminal.write(text.replace(/\r?\n/g, '\r\n'));
      this.terminal.scrollToBottom();
    }
  }

  private handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { commandHistory, historyIndex, currentInput } = this.state;

    if (e.key === 'Enter') {
      e.preventDefault();

      // Check local commands
      if (currentInput.trim() === '/latency') {
        // Toggle latency overlay
        this.setState((prev) => ({ showLatency: !prev.showLatency }));
        this.setState({ currentInput: '' });
        return;
      }

      if (!currentInput.trim()) return;

      // Send to server
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
        this.setState({ historyIndex: -1, currentInput: '' });
      }
    }
  };

  private handleWindowResize = () => {
    if (this.fitAddon) {
      this.fitAddon.fit();
    }
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentInput: e.target.value });
  };

  // Indicator click toggles connect/disconnect
  private handleIndicatorClick = () => {
    if (this.state.isConnected && this.socket) {
      this.socket.close();
    } else {
      this.initWebSocket();
    }
  };

  // Switch theme
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

  render() {
    const currentTheme = allThemes[this.state.themeIndex];
    const nextIndex = (this.state.themeIndex + 1) % allThemes.length;
    const nextThemeColor = allThemes[nextIndex].foreground;

    const { averageLatency, isConnected, showLatency } = this.state;

    return (
        <ThemeProvider theme={currentTheme}>
          <BonenetContainer>
            <MatrixLikeMouseEffect colors={currentTheme.trailColors} />

            {/* Header */}
            <Header nextThemeColor={nextThemeColor} onClick={this.handleThemeSwitch}>
              BONENET
            </Header>

            {/* Minimal menu bar with connect/disconnect indicator */}
            <HackerMenuBar className={isConnected ? 'connected' : ''}>
              <div
                  className="indicator-button"
                  onClick={this.handleIndicatorClick}
                  title={isConnected ? 'Click to disconnect' : 'Click to connect'}
              />
            </HackerMenuBar>

            <TerminalWrapper ref={this.terminalRef}>
              <LatencyOverlay visible={showLatency}>
                {averageLatency}ms
              </LatencyOverlay>
            </TerminalWrapper>

            <InputContainer>
              <StyledInput
                  ref={this.inputRef}
                  type="text"
                  value={this.state.currentInput}
                  onChange={this.handleInputChange}
                  onKeyDown={this.handleInputKeyDown}
              />
            </InputContainer>
          </BonenetContainer>
        </ThemeProvider>
    );
  }
}