import { keyframes } from 'styled-components';

export const animations = {
  fadeIn: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  
  fadeInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  
  slideInRight: keyframes`
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  `,
  
  pulse: keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `,
  
  shimmer: keyframes`
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  `,
  
  neonPulse: keyframes`
    0% { text-shadow: 0 0 10px rgba(255, 77, 141, 0.5); }
    50% { text-shadow: 0 0 20px rgba(255, 77, 141, 0.8); }
    100% { text-shadow: 0 0 10px rgba(255, 77, 141, 0.5); }
  `,
  
  float: keyframes`
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
    100% { transform: translateY(0) rotate(0deg); }
  `
}; 