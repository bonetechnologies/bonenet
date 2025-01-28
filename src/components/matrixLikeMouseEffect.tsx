import React from 'react';

interface MouseTrailProps {
  colors: string[];
}

const MatrixLikeMouseEffect: React.FC<MouseTrailProps> = ({ colors }) => {
  const matrixChars = '01▓░▒>+-$@%&#abcdefABCDEF';

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const charEl = document.createElement('span');
      // Use fixed positioning so the shapes do NOT expand the document
      charEl.style.position = 'fixed';
      // Position at the mouse pointer within the viewport
      charEl.style.left = `${e.clientX}px`;
      charEl.style.top = `${e.clientY}px`;
      charEl.style.pointerEvents = 'none';
      charEl.style.zIndex = '9999';

      // Random color from theme
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      charEl.style.color = randomColor;
      charEl.style.fontFamily = 'monospace';
      charEl.style.fontSize = `${Math.random() * 8 + 12}px`; // 12-20px
      charEl.style.userSelect = 'none';

      // Random "Matrix" character
      const randIndex = Math.floor(Math.random() * matrixChars.length);
      charEl.textContent = matrixChars.charAt(randIndex);

      // Animate it falling
      charEl.style.animation = 'matrixFall 1s linear forwards';

      document.body.appendChild(charEl);

      // Clean up after 1s
      setTimeout(() => charEl.remove(), 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [colors]);

  return null;
};

export default MatrixLikeMouseEffect;