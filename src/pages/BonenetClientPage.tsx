import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import BonenetMouseEffect from '../components/BonenetMouseEffect';
import { allThemes } from '../styles/BonenetColorSchemes';
import { TerminalInput } from '../components/TerminalInput';
import { BonenetWebSocket } from '../bonenet/BonenetWebSocket';
import { BonenetSSEClient, CreeperEvent } from '../bonenet/BonenetSSEClient';

// ----------------------
// Styled Components
// ----------------------
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
        margin-left: 10px;

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

const ToggleButton = styled.div`
    font-size: 1rem;
    color: ${(props) => props.theme.foreground};
    cursor: pointer;
    margin-left: 10px;
    transition: color 0.3s, transform 0.2s;

    &:hover {
        transform: scale(1.1);
        color: ${(props) => (props.theme.hoverColor ? props.theme.hoverColor : props.theme.foreground)};
    }

    @media (max-width: 768px) {
        font-size: 0.9rem;
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

// ----------------------
// Map Window Styles
// ----------------------
const MapContainer = styled.div<{ visible: boolean; x: number; y: number }>`
    position: absolute;
    top: ${(props) => props.y}px;
    left: ${(props) => props.x}px;
    z-index: 9999;
    border: 2px solid ${(props) => props.theme.borderColor};
    border-radius: 8px;
    box-shadow: 0 0 15px ${(props) => props.theme.boxShadowColor};
    background-color: ${(props) => props.theme.background};
    overflow: hidden; 
    display: ${(props) => (props.visible ? 'inline-block' : 'none')};

    /* Disable xterm's native scrollbars. */
    .xterm-viewport,
    .xterm-scroll-area {
        overflow: hidden !important;
    }

    .xterm-scrollbar {
        display: none !important;
    }
`;

const MapTitleBar = styled.div`
    height: 24px;
    background-color: ${(props) => props.theme.borderColor};
    color: ${(props) => props.theme.background};
    font-size: 0.8rem;
    padding: 0 8px;
    display: flex;
    align-items: center;
    cursor: move;
    user-select: none;
    justify-content: space-between;
`;

const MapTitle = styled.div`
    flex: 1;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
`;

const MapCloseButton = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: black;
    border: 2px solid ${(props) => props.theme.foreground};
    cursor: pointer;
    color: ${(props) => props.theme.foreground};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
        transform: scale(1.1);
        background-color: ${(props) => props.theme.foreground};
        color: ${(props) => props.theme.background};
    }
`;

// ----------------------
// Component State
// ----------------------
interface BonenetClientState {
    themeIndex: number;
    isConnected: boolean;
    isAuthenticated: boolean;
    authToken: string;
    toastMessage: string;

    showMap: boolean;
    mapText: string;       // We'll store the raw map text from the server
    mapWindowX: number;
    mapWindowY: number;

    draggingMap: boolean;
    dragOffsetX: number;
    dragOffsetY: number;
}

// ----------------------
// Main Page Component
// ----------------------
const WS_URL = 'ws://localhost:8888';

export class BonenetClientPage extends React.Component<{}, BonenetClientState> {
    private terminalRef = React.createRef<HTMLDivElement>();
    private terminalInputRef = React.createRef<TerminalInput>();
    private terminal: Terminal | null = null;
    private fitAddon: FitAddon | null = null;

    private wsManager: BonenetWebSocket | null = null;
    private creeperSseClient: BonenetSSEClient | null = null;

    // The map references
    private mapTerminalRef = React.createRef<HTMLDivElement>();
    private mapTerminal: Terminal | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            themeIndex: 0,
            isConnected: false,
            isAuthenticated: false,
            authToken: '',
            toastMessage: '',

