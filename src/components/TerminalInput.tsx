import React from 'react';
import styled from 'styled-components';

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
    touch-action: manipulation;

    &:focus {
        border-color: ${(props) => props.theme.foreground};
    }

    @media (max-width: 768px) {
        padding: 8px;
        font-size: 0.9rem;
        border-radius: 4px;
    }
`;

interface TerminalInputProps {
    onSubmit: (command: string) => void;
}

interface TerminalInputState {
    commandHistory: string[];
    historyIndex: number;
    currentInput: string;
    isMobile: boolean;
}

export class TerminalInput extends React.Component<TerminalInputProps, TerminalInputState> {
    private inputRef = React.createRef<HTMLInputElement>();

    constructor(props: TerminalInputProps) {
        super(props);
        this.state = {
            commandHistory: [],
            historyIndex: -1,
            currentInput: '',
            isMobile: false
        };
    }

    componentDidMount() {
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
        
        // Only auto-focus on desktop
        if (!this.state.isMobile) {
            this.inputRef.current?.focus();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkMobile);
    }

    private checkMobile = () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile !== this.state.isMobile) {
            this.setState({ isMobile });
        }
    };

    // Public method to allow parent components to force focus
    public focusInput() {
        // Allow focus on mobile now
        this.inputRef.current?.focus();
    }

    // Add method to maintain focus
    public maintainFocus() {
        if (this.inputRef.current && document.activeElement !== this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { commandHistory, historyIndex, currentInput } = this.state;

        if (e.key === 'Enter') {
            e.preventDefault();
            const command = currentInput.trim();
            if (!command) return;

            // Notify parent of the new command
            this.props.onSubmit(command);

            // Update history and clear current input
            this.setState({
                commandHistory: [...commandHistory, command],
                historyIndex: -1,
                currentInput: '',
            }, () => {
                // Maintain focus after submitting
                this.focusInput();
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex === -1 && commandHistory.length > 0) {
                this.setState({
                    historyIndex: commandHistory.length - 1,
                    currentInput: commandHistory[commandHistory.length - 1],
                });
            } else if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                this.setState({
                    historyIndex: newIndex,
                    currentInput: commandHistory[newIndex],
                });
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                this.setState({
                    historyIndex: newIndex,
                    currentInput: commandHistory[newIndex],
                });
            } else {
                this.setState({
                    historyIndex: -1,
                    currentInput: '',
                });
            }
        }
    };

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ currentInput: e.target.value });
    };

    render() {
        const { isMobile } = this.state;

        return (
            <StyledInput
                ref={this.inputRef}
                autoFocus={!isMobile}
                type="text"
                value={this.state.currentInput}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                onBlur={() => {
                    // Small delay to allow other interactions
                    setTimeout(() => this.maintainFocus(), 100);
                }}
                placeholder="Enter command..."
            />
        );
    }
}