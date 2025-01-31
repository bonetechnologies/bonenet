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
  overflow: hidden; /* Hide scrollbars for fullscreen experience */

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

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const TerminalWrapper = styled.div`
  position: relative;
  width: 80%;
  height: 70%;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 0 20px ${(props) => props.theme.boxShadowColor};
  overflow: hidden; /* Hide terminal scrollbars */

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

  /* Mobile adjustments */
  @media (max-width: 768px) {
    width: 100%;
    height: 60%;
    border: none;
    box-shadow: none;
    border-radius: 0;
  }
`;

const LatencyOverlay = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 0.9rem;
  pointer-events: none;
  z-index: 999;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    top: 4px;
    right: 4px;
    font-size: 0.8rem;
  }
`;

const InputContainer = styled.div`
  width: 80%;
  margin-top: 10px;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 5px;
  }
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

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 8px;
    font-size: 0.9rem;
    border-radius: 4px;
  }
`;

const Header = styled.h1<{ nextThemeColor: string }>`
  font-size: 2rem;
  color: ${(props) => props.theme.foreground};
  margin-bottom: 10px;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center; /* Center align on mobile */

  &:hover {
    color: ${(props) => props.nextThemeColor};
    cursor: pointer;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 1.5rem;
    flex-direction: column;
    align-items: center;
  }
`;

const HackerMenuBar = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 0 10px ${(props) => props.theme.boxShadowColor};
  height: 44px;
  box-sizing: border-box;
  padding: 0 10px;
  flex-shrink: 0;
  position: relative; /* So we can position toast absolutely inside here */

  .indicator-section {
    display: flex;
    align-items: center;
  }

  .indicator-button {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 10px;
    cursor: pointer;
    border: 2px solid ${(props) => props.theme.foreground};
    background-color: black; /* Disconnected color */
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }

  &.connected .indicator-button {
    background-color: ${(props) => props.theme.foreground}; /* Connected color */
  }

  .help-button {
    font-size: 1rem;
    color: ${(props) => props.theme.foreground};
    cursor: pointer;
    transition: color 0.3s, transform 0.2s;

    &:hover {
      transform: scale(1.1);
      color: ${(props) =>
          props.theme.hoverColor ? props.theme.hoverColor : props.theme.foreground};
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    width: 100%;
    height: 36px;
    padding: 0 5px;

    .indicator-button {
      width: 14px;
      height: 14px;
      margin-right: 8px;
    }

    .help-button {
      font-size: 0.9rem;
    }
  }
`;

/* Toast message absolutely centered in the menubar */
const ToastMessage = styled.div`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Courier New', Courier, monospace;
  z-index: 1000;
  transition: opacity 0.5s ease-in-out;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 3px 6px;
  }
`;

/**
 * New bonecoin info container
 */
const BonecoinInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20px;
  font-size: 0.9rem;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    margin-left: 0;
    align-items: center;
    margin-top: 5px;
  }
`;

const LinksRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;

  a {
    color: ${(props) => props.theme.foreground};
    text-decoration: none;
    transition: color 0.3s, text-shadow 0.3s;
    font-size: 0.9rem;

    &:hover {
      color: #ff0; /* Hover color */
      text-shadow: 0 0 5px #ff0;
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
`;

const CAContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.foreground};
  cursor: pointer;
  gap: 6px;

  span {
    user-select: none; /* So the user doesn't accidentally select partial text, 
                          we rely on the copy icon to copy the entire CA */
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const CopyIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) => props.theme.foreground};
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.8rem;
  transition: background-color 0.3s, transform 0.3s;
  &:hover {
    background-color: ${(props) => props.theme.foreground};
    color: ${(props) => props.theme.background};
    transform: scale(1.1);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    padding: 1px 3px;
    font-size: 0.7rem;
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
  showLatency: boolean;
  isAuthenticated: boolean;
  authToken: string;
  toastMessage: string; // For showing errors as a toast
}

