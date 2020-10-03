import styled from "styled-components";
import { lighten } from 'polished'

const Input = styled.input`
  background-color: ${props => lighten(0.65, props.theme.colors.textDark)};
  border: none;
  height: 3.5em;
  border-radius: 10px;
  font-family: ${props => props.theme.font};
  font-size: ${props => props.theme.fontSizes.medium};
  padding: .8em;
  color: ${props => props.theme.colors.textDark};
  caret-color: ${props => props.theme.colors.textDark};
  transition: all 0.2s;

  ::placeholder,
  ::-webkit-input-placeholder {
    color: ${props => lighten(.2, props.theme.colors.textDark)};
  }
  :-ms-input-placeholder {
     color: ${props => lighten(.2, props.theme.colors.textDark)};
  }

  &:focus {
    outline: none;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  }
`;

export default Input;