            showMap: false,
            mapText: '',
            mapWindowX: 50,
            mapWindowY: 120,
            draggingMap: false,
            dragOffsetX: 0,
            dragOffsetY: 0,
        };
    }

    componentDidMount() {
        // ---------------------
        // Main Terminal
        // ---------------------
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

        // ---------------------
        // WS & SSE
        // ---------------------
        this.initWebSocket();

        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('click', this.handleWindowClick);

        // For dragging the map window:
        window.addEventListener('mousemove', this.handleMapDragMove);
        window.addEventListener('mouseup', this.handleMapDragEnd);
    }

    componentWillUnmount() {
        // Cleanup main terminal
        if (this.terminal) this.terminal.dispose();
        if (this.wsManager) this.wsManager.close();
        if (this.creeperSseClient) this.creeperSseClient.stop();

        // Cleanup map terminal
        if (this.mapTerminal) {
            this.mapTerminal.dispose();
            this.mapTerminal = null;
        }

        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('click', this.handleWindowClick);
        window.removeEventListener('mousemove', this.handleMapDragMove);
        window.removeEventListener('mouseup', this.handleMapDragEnd);
    }

    componentDidUpdate(prevProps: {}, prevState: BonenetClientState) {
        // If user toggles map ON but the mapTerminal doesn't exist yet, create it.
        if (!prevState.showMap && this.state.showMap) {
            this.ensureMapTerminal();
            // If we already have some mapText from the server, draw it immediately
            if (this.mapTerminal && this.state.mapText) {
                this.drawMap(this.state.mapText);
            }
        }
        // If user toggles the map OFF, dispose the map terminal.
        if (prevState.showMap && !this.state.showMap) {
            this.disposeMapTerminal();
        }
    }

    private handleWindowResize = () => {
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
        // If the map terminal is open, we won't automatically refit it,
        // because we want it to remain at the exact number of rows & cols.
    };

    private handleWindowClick = () => {
        this.terminalInputRef.current?.focusInput();
    };

    // ----------------------
    // Map Window Drag
    // ----------------------
    private handleMapDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        this.setState({
            draggingMap: true,
            dragOffsetX: e.clientX - this.state.mapWindowX,
            dragOffsetY: e.clientY - this.state.mapWindowY,
        });
    };

    private handleMapDragMove = (e: MouseEvent) => {
        if (!this.state.draggingMap) return;
        e.preventDefault();
        const newX = e.clientX - this.state.dragOffsetX;
        const newY = e.clientY - this.state.dragOffsetY;
        this.setState({
            mapWindowX: newX,
            mapWindowY: newY,
        });
    };

    private handleMapDragEnd = () => {
        if (this.state.draggingMap) {
            this.setState({ draggingMap: false });
        }
    };

    private ensureMapTerminal() {
        // If the map terminal is already created, do nothing.
        if (this.mapTerminal || !this.mapTerminalRef.current) {
            return;
        }
        const currentTheme = allThemes[this.state.themeIndex].xterm;
        this.mapTerminal = new Terminal({
            theme: {
                background: currentTheme.background,
                foreground: currentTheme.foreground,
            },
            scrollback: 0,       // Disable scrollback to remove scrollbars
            cursorBlink: false,
            disableStdin: true,
            allowTransparency: true,
        });

        // We open it inside the mapTerminalRef container
        this.mapTerminal.open(this.mapTerminalRef.current);
    }

    private disposeMapTerminal() {
        if (this.mapTerminal) {
            this.mapTerminal.dispose();
            this.mapTerminal = null;
        }
    }

    // ----------------------
    // WebSocket & SSE
    // ----------------------
    private initWebSocket() {
        if (this.wsManager) {
            this.wsManager.close();
        }
        this.wsManager = new BonenetWebSocket(WS_URL);
        this.wsManager.connect(
            () => {
                this.writeToTerminal('Connected to the server.\r\n', true);
                this.setState({
                    isConnected: true,
                    isAuthenticated: false,
                    authToken: '',
                });
            },
            (data: string) => {
                this.writeToTerminal(data, false);
            },
            (token: string) => {
                this.setState({
                    isAuthenticated: true,
                    authToken: token,
                });
                if (!this.creeperSseClient) {
                    this.creeperSseClient = new BonenetSSEClient('http://localhost:8888/api/events', token);
                    this.creeperSseClient.setEventCallback(this.handleCreeperEvent);
                } else {
                    this.creeperSseClient.updateAuth(token);
                }
                this.creeperSseClient.start();
            },
            () => {
                this.writeToTerminal('\r\nConnection closed.\r\n', true);
                this.setState({
                    isConnected: false,
                    isAuthenticated: false,
                    authToken: '',
                });
                if (this.creeperSseClient) {
                    this.creeperSseClient.stop();
                }
            },
            () => {
                this.writeToTerminal('\r\nError: Unable to connect to the server.\r\n', true);
            }
        );
    }

