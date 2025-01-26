import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface GridProps {
  columns?: number | string;
  gap?: keyof typeof theme.spacing;
  autoFit?: boolean;
  minWidth?: string;
}

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${props => 
    props.autoFit
      ? `repeat(auto-fit, minmax(${props.minWidth || '280px'}, 1fr))`
      : props.columns
      ? typeof props.columns === 'number'
        ? `repeat(${props.columns}, 1fr)`
        : props.columns
      : '1fr'
  };
  gap: ${props => theme.spacing[props.gap || 'md']};

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`; 