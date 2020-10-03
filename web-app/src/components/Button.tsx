import styled from "styled-components";
import { lighten, darken } from "polished";

const Button = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.textWhite};
  font-family: ${props => props.theme.font};
  font-size: ${props => props.theme.fontSizes.medium};
  padding: 1em;
  border: none;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${props => darken(.05, props.theme.colors.secondary)};
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  }

  &:active {
    background-color: ${props => darken(.08, props.theme.colors.secondary)};
    transform: translateY(2px);
  }

  &:disabled {
    background-color: ${props => lighten(.12, props.theme.colors.secondary)};
    cursor: default;
    box-shadow: unset;
  }
`;

export default Button;