import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface MobileMenuProps {
  isOpen: boolean;
}

export const MobileMenu = styled.div<MobileMenuProps>`
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: ${theme.colors.surface};
  padding: ${theme.spacing.md};
  transform: translateY(${props => props.isOpen ? '0' : '-100%'});
  transition: transform ${theme.transitions.normal};
  z-index: 99;
  border-bottom: 1px solid ${theme.colors.border};

  @media (min-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`; 