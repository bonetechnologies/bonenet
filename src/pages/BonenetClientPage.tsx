// BonenetClientPage.tsx

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
import { BonenetApiClient } from '../bonenet/BonenetApiClient';

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

const Header = styled.h1`
    font-size: 2rem;
    color: ${(props) => props.theme.foreground};
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        font-size: 1.5rem;
        flex-direction: column;
        align-items: center;
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

    .right-section {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
    }

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

const ToggleButton = styled.div<{ active?: boolean }>`
    font-size: 1rem;
    color: ${(props) => (props.active ? '#ff0' : props.theme.foreground)};
    cursor: pointer;
    font-weight: bold;
    transition: color 0.3s, transform 0.2s;

    &:hover {
        transform: scale(1.1);
        color: ${(props) =>
                props.active
                        ? '#ff0'
                        : props.theme.hoverColor
                                ? props.theme.hoverColor
                                : props.theme.foreground};
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

// ----------------------
// Theme Menu (Dropdown)
// ----------------------
const ThemeMenuContainer = styled.div`
    position: absolute;
    top: 44px;
    right: 0; /* align with the right side of the menu bar's right-section */
    background-color: ${(props) => props.theme.background};
    border: 2px solid ${(props) => props.theme.borderColor};
    border-radius: 8px;
    box-shadow: 0 0 10px ${(props) => props.theme.boxShadowColor};
    z-index: 10000; /* <-- changed from 2000 to a value above 9999 */
    min-width: 150px;
    padding: 4px;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        top: 36px;
    }
`;

const ThemeItem = styled.div<{ selected?: boolean }>`
    padding: 4px 8px;
    margin: 2px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${(props) => (props.selected ? '#ff0' : props.theme.foreground)};
    font-weight: ${(props) => (props.selected ? 'bold' : 'normal')};
    transition: background-color 0.2s;

    &:hover {
        background-color: ${(props) =>
                props.theme.hoverColor ? props.theme.hoverColor : props.theme.foreground};
        color: ${(props) => props.theme.background};
    }
`;

const ThemeColorSwatch = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 2px;
    margin-left: 6px;
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
    gap: 8px;
    cursor: move;
    user-select: none;
`;

const MapTitle = styled.div`
    flex: 1;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: left;
    font-weight: bold;
`;

const MapCloseButton = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.foreground};
    border: 2px solid ${(props) => props.theme.foreground};
    cursor: pointer;
    color: ${(props) => props.theme.background};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
        opacity: 0.8;
    }
`;

// ----------------------
// Movement Window
// ----------------------
const MovementContainer = styled.div<{ visible: boolean; x: number; y: number }>`
    position: absolute;
    top: ${(props) => props.y}px;
    left: ${(props) => props.x}px;
    z-index: 9999;
    width: 240px;
    background-color: ${(props) => props.theme.background};
    border: 2px solid ${(props) => props.theme.borderColor};
    border-radius: 8px;
    box-shadow: 0 0 15px ${(props) => props.theme.boxShadowColor};
    user-select: none;
    display: ${(props) => (props.visible ? 'inline-block' : 'none')};
`;

const MovementTitleBar = styled.div`
    height: 24px;
    background-color: ${(props) => props.theme.borderColor};
    color: ${(props) => props.theme.background};
    font-size: 0.8rem;
    padding: 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
    cursor: move;
`;

const MovementTitle = styled.div`
    flex: 1;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: left;
    font-weight: bold;
`;

const MovementCloseButton = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.foreground};
    border: 2px solid ${(props) => props.theme.foreground};
    cursor: pointer;
    color: ${(props) => props.theme.background};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
        opacity: 0.8;
    }
`;

const MovementContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    gap: 8px;
`;

const BindContainer = styled.label`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    user-select: none;

    /* Custom smaller checkbox styling */
    input[type="checkbox"] {
        appearance: none;
        width: 14px;
        height: 14px;
        border: 2px solid ${(props) => props.theme.foreground};
        border-radius: 3px;
        background: transparent;
        position: relative;
        cursor: pointer;
        margin: 0;
        padding: 0;

        &:checked::after {
            content: '';
            position: absolute;
            left: 2px;
            top: 2px;
            width: 6px;
            height: 6px;
            background: ${(props) => props.theme.foreground};
        }
    }
`;

const ArrowRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const MovementButton = styled.div<{ active?: boolean }>`
    width: 40px;
    height: 40px;
    border: 2px solid ${(props) => props.theme.foreground};
    border-radius: 4px;
    font-size: 0.9rem;
    color: ${(props) => props.theme.foreground};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    background-color: ${(props) => (props.active ? props.theme.foreground : 'transparent')};
    color: ${(props) => (props.active ? props.theme.background : props.theme.foreground)};

    &:hover {
        background-color: ${(props) =>
                props.active
                        ? props.theme.foreground
                        : props.theme.hoverColor || props.theme.foreground};
        color: ${(props) => props.theme.background};
    }
`;

// ----------------------
// Prompt for Enter
// ----------------------
const EnterPromptOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100000; /* ensure above all windows */
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const EnterPromptBox = styled.div`
    background-color: ${(props) => props.theme.background};
    border: 2px solid ${(props) => props.theme.borderColor};
    border-radius: 8px;
    box-shadow: 0 0 15px ${(props) => props.theme.boxShadowColor};
    padding: 10px;
    width: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    @media (max-width: 768px) {
        width: 90%;
    }
`;

const EnterPromptTitle = styled.div`
    font-weight: bold;
    font-size: 1rem;
`;

const EnterPromptInput = styled.input`
    width: 80%;
    padding: 4px 6px;
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.foreground};
    border: 1px solid ${(props) => props.theme.foreground};
    border-radius: 4px;
    outline: none;

    &:focus {
        border-color: #ff0;
    }
`;

const PromptButtonsRow = styled.div`
    display: flex;
    gap: 12px;
`;

const PromptButton = styled(MovementButton)`
    min-width: 60px; /* Enough to fit "Cancel" nicely */
`;

// ----------------------
// State
// ----------------------
interface BonenetClientState {
    themeIndex: number;
    showThemeMenu: boolean;

    isConnected: boolean;
    isAuthenticated: boolean;
    authToken: string;
    toastMessage: string;

    // MAP
    showMap: boolean;
    mapText: string;
    mapWindowX: number;
    mapWindowY: number;
    draggingMap: boolean;
    dragOffsetX: number;
    dragOffsetY: number;

    // MOVEMENT
    movementWindowOpen: boolean;
    movementWindowX: number;
    movementWindowY: number;
    draggingMovement: boolean;
    movementDragOffsetX: number;
    movementDragOffsetY: number;

    // If "bindKeys" is true, arrow keys + U / D / E => movement
    bindKeys: boolean;

    arrowUpPressed: boolean;
    arrowDownPressed: boolean;
    arrowLeftPressed: boolean;
    arrowRightPressed: boolean;

    // ENTER PROMPT
    enterPromptOpen: boolean;
    enterPromptValue: string;
}

const WS_URL = 'wss://xterm.bonenet.ai';

export class BonenetClientPage extends React.Component<{}, BonenetClientState> {
    private terminalRef = React.createRef<HTMLDivElement>();
    private terminalInputRef = React.createRef<TerminalInput>();
    private terminal: Terminal | null = null;
    private fitAddon: FitAddon | null = null;

    private wsManager: BonenetWebSocket | null = null;
    private creeperSseClient: BonenetSSEClient | null = null;
    private apiClient: BonenetApiClient | null = null;

    // map references
    private mapTerminalRef = React.createRef<HTMLDivElement>();
    private mapTerminal: Terminal | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            themeIndex: 0,
            showThemeMenu: false,

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

            movementWindowOpen: false,
            movementWindowX: 300,
            movementWindowY: 250,
            draggingMovement: false,
            movementDragOffsetX: 0,
            movementDragOffsetY: 0,

            bindKeys: false,

            arrowUpPressed: false,
            arrowDownPressed: false,
            arrowLeftPressed: false,
            arrowRightPressed: false,

