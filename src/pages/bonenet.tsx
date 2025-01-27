// bonenet.tsx

import React from 'react';
import styled from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import MouseTrail from '../components/mousetrail'; // Adjust path as needed
import 'xterm/css/xterm.css';

const TelnetContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1d, #323232);
  color: #00ff99;
  font-family: 'Courier New', Courier, monospace;
`;

const TerminalWrapper = styled.div`
  width: 80%;
  height: 70%;
  border: 2px solid #00ff99;
  border-radius: 8px;
  box-shadow: 0 0 20px #00ff99;
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
  color: #00ff99;
  background-color: #1a1a1d;
  border: 2px solid #00ff99;
  border-radius: 8px;
  outline: none;
  box-shadow: 0 0 10px #00ff99;

  &:focus {
    border-color: #00ffaa;
  }
`;

const Header = styled.h1`
  font-size: 2rem;
  color: #00ff99;
  margin-bottom: 20px;
`;

interface TelnetClientState {
  isAuthenticated: boolean;
  authToken: string | null;
  commandHistory: string[];
  historyIndex: number;     // For navigating history
  currentInput: string;     // Current contents of the separate input box
}

export class TelnetClient extends React.Component<{}, TelnetClientState> {
  private terminalRef = React.createRef<HTMLDivElement>();
  private inputRef = React.createRef<HTMLInputElement>();   // <-- 1) create a ref for the input

  private terminal: Terminal | null = null;
  private socket: WebSocket | null = null;
  private fitAddon: FitAddon | null = null;

  // Track last pong time (if you want to use this for additional logic)
  private lastPongTime: number = Date.now();

  // We'll set up keepAliveInterval after authentication
  private keepAliveInterval: number | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      isAuthenticated: false,
      authToken: null,
      commandHistory: [],
      historyIndex: -1,
      currentInput: '',
    };
  }

  componentDidMount() {
    // 1. Initialize Terminal (for output only now)
    this.terminal = new Terminal({
      theme: {
        background: '#1a1a1d',
        foreground: '#00ff99',
      },
      cursorBlink: true,
      disableStdin: true, // Disable direct input in the xterm
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    // Mount the terminal in the DOM
    if (this.terminalRef.current) {
      this.terminal.open(this.terminalRef.current);
      this.fitAddon.fit();
    }

    // 2. Establish WebSocket Connection
    this.socket = new WebSocket('wss://xterm.bonenet.ai:26000');

    // 3. Set up WebSocket event listeners
    this.socket.onopen = () => {
      this.writeToTerminal('Connected to the server.\r\n');
    };

    this.socket.onerror = () => {
      this.writeToTerminal('\r\nError: Unable to connect to the server.\r\n');
    };

    this.socket.onclose = () => {
      this.writeToTerminal('\r\nConnection closed.\r\n');
      // Stop keep-alive if running
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
    };

    this.socket.onmessage = (event) => {
      this.handleServerMessage(event);
    };

    // 4. Auto-focus the input box on mount
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  componentWillUnmount() {
    // Clean up terminal resources
    if (this.terminal) {
      this.terminal.dispose();
    }
    // Clean up websocket
    if (this.socket) {
      this.socket.close();
    }
    // Stop keepAlive if it’s still running
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
  }

  /**
   * Helper: Writes text to the terminal, normalizing newlines
   */
  private writeToTerminal(text: string) {
    if (this.terminal) {
      // Replace \n with \r\n for xterm compatibility
      this.terminal.write(text.replace(/\r?\n/g, '\r\n'));
    }
  }

  /**
   * Handle messages coming from the WebSocket / Telnet server
   */
  private handleServerMessage(event: MessageEvent) {
    const data =
      typeof event.data === 'string'
        ? event.data
        : '[Non-string data received]';

    // Check for keep-alive 'pong'
    if (data.trim() === 'pong') {
      console.log('Pong received.');
      this.lastPongTime = Date.now();
      return; // Don't write 'pong' to the terminal
    }

    // Check for authentication message "AUTH - <token>"
    if (data.startsWith('AUTH - ')) {
      const token = data.substring('AUTH - '.length).trim();
      this.setState(
        { isAuthenticated: true, authToken: token },
        this.startKeepAliveIfNeeded
      );
      return;
    }

    // Otherwise, write server output to terminal
    this.writeToTerminal(data);
  }

  /**
   * Once authenticated, starts a ping keep-alive every 10 seconds if not already started
   */
  private startKeepAliveIfNeeded = () => {
    if (this.state.isAuthenticated && !this.keepAliveInterval) {
      this.keepAliveInterval = window.setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send('ping');
        }
      }, 10000);
    }
  };

  /**
   * Handle keydown events in the separate input field, including:
   * - Enter to send command
   * - ArrowUp / ArrowDown to navigate history
   */
  private handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { commandHistory, historyIndex, currentInput } = this.state;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!currentInput.trim()) {
        return;
      }
      // Send the command to the server
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(currentInput);
      }
      // Optionally write the command into the terminal:
      this.writeToTerminal(`\r\n> ${currentInput}\r\n`);

      // Update history
      this.setState({
        commandHistory: [...commandHistory, currentInput],
        historyIndex: -1,
        currentInput: '',
      });
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move up in history
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
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Move down in history
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

  /**
   * Update local state as the user types in the command input
   */
  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentInput: e.target.value });
  };

  render() {
    return (
      <TelnetContainer>
        <MouseTrail />
        <Header>BONENET</Header>
        {/* Terminal for output */}
        <TerminalWrapper ref={this.terminalRef} />

        {/* Separate input container */}
        <InputContainer>
          <StyledInput
            ref={this.inputRef}                // <-- 2) attach the ref here
            type="text"
            //placeholder="Enter command here..."
            value={this.state.currentInput}
            onChange={this.handleInputChange}
            onKeyDown={this.handleInputKeyDown}
          />
        </InputContainer>
      </TelnetContainer>
    );
  }
}