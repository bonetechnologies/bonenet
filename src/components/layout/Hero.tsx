import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const HeroContainer = styled.section`
  min-height: 10vh; /* Full viewport height */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 80px 40px; /* Ensure enough space at the top and sides */
  box-sizing: border-box; /* Include padding in height calculation */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${theme.colors.background.primary};
    background-image: radial-gradient(
      circle at 50% 50%,
      ${theme.colors.primary.main}15 0%,
      transparent 50%
    );
    z-index: 0;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
`;

const Title = styled.h1`
  font-family: ${theme.typography.fontFamily.display};
  font-size: ${theme.typography.size.display1};
  font-weight: ${theme.typography.weight.bold};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${theme.spacing.md};
  margin-top: 0; /* Remove default top margin */

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.size.display2};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.size.lg};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.sm};
`;

const WorkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
`;

export const Hero: React.FC = () => {
  return (
    <HeroContainer>
      <Content>
        <Title>Transforming Ideas into Digital Art</Title>
        <Subtitle>Your journey starts here.</Subtitle>
      </Content>
    </HeroContainer>
  );
};