// 1) When handling the DRAW_MAP event, store the raw text and call drawMap(parsed.map):
    private handleCreeperEvent = (event: CreeperEvent) => {
        console.log('Received Creeper event:', event);
        if (event.creeperEventType === 'DRAW_MAP') {
            try {
                const parsed = JSON.parse(event.payload);
                if (parsed && parsed.map) {
                    console.log('Extracted MAP data:', parsed.map);
                    this.setState({ mapText: parsed.map }, () => {
                        // If the map window is open, draw
                        if (this.state.showMap) {
                            this.drawMap(parsed.map);
                        }
                    });
                } else {
                    console.warn('DRAW_MAP event missing "map" key:', event.payload);
                }
            } catch (error) {
                console.error('Error parsing DRAW_MAP payload:', error);
            }
        }
    };

    private drawMap(mapString: string) {
        if (!this.mapTerminal) return;

        // Convert JSON-escaped sequences to real ANSI
        const finalMap = this.formatMapForXterm(mapString);

        // Split into lines and process for fixed size
        const rawLines = finalMap.replace(/\r/g, '').split('\n');
        const FIXED_ROWS = 10;
        const FIXED_COLS = 30; // Visible columns (excluding ANSI codes)

        // Process lines to fit fixed grid while preserving ANSI
        const processedLines: string[] = [];
        for (let i = 0; i < FIXED_ROWS; i++) {
            let line = i < rawLines.length ? rawLines[i] : '';

            // Calculate visible length (without ANSI codes)
            const visibleLength = this.stripAnsi(line).length;

            // Truncate or pad while preserving ANSI sequences
            if (visibleLength > FIXED_COLS) {
                line = this.truncateAnsi(line, FIXED_COLS);
            } else {
                line += '\x1b[0m' + ' '.repeat(FIXED_COLS - visibleLength);
            }

            processedLines.push(line);
        }

        // Resize terminal to fixed dimensions
        this.mapTerminal.resize(FIXED_COLS, FIXED_ROWS);
        this.mapTerminal.clear();
        this.mapTerminal.write(processedLines.join('\r\n'));

        // Update container size based on fixed grid
        this.updateMapContainerSize(FIXED_ROWS, FIXED_COLS);
    }

// Helper to remove ANSI escape codes
    private stripAnsi(str: string): string {
        return str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
    }