export class BonenetClient extends React.Component<{}, BonenetClientState> {
  private terminalRef = React.createRef<HTMLDivElement>();
  private inputRef = React.createRef<HTMLInputElement>();

  private terminal: Terminal | null = null;
  private socket: WebSocket | null = null;
  private fitAddon: FitAddon | null = null;

  private keepAliveInterval: number | null = null;
  private lastPingSentTime: number = 0;

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
      isAuthenticated: false,
      authToken: '',
      toastMessage: '',
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
      cursorBlink: false, // no blinking
      disableStdin: true, // read-only
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    if (this.terminalRef.current) {
      this.terminal.open(this.terminalRef.current);
      this.fitAddon.fit();
    }

    this.initWebSocket();

    this.inputRef.current?.focus();
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('click', this.handleWindowClick);
  }

  componentWillUnmount() {
    if (this.terminal) this.terminal.dispose();
    if (this.socket) this.socket.close();
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);

    window.removeEventListener('click', this.handleWindowClick);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  private handleWindowClick = () => {
    this.inputRef.current?.focus();
  };

  private handleWindowResize = () => {
    if (this.fitAddon) {
      this.fitAddon.fit();
    }
  };

  // Helper to show toast messages in the menubar
  private showToast = (message: string, durationMs = 3000) => {
    this.setState({ toastMessage: message });
    setTimeout(() => {
      this.setState({ toastMessage: '' });
    }, durationMs);
  };

  private initWebSocket() {
    // Reset keep-alive
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    // Clear latency data
    this.setState({ latencies: [], averageLatency: 0 });

    this.socket = new WebSocket('wss://xterm.bonenet.ai');

    this.socket.onopen = () => {
      this.writeToTerminal('Connected to the server.\r\n', true);
      this.setState({
        isConnected: true,
        isAuthenticated: false,
        authToken: '',
      });
      this.startKeepAlive();
    };

    this.socket.onerror = () => {
      this.writeToTerminal('\r\nError: Unable to connect to the server.\r\n', true);
    };

    this.socket.onclose = () => {
      this.writeToTerminal('\r\nConnection closed.\r\n', true);
      this.setState({
        isConnected: false,
        latencies: [],
        averageLatency: 0,
        isAuthenticated: false,
        authToken: '',
      });
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
    };

    this.socket.onmessage = (event) => {
      this.handleServerMessage(event);
    };
  }

  // Keep-alive
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

    // If we see "pong"
    if (data.trim() === 'pong') {
      const latency = Date.now() - this.lastPingSentTime;
      this.updateLatency(latency);
      return;
    }

    // If we see "AUTH - <token>"
    if (data.startsWith('AUTH - ')) {
      // e.g. "AUTH - abc123xyz"
      const token = data.substring(7).trim(); // remove "AUTH - "
      this.setState({
        isAuthenticated: true,
        authToken: token,
      });
      // Do NOT print this to the terminal
      return;
    }

    // Otherwise, just normal data from server
    // => do NOT auto scroll if user is reading
    this.writeToTerminal(data, false);
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

  /**
   * Only scroll if 'scrollToEnd' = true.
   * For new server messages, we pass false.
   * For local user commands, we pass true.
   */
  private writeToTerminal(text: string, scrollToEnd: boolean) {
    if (!this.terminal) return;

    // Convert \n to \r\n for xterm
    this.terminal.write(text.replace(/\r?\n/g, '\r\n'));
    if (scrollToEnd) {
      this.terminal.scrollToBottom();
    }
  }

  private handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { commandHistory, historyIndex, currentInput } = this.state;

    if (e.key === 'Enter') {
      e.preventDefault();

      if (!currentInput.trim()) return;

      // Local command to toggle /latency overlay
      if (currentInput.trim() === '/latency') {
        this.setState((prev) => ({ showLatency: !prev.showLatency, currentInput: '' }));
        return;
      }

      // Send user command to server + show in terminal
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(currentInput);
      }
      // Only scroll if user typed a command
      this.writeToTerminal(`\r\n> ${currentInput}\r\n`, true);

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

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentInput: e.target.value });
  };

  // Toggle connect/disconnect
  private handleIndicatorClick = () => {
    if (this.state.isConnected && this.socket) {
      this.socket.close();
    } else {
      this.initWebSocket();
    }
  };

  // "?" clicked => only send "help" if connected & authenticated
  private handleHelpClick = () => {
    const { isConnected, isAuthenticated } = this.state;
    if (!isConnected) {
      this.showToast('Not connected to server.');
      return;
    }
    if (!isAuthenticated) {
      this.showToast('You must authenticate before sending commands.');
      return;
    }
    // OK to send "help"
    this.socket?.send('help');
  };

  // Cycle themes
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

  private handleCopyCA = () => {
    const CA = 'BjCmA9ZYwJ1BwusMGaSxe4pgaa9gfXTtdyX27NYEpump';
    navigator.clipboard.writeText(CA).then(
        () => {
          this.showToast('CA copied to clipboard!', 2000);
        },
        (err) => {
          this.showToast('Failed to copy CA.', 2000);
          console.error('Failed to copy CA:', err);
        }
    );
  };

  render() {
    const currentTheme = allThemes[this.state.themeIndex];
    const nextIndex = (this.state.themeIndex + 1) % allThemes.length;
    const nextThemeColor = allThemes[nextIndex].foreground;

    const { averageLatency, isConnected, showLatency, toastMessage, currentInput } = this.state;

    return (
        <ThemeProvider theme={currentTheme}>
          <BonenetContainer>
            <MatrixLikeMouseEffect colors={currentTheme.trailColors} />

            {/* Header + Bonecoin Info */}
            <Header nextThemeColor={nextThemeColor} onClick={this.handleThemeSwitch}>
              BONENET

              {/* Bonecoin Info Section */}
              <BonecoinInfo>
                {/* Links Row: bonecoin.dev and DexScreener */}
                <LinksRow>
                  <a
                      href="https://bonecoin.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    bonecoin.dev
                  </a>
                  <a
                      href="https://dexscreener.com/solana/5afrqhmgsbxaovkbr3n1fsjmjsearwzrhzxjjdwhps6a"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    DexScreener
                  </a>
                </LinksRow>

                {/* CA Copy Container */}
                <CAContainer onClick={this.handleCopyCA}>
                  <span>CA: BjCmA9ZYwJ1BwusMGaSxe4pgaa9gfXTtdyX27NYEpump</span>
                  <CopyIcon>📋</CopyIcon>
                </CAContainer>
              </BonecoinInfo>
            </Header>

            {/* Menu bar with connect indicator & help button */}
            <HackerMenuBar className={isConnected ? 'connected' : ''}>
              <div className="indicator-section">
                <div
                    className="indicator-button"
                    onClick={this.handleIndicatorClick}
                    title={isConnected ? 'Click to disconnect' : 'Click to connect'}
                />
              </div>

              <div className="help-button" onClick={this.handleHelpClick}>
                ?
              </div>

              {/* Toast error message, if any */}
              {toastMessage && <ToastMessage>{toastMessage}</ToastMessage>}
            </HackerMenuBar>

            <TerminalWrapper ref={this.terminalRef}>
              <LatencyOverlay visible={showLatency}>{averageLatency}ms</LatencyOverlay>
            </TerminalWrapper>

            <InputContainer>
              <StyledInput
                  ref={this.inputRef}
                  type="text"
                  value={currentInput}
                  onChange={this.handleInputChange}
                  onKeyDown={this.handleInputKeyDown}
                  placeholder="Enter command..."
              />
            </InputContainer>
          </BonenetContainer>
        </ThemeProvider>
    );
  }
}