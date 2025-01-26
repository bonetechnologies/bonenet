import React, { useEffect } from 'react';
import styled from 'styled-components';

const CursorShape = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  pointer-events: none;
  animation: fade-out 0.3s forwards ease-out;
  z-index: 9999;

  @keyframes fade-out {
    0% {
      transform: scale(1);
      opacity: 1;
      box-shadow: 0 0 10px #00ff99, 0 0 20px #00ff99; /* Hacker green glow */
    }
    50% {
      transform: scale(1.2);
      opacity: 0.6;
      box-shadow: 0 0 15px #00cc88, 0 0 30px #00cc88; /* Subtle color shift */
    }
    100% {
      transform: scale(2); /* Larger scaling for fading out */
      opacity: 0;
      box-shadow: 0 0 5px #009966, 0 0 10px #009966; /* Fading glow */
    }
  }
`;

const randomFromArray = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const MouseTrail: React.FC = () => {
  useEffect(() => {
    const colors = ['#00ff99', '#00cc88', '#009966']; // Vibrant hacker greens
    const shapes = ['50%', '0%', 'polygon(50% 0%, 0% 100%, 100% 100%)']; // Circle, square, and triangle

    const handleMouseMove = (e: MouseEvent) => {
      const shape = document.createElement('div');
      shape.style.position = 'absolute';
      shape.style.width = `${Math.random() * 12 + 8}px`; // Random size between 8px and 20px
      shape.style.height = shape.style.width; // Keep it square
      shape.style.pointerEvents = 'none';
      shape.style.top = `${e.pageY}px`;
      shape.style.left = `${e.pageX}px`;
      shape.style.borderRadius = randomFromArray(shapes); // Dynamic shape
      shape.style.backgroundColor = randomFromArray(colors); // Dynamic color
      shape.style.animation = 'fade-out 0.3s forwards ease-out';
      shape.style.zIndex = '9999';
      document.body.appendChild(shape);

      setTimeout(() => {
        shape.remove();
      }, 300); // Matches animation duration
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null;
};

export default MouseTrail;