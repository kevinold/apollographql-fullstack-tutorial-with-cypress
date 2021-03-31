import styled, { keyframes} from 'react-emotion';
import { size } from 'polished';

import { ReactComponent as Logo } from '../assets/logo.svg';
import { colors } from '../styles';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Loading = styled(Logo)(size(64), {
  display: 'block',
  margin: 'auto',
  fill: colors.primary,
  path: {
    transformOrigin: 'center',
    animation: `${spin} 1s linear infinite`,
  },
});

Loading.defaultProps = {
  // @ts-ignore
  "data-testid": "apollo-loading"
}

export default Loading;
