import { render } from '@testing-library/react';

import Icon from './icon';
import { Icons } from '../../types';

describe('Icon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Icon icon={Icons.BOARD_OUTLINE} width={0} height={0} />);
    expect(baseElement).toBeTruthy();
  });
});
