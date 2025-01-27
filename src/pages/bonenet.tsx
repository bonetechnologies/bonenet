// bonenet.tsx

import React from 'react';
import styled from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import MouseTrail from '../components/mousetrail'; // Adjust the path as needed
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

const Header = styled.h1`
  font-size: 2rem;
  color: #00ff99;
  margin-bottom: 20px;
`;

interface TelnetClientState {
  isAuthenticated: boolean;
  authToken: string | null;
}

export class TelnetClient extends React.Component<{}, TelnetClientState> {
  private terminalRef = React.createRef<HTMLDivElement>();
  private terminal: Terminal | null = null;
  private socket: WebSocket | null = null;
  private fitAddon: FitAddon | null = null;

  // Store user input as we receive it
  private inputBuffer: string = '';

  // Track last pong time (if you want to use this for additional logic)
  private lastPongTime: number = Date.now();

  // We'll set up keepAliveInterval after authentication
  private keepAliveInterval: number | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      isAuthenticated: false,
      authToken: null,
    };
  }

  componentDidMount() {
    // 1. Initialize Terminal
    this.terminal = new Terminal({
      theme: {
        background: '#1a1a1d',
        foreground: '#00ff99',
      },
      cursorBlink: true,
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    // Mount the terminal in the DOM
    if (this.terminalRef.current) {
      this.terminal.open(this.terminalRef.current);
      this.fitAddon.fit();
    }
    this.terminal.focus();

    // 2. Establish WebSocket Connection
    this.socket = new WebSocket('wss://xterm.bonenet.ai:26000');

    // 3. Set up WebSocket event listeners
    this.socket.onopen = () => {
      // Successfully connected to the server
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

    // 4. Handle terminal input
    this.terminal.onData((data) => {
      this.handleTerminalInput(data);
    });
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
   * Handle user input from the terminal
   */
  private handleTerminalInput(data: string) {
    if (!this.terminal) return;

    // Enter key sends the buffer
    if (data === '\r') {
      if (this.socket && this.inputBuffer.length > 0) {
        // Send the command in the buffer
        this.socket.send(this.inputBuffer);
        this.inputBuffer = '';
      }
      // Move to new line on the terminal
      this.writeToTerminal('\r\n');
    }
    // Backspace handling
    else if (data === '\u0008' || data === '\x7f') {
      if (this.inputBuffer.length > 0) {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        this.terminal.write('\b \b'); // Erases last character visually
      }
    } else {
      // Normal characters
      this.inputBuffer += data;
      // Echo back to terminal
      this.terminal.write(data);
    }
  }

  render() {
    return (
      <TelnetContainer>
        <MouseTrail />
        <Header>BONENET</Header>
        <TerminalWrapper ref={this.terminalRef}></TerminalWrapper>
      </TelnetContainer>
    );
  }
}