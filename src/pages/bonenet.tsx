import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import MouseTrail from '../components/mousetrail'; // Adjust the path based on your file structure
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

export const TelnetClient: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const inputBuffer = useRef<string>(''); // Buffer for user input

  useEffect(() => {
    const term = new Terminal({
      theme: {
        background: '#1a1a1d',
        foreground: '#00ff99',
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current!);
    fitAddon.fit();
    terminal.current = term;

    const ws = new WebSocket('wss://xterm.bonenet.ai:26000');
    socket.current = ws;

    // Handle messages from the backend WebSocket
    ws.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? event.data.replace(/\r?\n/g, '\r\n') : '[Non-string data received]';
        console.log('Data received from backend:', data); // Debug log
        term.write(data); // Write Telnet server responses to the terminal
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    // Buffer input and send only on Enter
    term.onData((data) => {
      if (data === '\r') {
        // Send the buffered command when Enter is pressed
        if (socket.current && inputBuffer.current.trim() !== '') {
          socket.current.send(inputBuffer.current); // Send only non-empty commands
          inputBuffer.current = ''; // Clear the buffer
        }
        term.write('\r\n'); // Newline in the terminal
      } else if (data === '\u0008' || data === '\x7f') {
        // Handle Backspace
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b'); // Remove the last character from the terminal
        }
      } else {
        inputBuffer.current += data; // Add input to the buffer
        term.write(data); // Echo input to the terminal
      }
    });

    ws.onclose = () => {
      term.write('\r\nConnection closed.\r\n');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      term.write('\r\nError: Unable to connect to the server.\r\n');
    };

    return () => {
      term.dispose();
      ws.close(); // Close the WebSocket connection on unmount
    };
  }, []);

  return (
    <TelnetContainer>
      <MouseTrail />
      <Header>BONENET</Header>
      <TerminalWrapper ref={terminalRef}></TerminalWrapper>
    </TelnetContainer>
  );
};