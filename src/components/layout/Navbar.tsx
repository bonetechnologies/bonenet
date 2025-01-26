import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { animations } from '../../styles/animations';

const Nav = styled.nav`
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.primary};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const NavLink = styled(Link)`
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  font-family: ${theme.typography.mono};
  transition: ${theme.effects.transition};
  position: relative;
  padding: 8px 16px;

  &:hover {
    color: ${theme.colors.text.primary};
    text-shadow: ${theme.colors.text.glow};
  }
`;

const ComingSoonBadge = styled.span`
  position: absolute;
  top: -10px;
  right: -10px;
  background: ${theme.colors.primary.main};
  color: ${theme.colors.text.primary};
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 12px;
  animation: ${animations.neonPulse} 2s infinite;
`;

const Logo = styled(Link)`
  font-family: ${theme.typography.display};
  color: ${theme.colors.text.primary};
  text-decoration: none;
  font-size: 1.5rem;
  margin-right: auto;
  animation: ${animations.neonPulse} 2s infinite;
`;

export const Navbar: React.FC = () => {
  return (
    <Nav>
      <NavLinks>
        <Logo to="/">BONECOIN</Logo>
        <NavLink to="/gallery">
          GALLERY
          <ComingSoonBadge>SOON</ComingSoonBadge>
        </NavLink>
        <NavLink to="/memes">
          MEMES
          <ComingSoonBadge>SOON</ComingSoonBadge>
        </NavLink>
        <NavLink to="/video">
          VIDEO
          <ComingSoonBadge>SOON</ComingSoonBadge>
        </NavLink>
      </NavLinks>
    </Nav>
  );
}; 