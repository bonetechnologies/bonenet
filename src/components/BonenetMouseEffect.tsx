import React from 'react';

interface MouseTrailProps {
  colors: string[];
}

const BonenetMouseEffect: React.FC<MouseTrailProps> = ({ colors }) => {
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

      // Random color from globalTheme
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      charEl.style.color = randomColor;
      charEl.style.fontFamily = 'monospace';
      // Smaller font size => 10–15px
      charEl.style.fontSize = `${Math.floor(Math.random() * 6 + 10)}px`;
      charEl.style.userSelect = 'none';

      // Random "Matrix" character
      const randIndex = Math.floor(Math.random() * matrixChars.length);
      charEl.textContent = matrixChars.charAt(randIndex);

      // Shortened animation to 0.5s
      charEl.style.animation = 'matrixFall 0.5s linear forwards';

      document.body.appendChild(charEl);

      // Clean up after 0.5s
      setTimeout(() => charEl.remove(), 500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [colors]);

  return null;
};

export default BonenetMouseEffect;