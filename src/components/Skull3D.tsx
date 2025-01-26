import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { animations } from '../styles/animations';

const float = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 5px ${theme.colors.primary.main}); }
  50% { filter: drop-shadow(0 0 15px ${theme.colors.primary.main}); }
  100% { filter: drop-shadow(0 0 5px ${theme.colors.primary.main}); }
`;

const SkullContainer = styled.div`
  width: 200px;
  height: 200px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  animation: ${animations.float} 3s ease-in-out infinite;
`;

const SkullImage = styled.img<{ $isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transition: opacity 0.3s ease, transform 0.3s ease;
  animation: ${animations.glow} 2s ease-in-out infinite;
  transform-origin: center;
`;

interface Props {
  mousePosition: { x: number; y: number };
}

export const Skull3D: React.FC<Props> = ({ mousePosition }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const skull = e.currentTarget;
    const rect = skull.getBoundingClientRect();
    const x = (mousePosition.x - rect.left - rect.width / 2) / 20;
    const y = (mousePosition.y - rect.top - rect.height / 2) / 20;
    
    skull.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
  };

  return (
    <SkullContainer>
      <SkullImage 
        src="/assets/skull.png"
        alt="Floating Skull"
        onMouseMove={handleMouseMove}
        onLoad={() => setIsLoaded(true)}
        $isLoaded={isLoaded}
      />
    </SkullContainer>
  );
}; 