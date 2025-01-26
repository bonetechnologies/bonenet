import React from 'react';
import styled from 'styled-components';
import { animations } from '../../styles/animations';

const TransitionWrapper = styled.div`
  animation: ${animations.fadeIn} 0.3s ease;
`;

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TransitionWrapper>
    {children}
  </TransitionWrapper>
); 