            enterPromptOpen: false,
            enterPromptValue: '',
        };
    }

    componentDidMount() {
        // Terminal
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

        setTimeout(() => {
            const terminalElement = this.terminalRef.current;
            if (terminalElement) {
                const rect = terminalElement.getBoundingClientRect();
                this.setState({
                    mapWindowX: rect.right - 320,
                    mapWindowY: rect.top + 20,
                });
            }
        }, 100);

        // WS
        this.initWebSocket();

        // Listeners
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('click', this.handleWindowClick);
        window.addEventListener('mousemove', this.handleMapDragMove);
        window.addEventListener('mouseup', this.handleMapDragEnd);

        window.addEventListener('mousemove', this.handleMovementDragMove);
        window.addEventListener('mouseup', this.handleMovementDragEnd);

        // Keyboard
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        if (this.terminal) this.terminal.dispose();
        if (this.wsManager) this.wsManager.close();
        if (this.creeperSseClient) this.creeperSseClient.stop();
        if (this.mapTerminal) {
            this.mapTerminal.dispose();
            this.mapTerminal = null;
        }

        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('click', this.handleWindowClick);
        window.removeEventListener('mousemove', this.handleMapDragMove);
        window.removeEventListener('mouseup', this.handleMapDragEnd);

        window.removeEventListener('mousemove', this.handleMovementDragMove);
        window.removeEventListener('mouseup', this.handleMovementDragEnd);

        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
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

                this.apiClient = new BonenetApiClient('https://xterm.bonenet.ai/api', token);

                // seed
                this.apiClient.seedEvents();

                // SSE
                if (!this.creeperSseClient) {
                    this.creeperSseClient = new BonenetSSEClient(
                        'https://xterm.bonenet.ai/api/events',
                        token
                    );
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

    private handleCreeperEvent = (event: CreeperEvent) => {
        if (event.creeperEventType === 'DRAW_MAP') {
            try {
                const parsed = JSON.parse(event.payload);
                if (parsed && parsed.map) {
                    this.setState({ mapText: parsed.map }, () => {
                        if (this.state.showMap) {
                            this.drawMap(parsed.map);
                        }
                    });
                }
            } catch (error) {
                console.error('Error parsing DRAW_MAP payload:', error);
            }
        }
    };

    // ----------------------
    // Movement
    // ----------------------
    private moveNorth = () => {
        this.apiClient?.move('north');
    };
    private moveSouth = () => {
        this.apiClient?.move('south');
    };
    private moveWest = () => {
        this.apiClient?.move('west');
    };
    private moveEast = () => {
        this.apiClient?.move('east');
    };
    private moveUp = () => {
        this.apiClient?.move('up');
    };
    private moveDown = () => {
        this.apiClient?.move('down');
    };

    private openEnterPrompt = () => {
        this.setState({
            enterPromptOpen: true,
            enterPromptValue: '',
        });
    };

    private closeEnterPrompt = () => {
        this.setState({
            enterPromptOpen: false,
            enterPromptValue: '',
        });
    };

    private confirmEnterPrompt = () => {
        const loc = this.state.enterPromptValue.trim();
        if (loc.length > 0) {
            this.apiClient?.move(`enter ${loc}`);
        }
        this.closeEnterPrompt();
    };

    // Movement Window
    private startMovementDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            draggingMovement: true,
            movementDragOffsetX: e.clientX - this.state.movementWindowX,
            movementDragOffsetY: e.clientY - this.state.movementWindowY,
        });
    };

    private handleMovementDragMove = (e: MouseEvent) => {
        if (!this.state.draggingMovement) return;
        e.preventDefault();

        const newX = e.clientX - this.state.movementDragOffsetX;
        const newY = e.clientY - this.state.movementDragOffsetY;
        this.setState({ movementWindowX: newX, movementWindowY: newY });
    };

    private handleMovementDragEnd = () => {
        if (this.state.draggingMovement) {
            this.setState({ draggingMovement: false });
        }
    };

    private toggleMovementWindow = () => {
        if (this.state.movementWindowOpen) {
            this.setState({
                movementWindowOpen: false,
                arrowUpPressed: false,
                arrowDownPressed: false,
                arrowLeftPressed: false,
                arrowRightPressed: false,
                enterPromptOpen: false,
                enterPromptValue: '',
                bindKeys: false,
            });
        } else {
            this.setState({ movementWindowOpen: true });
        }
    };

    private closeMovementWindow = () => {
        this.setState({
            movementWindowOpen: false,
            arrowUpPressed: false,
            arrowDownPressed: false,
            arrowLeftPressed: false,
            arrowRightPressed: false,
            enterPromptOpen: false,
            enterPromptValue: '',
            bindKeys: false,
        });
    };

    // Keyboard
    private handleKeyDown = (e: KeyboardEvent) => {
        // Only intercept if window is open + bindKeys is true
        if (!this.state.movementWindowOpen || !this.state.bindKeys) return;

        const { key } = e;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'u', 'U', 'd', 'D', 'e', 'E'].includes(key)) {
            e.preventDefault();
        }

        switch (key) {
            case 'ArrowUp':
                if (!this.state.arrowUpPressed) {
                    this.setState({ arrowUpPressed: true });
                    this.moveNorth();
                }
                break;
            case 'ArrowDown':
                if (!this.state.arrowDownPressed) {
                    this.setState({ arrowDownPressed: true });
                    this.moveSouth();
                }
                break;
            case 'ArrowLeft':
                if (!this.state.arrowLeftPressed) {
                    this.setState({ arrowLeftPressed: true });
                    this.moveWest();
                }
                break;
            case 'ArrowRight':
                if (!this.state.arrowRightPressed) {
                    this.setState({ arrowRightPressed: true });
                    this.moveEast();
                }
                break;
            case 'u':
            case 'U':
                this.moveUp();
                break;
            case 'd':
            case 'D':
                this.moveDown();
                break;
            case 'e':
            case 'E':
                if (!this.state.enterPromptOpen) {
                    this.openEnterPrompt();
                }
                break;
        }
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        if (!this.state.movementWindowOpen || !this.state.bindKeys) return;
        switch (e.key) {
            case 'ArrowUp':
                this.setState({ arrowUpPressed: false });
                break;
            case 'ArrowDown':
                this.setState({ arrowDownPressed: false });
                break;
            case 'ArrowLeft':
                this.setState({ arrowLeftPressed: false });
                break;
            case 'ArrowRight':
                this.setState({ arrowRightPressed: false });
                break;
        }
    };

    // ----------------------
    // Map
    // ----------------------
    private drawMap(mapString: string) {
        if (!this.mapTerminal) return;

        const finalMap = this.formatMapForXterm(mapString);
        const rawLines = finalMap.replace(/\r/g, '').split('\n');
        const FIXED_ROWS = 10;
        const FIXED_COLS = 30;

        const processedLines: string[] = [];
        for (let i = 0; i < FIXED_ROWS; i++) {
            let line = i < rawLines.length ? rawLines[i] : '';
            const visibleLength = this.stripAnsi(line).length;

            if (visibleLength > FIXED_COLS) {
                line = this.truncateAnsi(line, FIXED_COLS);
            } else {
                line += '\x1b[0m' + ' '.repeat(FIXED_COLS - visibleLength);
            }
            processedLines.push(line);
        }

        this.mapTerminal.resize(FIXED_COLS, FIXED_ROWS);
        this.mapTerminal.clear();
        this.mapTerminal.write(processedLines.join('\r\n'));
        this.updateMapContainerSize(FIXED_ROWS, FIXED_COLS);
    }

    private stripAnsi(str: string): string {
        return str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
    }

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
        return mapString
            .replace(/\\u001B/g, '\u001B')
            .replace(/\\r/g, '\r')
            .replace(/\\n/g, '\n');
    }

    // ----------------------
    // Terminal Output
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
    // UI Handlers
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

    private handleWindowResize = () => {
        if (this.fitAddon) {
            this.fitAddon.fit();
        }
        this.repositionMapWindow();
    };

    private handleWindowClick = () => {
        // If the user clicks outside, we close the theme menu if open
        if (this.state.showThemeMenu) {
            this.setState({ showThemeMenu: false });
        }

        // If prompt is open, don't focus the input
        if (!this.state.enterPromptOpen) {
            this.terminalInputRef.current?.focusInput();
        }
    };

    // map drag
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
        this.setState({ mapWindowX: newX, mapWindowY: newY });
    };

    private handleMapDragEnd = () => {
        if (this.state.draggingMap) {
            this.setState({ draggingMap: false });
        }
    };

    private repositionMapWindow() {
        if (!this.state.showMap) return;
        const container = this.mapTerminalRef.current?.parentElement;
        if (!container) return;

        const mapWidth = container.offsetWidth;
        const mapHeight = container.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let { mapWindowX, mapWindowY } = this.state;
        const margin = 10;

        if (mapWindowX + mapWidth > windowWidth) {
            mapWindowX = windowWidth - mapWidth - margin;
        }
        if (mapWindowX < margin) {
            mapWindowX = margin;
        }
        if (mapWindowY + mapHeight > windowHeight) {
            mapWindowY = windowHeight - mapHeight - margin;
        }
        if (mapWindowY < margin) {
            mapWindowY = margin;
        }

        if (mapWindowX !== this.state.mapWindowX || mapWindowY !== this.state.mapWindowY) {
            this.setState({ mapWindowX, mapWindowY });
        }
    }

    private ensureMapTerminal() {
        if (this.mapTerminal || !this.mapTerminalRef.current) return;
        const currentTheme = allThemes[this.state.themeIndex].xterm;
        this.mapTerminal = new Terminal({
            theme: {
                background: currentTheme.background,
                foreground: currentTheme.foreground,
            },
            scrollback: 0,
            cursorBlink: false,
            disableStdin: true,
            allowTransparency: true,
        });

        this.mapTerminal.open(this.mapTerminalRef.current);
    }

    private disposeMapTerminal() {
        if (this.mapTerminal) {
            this.mapTerminal.dispose();
            this.mapTerminal = null;
        }
    }

    componentDidUpdate(prevProps: {}, prevState: BonenetClientState) {
        if (!prevState.showMap && this.state.showMap) {
            this.ensureMapTerminal();
            if (this.mapTerminal) {
                if (this.state.mapText) {
                    this.drawMap(this.state.mapText);
                } else {
                    this.mapTerminal.resize(30, 10);
                    this.mapTerminal.clear();
                    setTimeout(() => {
                        this.updateMapContainerSize(10, 30);
                    }, 30);
                }
            }
            this.writeToTerminal(
                "\r\nBONENET HELP: Your map window is now visible. To hide the in-game map, use the command 'set auto_map 0'.\r\n",
                true
            );
        }
        if (prevState.showMap && !this.state.showMap) {
            this.disposeMapTerminal();
        }
    }

    // ----------------------
    // Theme Menu Methods
    // ----------------------
    private handleThemeButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // so it doesn't trigger handleWindowClick
        this.setState((prev) => ({ showThemeMenu: !prev.showThemeMenu }));
    };

    private handleSelectTheme = (index: number) => {
        this.setState({ themeIndex: index, showThemeMenu: false }, () => {
            // Update xterm theme
            if (this.terminal) {
                const newXtermTheme = allThemes[this.state.themeIndex].xterm;
                this.terminal.setOption('theme', {
                    background: newXtermTheme.background,
                    foreground: newXtermTheme.foreground,
                });
            }
            // Update map terminal if open
            if (this.mapTerminal) {
                const newXtermTheme = allThemes[this.state.themeIndex].xterm;
                this.mapTerminal.setOption('theme', {
                    background: newXtermTheme.background,
                    foreground: newXtermTheme.foreground,
                });
            }
        });
    };

    // ----------------------
    // Render
    // ----------------------
    render() {
        const currentTheme = allThemes[this.state.themeIndex];
        const {
            isConnected,
            toastMessage,
            showMap,
            mapWindowX,
            mapWindowY,

            movementWindowOpen,
            movementWindowX,
            movementWindowY,
            bindKeys,

            arrowUpPressed,
            arrowDownPressed,
            arrowLeftPressed,
            arrowRightPressed,

            enterPromptOpen,
            enterPromptValue,

            showThemeMenu,
        } = this.state;

        return (
            <ThemeProvider theme={currentTheme}>
                <BonenetContainer>
                    <BonenetMouseEffect colors={currentTheme.trailColors} />

                    <Header>
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
                        </div>

                        <div className="right-section">
                            <ToggleButton onClick={this.toggleMap} active={showMap}>
                                [ MAP ]
                            </ToggleButton>

                            <ToggleButton onClick={this.toggleMovementWindow} active={movementWindowOpen}>
                                [ MOVE ]
                            </ToggleButton>

                            <ToggleButton onClick={this.handleThemeButtonClick} active={showThemeMenu}>
                                [ THEME ]
                            </ToggleButton>

                            {/* If showThemeMenu, display the theme list */}
                            {showThemeMenu && (
                                <ThemeMenuContainer>
                                    {allThemes.map((theme, idx) => (
                                        <ThemeItem
                                            key={theme.name + idx}
                                            onClick={() => this.handleSelectTheme(idx)}
                                            selected={idx === this.state.themeIndex}
                                        >
                                            {theme.name}
                                            <ThemeColorSwatch
                                                style={{ backgroundColor: theme.foreground }}
                                            />
                                        </ThemeItem>
                                    ))}
                                </ThemeMenuContainer>
                            )}

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

                    {/* MAP WINDOW */}
                    <MapContainer visible={showMap} x={mapWindowX} y={mapWindowY}>
                        <MapTitleBar onMouseDown={this.handleMapDragStart}>
                            <MapCloseButton
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={this.handleCloseMap}
                            >
                                ✖
                            </MapCloseButton>
                            <MapTitle>MAP</MapTitle>
                        </MapTitleBar>
                        <div ref={this.mapTerminalRef} style={{ width: '100%', height: 'calc(100% - 24px)' }} />
                    </MapContainer>

                    {/* MOVEMENT WINDOW */}
                    <MovementContainer visible={movementWindowOpen} x={movementWindowX} y={movementWindowY}>
                        <MovementTitleBar onMouseDown={this.startMovementDrag}>
                            <MovementCloseButton onClick={this.closeMovementWindow}>✖</MovementCloseButton>
                            <MovementTitle>MOVEMENT</MovementTitle>
                        </MovementTitleBar>
                        <MovementContent>
                            {/* Bind */}
                            <BindContainer>
                                <input
                                    type="checkbox"
                                    checked={bindKeys}
                                    onChange={(e) => this.setState({ bindKeys: e.target.checked })}
                                />
                                <span>bind</span>
                            </BindContainer>

                            {/* Arrow keys in a typical layout */}
                            <ArrowRow>
                                <MovementButton style={{ visibility: 'hidden' }}>X</MovementButton>
                                <MovementButton active={arrowUpPressed} onClick={this.moveNorth}>
                                    ↑
                                </MovementButton>
                                <MovementButton style={{ visibility: 'hidden' }}>X</MovementButton>
                            </ArrowRow>
                            <ArrowRow>
                                <MovementButton active={arrowLeftPressed} onClick={this.moveWest}>
                                    ←
                                </MovementButton>
                                <MovementButton style={{ visibility: 'hidden' }}>X</MovementButton>
                                <MovementButton active={arrowRightPressed} onClick={this.moveEast}>
                                    →
                                </MovementButton>
                            </ArrowRow>
                            <ArrowRow>
                                <MovementButton style={{ visibility: 'hidden' }}>X</MovementButton>
                                <MovementButton active={arrowDownPressed} onClick={this.moveSouth}>
                                    ↓
                                </MovementButton>
                                <MovementButton style={{ visibility: 'hidden' }}>X</MovementButton>
                            </ArrowRow>

                            {/* Row for U, D, E */}
                            <ArrowRow>
                                <MovementButton onClick={this.moveUp}>U</MovementButton>
                                <MovementButton onClick={this.moveDown}>D</MovementButton>
                                <MovementButton onClick={this.openEnterPrompt}>E</MovementButton>
                            </ArrowRow>
                        </MovementContent>
                    </MovementContainer>

                    {/* ENTER PROMPT */}
                    {enterPromptOpen && (
                        <EnterPromptOverlay>
                            <EnterPromptBox>
                                <EnterPromptTitle>Which room do you wish to enter?</EnterPromptTitle>
                                <EnterPromptInput
                                    value={enterPromptValue}
                                    onChange={(e) => this.setState({ enterPromptValue: e.target.value })}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            this.confirmEnterPrompt();
                                        }
                                    }}
                                />
                                <PromptButtonsRow>
                                    <PromptButton onClick={this.confirmEnterPrompt}>OK</PromptButton>
                                    <PromptButton onClick={this.closeEnterPrompt}>Cancel</PromptButton>
                                </PromptButtonsRow>
                            </EnterPromptBox>
                        </EnterPromptOverlay>
                    )}
                </BonenetContainer>
            </ThemeProvider>
        );
    }
}