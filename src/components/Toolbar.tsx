import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Tool } from '../types/types';

const ToolbarContainer = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.background.elevated};
  flex-wrap: wrap;
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  
  @media (max-width: 768px) {
    top: 40px;
    height: 88px;
    padding: ${theme.spacing.xs} ${theme.spacing.xs} calc(${theme.spacing.xs} + 4px);
    gap: 6px;
    justify-content: space-evenly;
  }
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  background: ${theme.colors.background.tertiary};
  border-radius: 6px;
  border: 1px solid ${theme.colors.background.elevated};

  @media (max-width: 768px) {
    padding: 4px;
    gap: 4px;
    flex-shrink: 0;
  }
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? theme.colors.primary.main : theme.colors.background.secondary};
  border: 1px solid ${theme.colors.background.elevated};
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: ${props => props.$active ? theme.colors.text.inverse : theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 20px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary.main}40;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const ColorButton = styled.button<{ $color: string }>`
  width: 24px;
  height: 24px;
  border: 2px solid ${theme.colors.background.elevated};
  outline: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: ${props => props.$color};
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 22px;
    height: 22px;
  }
`;

const BrushSizeControl = styled.div`
  position: relative;
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  @media (max-width: 768px) {
    min-width: 60px;
  }

  input[type="range"] {
    width: 100%;
    height: 24px;
    
    @media (max-width: 768px) {
      height: 20px;
    }
  }
`;

const SizePreview = styled.div<{ $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  min-width: 8px;
  min-height: 8px;
  background: ${theme.colors.text.primary};
  border-radius: 50%;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ColorPickerPopup = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 8px;
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.background.elevated};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: ${props => props.$show ? 'block' : 'none'};
  z-index: 1000;
`;

const ColorInput = styled.input`
  width: 150px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  outline: 1px solid rgba(255, 255, 255, 0.2);

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const ConfirmButton = styled.button`
  background: ${theme.colors.primary.main};
  color: ${theme.colors.text.inverse};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${theme.colors.primary.dark};
  }
`;

const TOOLS = [
  { id: 'brush', icon: '🖌️', label: 'Brush' },
  { id: 'line', icon: '/', label: 'Line' },
  { id: 'spray', icon: '🎨', label: 'Spray' },
  { id: 'fill', icon: '🪣', label: 'Fill' },
  { id: 'eraser', icon: '⌫', label: 'Eraser' }
];

const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
];

export const Toolbar: React.FC = () => {
  const { 
    currentTool, 
    setCurrentTool,
    currentColor,
    setCurrentColor,
    brushSize,
    setBrushSize,
    canUndo,
    canRedo,
    undo,
    redo
  } = useCanvasContext();

  const colorInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [tempColor, setTempColor] = useState(currentColor);
  const [wetPaintState, setWetPaintState] = useState({
    pigmentMix: [0.25, 0.25, 0.25, 0.25],
    wetness: 0.8
  });

  const handleSave = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Create a new canvas with white background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original canvas content
    ctx.drawImage(canvas, 0, 0);

    // Convert to PNG and download
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handleColorPickerClick = () => {
    setTempColor(currentColor);
    setShowColorPicker(!showColorPicker);
  };

  const handleConfirmColor = () => {
    setCurrentColor(tempColor);
    setShowColorPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ToolbarContainer>
      <ToolGroup>
        {TOOLS.map(tool => (
          <ToolButton
            key={tool.id}
            $active={currentTool === tool.id}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </ToolButton>
        ))}
      </ToolGroup>

      <ToolGroup>
        {COLORS.map(color => (
          <ColorButton
            key={color}
            $color={color}
            onClick={() => setCurrentColor(color)}
            title={color}
          />
        ))}
        <ColorPickerWrapper ref={colorPickerRef}>
          <ColorButton
            $color={currentColor}
            onClick={handleColorPickerClick}
            title="Custom Color"
          />
          <ColorPickerPopup $show={showColorPicker}>
            <ColorInput
              type="color"
              value={currentColor}
              onChange={e => setCurrentColor(e.target.value)}
            />
          </ColorPickerPopup>
        </ColorPickerWrapper>
      </ToolGroup>

      <ToolGroup>
        <BrushSizeControl>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={e => setBrushSize(parseInt(e.target.value))}
          />
          <SizePreview $size={brushSize} />
        </BrushSizeControl>
      </ToolGroup>

      <ToolGroup>
        <ToolButton
          onClick={handleSave}
          title="Save PNG"
        >
          💾
        </ToolButton>
        <ToolButton
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          ↩️
        </ToolButton>
        <ToolButton
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          ↪️
        </ToolButton>
      </ToolGroup>

      <ToolButton
        onClick={() => setCurrentTool('wetbrush')}
        $active={currentTool === 'wetbrush'}
        title="Wet Brush"
      >
        🖌️
      </ToolButton>
      
      {currentTool === 'wetbrush' && (
        <WetBrushControls
          wetness={wetPaintState.wetness}
          onChange={setWetPaintState}
        />
      )}
    </ToolbarContainer>
  );
}; 