// Helper to truncate string without breaking ANSI codes
    private truncateAnsi(str: string, maxLength: number): string {
        let ansi = false;
        let strippedLength = 0;
        const chars: string[] = [];

        for (const char of str) {
            if (char === '\x1b') ansi = true;
            if (!ansi) strippedLength++;
            chars.push(char);
            if (char === 'm') ansi = false;
            if (strippedLength === maxLength) break;
        }

        // Close any open ANSI codes
        if (ansi) chars.push('\x1b[0m');

        return chars.join('');
    }

    private updateMapContainerSize(rows: number, cols: number) {
        const mapDiv = this.mapTerminalRef.current;
        if (!mapDiv || !this.mapTerminal) return;

        const rowEl = mapDiv.querySelector('.xterm-rows > div');
        if (!rowEl) return;

        const rowRect = rowEl.getBoundingClientRect();
        const charWidth = rowRect.width / cols;
        const charHeight = rowRect.height;

        const container = mapDiv.parentElement;
        if (container) {
            container.style.width = `${Math.ceil(charWidth * cols + 8)}px`;
            container.style.height = `${Math.ceil(charHeight * rows + 24)}px`;
        }
    }

    private formatMapForXterm(mapString: string): string {
        // Convert JSON-escaped sequences to real ANSI
        return mapString
            .replace(/\\u001B/g, '\u001B')
            .replace(/\\r/g, '\r')
            .replace(/\\n/g, '\n');
    }

    // ----------------------
    // Main Terminal Output
    // ----------------------
    private writeToTerminal(text: string, scrollToEnd: boolean) {
        if (!this.terminal) return;
        this.terminal.write(text.replace(/\r?\n/g, '\r\n'));
        if (scrollToEnd) {
            this.terminal.scrollToBottom();
        }
    }

    private handleCommandSubmit = (command: string) => {
        if (this.wsManager) {
            this.wsManager.send(command);
        }
        this.writeToTerminal(`\r\n> ${command}\r\n`, true);
    };

    // ----------------------
    // UI Button Handlers
    // ----------------------
    private handleIndicatorClick = () => {
        if (this.state.isConnected && this.wsManager) {
            this.wsManager.close();
            if (this.creeperSseClient) {
                this.creeperSseClient.stop();
            }
        } else {
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

    private handleThemeSwitch = () => {
        this.setState(
            (prev) => ({
                themeIndex: (prev.themeIndex + 1) % allThemes.length,
            }),
            () => {
                // Update the main terminal theme
                if (this.terminal) {
                    const newXtermTheme = allThemes[this.state.themeIndex].xterm;
                    this.terminal.setOption('theme', {
                        background: newXtermTheme.background,
                        foreground: newXtermTheme.foreground,
                    });
                }
                // Update the map terminal theme
                if (this.mapTerminal) {
                    const newXtermTheme = allThemes[this.state.themeIndex].xterm;
                    this.mapTerminal.setOption('theme', {
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
            () => this.showToast('CA copied to clipboard!', 2000),
            (err) => {
                this.showToast('Failed to copy CA.', 2000);
                console.error('Failed to copy CA:', err);
            }
        );
    };

    private toggleMap = () => {
        this.setState((prev) => ({ showMap: !prev.showMap }));
    };

    private handleCloseMap = () => {
        this.setState({ showMap: false });
    };

    private showToast = (message: string, durationMs = 3000) => {
        this.setState({ toastMessage: message });
        setTimeout(() => {
            this.setState({ toastMessage: '' });
        }, durationMs);
    };

    // ----------------------
    // RENDER
    // ----------------------
    render() {
        const currentTheme = allThemes[this.state.themeIndex];
        const nextIndex = (this.state.themeIndex + 1) % allThemes.length;
        const nextThemeColor = allThemes[nextIndex].foreground;

        const { isConnected, toastMessage, showMap, mapWindowX, mapWindowY } = this.state;

        return (
            <ThemeProvider theme={currentTheme}>
                <BonenetContainer>
                    <BonenetMouseEffect colors={currentTheme.trailColors} />

                    <Header nextThemeColor={nextThemeColor} onClick={this.handleThemeSwitch}>
                        BONENET
                        <BonecoinInfo>
                            <LinksRow>
                                <a href="https://bonecoin.dev" target="_blank" rel="noopener noreferrer">
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
                                <span>CA: BjCmA9ZYwJ1BwusMGaSxe4pgaa9gfXTtdyX27NYEpump</span>
                                <CopyIcon>📋</CopyIcon>
                            </CAContainer>
                        </BonecoinInfo>
                    </Header>

                    <HackerMenuBar className={isConnected ? 'connected' : ''}>
                        <div className="indicator-section">
                            <div
                                className="indicator-button"
                                onClick={this.handleIndicatorClick}
                                title={isConnected ? 'Click to disconnect' : 'Click to connect'}
                            />
                            <ToggleButton onClick={this.toggleMap}>[ MAP ]</ToggleButton>
                            <div className="help-button" onClick={this.handleHelpClick}>
                                ?
                            </div>
                        </div>
                        {toastMessage && <ToastMessage>{toastMessage}</ToastMessage>}
                    </HackerMenuBar>

                    <TerminalWrapper ref={this.terminalRef} />

                    <InputContainer>
                        <TerminalInput ref={this.terminalInputRef} onSubmit={this.handleCommandSubmit} />
                    </InputContainer>

                    {/* Draggable map window */}
                    <MapContainer visible={showMap} x={mapWindowX} y={mapWindowY}>
                        <MapTitleBar onMouseDown={this.handleMapDragStart}>
                            <MapTitle>MAP WINDOW</MapTitle>
                            <MapCloseButton
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={this.handleCloseMap}
                            >
                                ✖
                            </MapCloseButton>
                        </MapTitleBar>
                        <div
                            ref={this.mapTerminalRef}
                            style={{ width: '100%', height: 'calc(100% - 24px)' }}
                        />
                    </MapContainer>
                </BonenetContainer>
            </ThemeProvider>
        );
    }
}