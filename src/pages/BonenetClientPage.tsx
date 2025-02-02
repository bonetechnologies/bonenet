import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import BonenetMouseEffect from '../components/BonenetMouseEffect';
import { allThemes } from '../styles/BonenetColorSchemes';
import { TerminalInput } from '../components/TerminalInput';
import { BonenetWebSocket } from '../bonenet/BonenetWebSocket'; // New WebSocket abstraction
import {BonenetSSEClient} from '../bonenet/BonenetSSEClient'; // New SSE client abstraction

// STYLED COMPONENTS (unchanged)

const BonenetContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: ${(props) => props.theme.background};
    color: ${(props) => props.theme.foreground};
    font-family: 'Courier New', Courier, monospace;
    overflow: hidden;

    /* Original Hacker Green Scrollbar Style */
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
    overflow: hidden;

    /* Original Hacker Green Scrollbar Style */
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

    @media (max-width: 768px) {
        width: 100%;
        height: 60%;
        border: none;
        box-shadow: none;
        border-radius: 0;
    }
`;

const InputContainer = styled.div`
    width: 80%;
    margin-top: 10px;
    @media (max-width: 768px) {
        width: 100%;
        margin-top: 5px;
    }
`;

const Header = styled.h1<{ nextThemeColor: string }>`
    font-size: 2rem;
    color: ${(props) => props.theme.foreground};
    margin-bottom: 10px;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: ${(props) => props.nextThemeColor};
        cursor: pointer;
    }

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
    padding: 0 10px;
    position: relative;

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
        background-color: black;
        transition: background-color 0.3s, transform 0.2s;

        &:hover {
            transform: scale(1.1);
        }
    }

    &.connected .indicator-button {
        background-color: ${(props) => props.theme.foreground};
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
    @media (max-width: 768px) {
        font-size: 0.8rem;
        padding: 3px 6px;
    }
`;

const BonecoinInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 20px;
    font-size: 0.9rem;
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
            color: #ff0;
            text-shadow: 0 0 5px #ff0;
        }

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
        user-select: none;
    }

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

    @media (max-width: 768px) {
        padding: 1px 3px;
        font-size: 0.7rem;
    }
`;

// COMPONENT STATE INTERFACE

// ---------------------------------------------------------------------
// COMPONENT STATE & CLASS
// ---------------------------------------------------------------------

interface BonenetClientState {
    themeIndex: number;
    isConnected: boolean;
    isAuthenticated: boolean;
    authToken: string;
    toastMessage: string;
}

const url = 'ws://localhost:8888';

export class BonenetClientPage extends React.Component<{}, BonenetClientState> {
    private terminalRef = React.createRef<HTMLDivElement>();
    private terminalInputRef = React.createRef<TerminalInput>();
    private terminal: Terminal | null = null;
    private wsManager: BonenetWebSocket | null = null;
    private fitAddon: FitAddon | null = null;

    // SSE CLIENT: We'll use this to receive creeper events
    private creeperSseClient: BonenetSSEClient | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            themeIndex: 0,
            isConnected: false,
            isAuthenticated: false,
            authToken: '',
            toastMessage: '',
        };
    }

    componentDidMount() {
        // Initialize xterm
        const currentTheme = allThemes[this.state.themeIndex].xterm;
        this.terminal = new Terminal({
            theme: {
                background: currentTheme.background,
                foreground: currentTheme.foreground,
            },
            cursorBlink: false,
            disableStdin: true,
        });
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);

        if (this.terminalRef.current) {
            this.terminal.open(this.terminalRef.current);
            this.fitAddon.fit();
        }

        // Connect to the WebSocket
        this.initWebSocket();

        // Event listeners
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('click', this.handleWindowClick);
    }

    componentWillUnmount() {
        if (this.terminal) this.terminal.dispose();
        if (this.wsManager) this.wsManager.close();

        // Stop SSE when unmounting:
        if (this.creeperSseClient) {
            this.creeperSseClient.stop();
        }

        window.removeEventListener('click', this.handleWindowClick);
        window.removeEventListener('resize', this.handleWindowResize);
    }

    private handleWindowResize = () => {
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
    };

    /**
     * Focus the TerminalInput when the window is clicked.
     */
    private handleWindowClick = () => {
        this.terminalInputRef.current?.focusInput();
    };

    /**
     * Show a temporary toast message on the menu bar.
     */
    private showToast = (message: string, durationMs = 3000) => {
        this.setState({ toastMessage: message });
        setTimeout(() => {
            this.setState({ toastMessage: '' });
        }, durationMs);
    };

    /**
     * Initialize or re-initialize the WebSocket.
     */
    private initWebSocket() {
        if (this.wsManager) {
            this.wsManager.close();
        }

        this.wsManager = new BonenetWebSocket(url);
        this.wsManager.connect(
            // onOpen
            () => {
                this.writeToTerminal('Connected to the server.\r\n', true);
                this.setState({
                    isConnected: true,
                    isAuthenticated: false,
                    authToken: '',
                });
            },
            // onMessage
            (data: string) => {
                this.writeToTerminal(data, false);
            },
            // onAuth - this is fired when we get a valid auth token
            (token: string) => {
                this.setState({
                    isAuthenticated: true,
                    authToken: token,
                });

                // Once authenticated via WebSocket, start or update the SSE client
                if (!this.creeperSseClient) {
                    // Provide your actual SSE endpoint below
                    this.creeperSseClient = new BonenetSSEClient(
                        'http://localhost:8888/api/events',
                        token
                    );
                } else {
                    // If we already have an SSE client, just update the token
                    this.creeperSseClient.updateAuth(token);
                }

                // Start the SSE client
                this.creeperSseClient.start();
            },
            // onClose
            () => {
                this.writeToTerminal('\r\nConnection closed.\r\n', true);
                this.setState({
                    isConnected: false,
                    isAuthenticated: false,
                    authToken: '',
                });

                // Stop SSE on disconnect
                if (this.creeperSseClient) {
                    this.creeperSseClient.stop();
                }
            },
            // onError
            () => {
                this.writeToTerminal('\r\nError: Unable to connect to the server.\r\n', true);
            }
        );
    }

    /**
     * Write text to the terminal. Replaces \n with \r\n.
     */
    private writeToTerminal(text: string, scrollToEnd: boolean) {
        if (!this.terminal) return;
        this.terminal.write(text.replace(/\r?\n/g, '\r\n'));
        if (scrollToEnd) {
            this.terminal.scrollToBottom();
        }
    }

    /**
     * Called when the TerminalInput child submits a command string.
     */
    private handleCommandSubmit = (command: string) => {
        if (this.wsManager) {
            this.wsManager.send(command);
        }
        this.writeToTerminal(`\r\n> ${command}\r\n`, true);
    };

    /**
     * Connection indicator click toggles WebSocket connect/disconnect.
     */
    private handleIndicatorClick = () => {
        if (this.state.isConnected && this.wsManager) {
            // Disconnect
            this.wsManager.close();
            if (this.creeperSseClient) {
                this.creeperSseClient.stop();
            }
        } else {
            // Connect
            this.initWebSocket();
        }
    };

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
        this.wsManager?.send('help');
    };

    /**
     * Cycles the terminal and background globalTheme.
     */
    private handleThemeSwitch = () => {
        this.setState(
            (prev) => ({ themeIndex: (prev.themeIndex + 1) % allThemes.length }),
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

    /**
     * Copies the Bonecoin contract address to clipboard.
     */
    private handleCopyCA = () => {
        const CA = 'BjCmA9ZYwJ1BwusMGaSxe4pgaa9gfXTtdyX27NYEpump';
        navigator.clipboard.writeText(CA).then(
            () => this.showToast('CA copied to clipboard!', 2000),
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

        const { isConnected, toastMessage } = this.state;

        return (
            <ThemeProvider theme={currentTheme}>
                <BonenetContainer>
                    <BonenetMouseEffect colors={currentTheme.trailColors} />

                    {/* Header with Bonecoin Info */}
                    <Header nextThemeColor={nextThemeColor} onClick={this.handleThemeSwitch}>
                        BONENET
                        <BonecoinInfo>
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
                            <CAContainer onClick={this.handleCopyCA}>
                                <span>
                                    CA: BjCmA9ZYwJ1BwusMGaSxe4pgaa9gfXTtdyX27NYEpump
                                </span>
                                <CopyIcon>📋</CopyIcon>
                            </CAContainer>
                        </BonecoinInfo>
                    </Header>

                    {/* Connection menu bar */}
                    <HackerMenuBar className={isConnected ? 'connected' : ''}>
                        <div className="indicator-section">
                            <div
                                className="indicator-button"
                                onClick={this.handleIndicatorClick}
                                title={
                                    isConnected
                                        ? 'Click to disconnect'
                                        : 'Click to connect'
                                }
                            />
                        </div>
                        <div className="help-button" onClick={this.handleHelpClick}>
                            ?
                        </div>
                        {toastMessage && <ToastMessage>{toastMessage}</ToastMessage>}
                    </HackerMenuBar>

                    {/* Terminal */}
                    <TerminalWrapper ref={this.terminalRef} />

                    {/* Input */}
                    <InputContainer>
                        <TerminalInput
                            ref={this.terminalInputRef}
                            onSubmit={this.handleCommandSubmit}
                        />
                    </InputContainer>
                </BonenetContainer>
            </ThemeProvider>
        );
    }
}