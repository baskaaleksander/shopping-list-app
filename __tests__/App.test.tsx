import { render, screen } from '@testing-library/react-native';

import App from '../App';
import { appStrings } from '../src/localization/messages';

describe('App', () => {
  it('renders the bootstrap navigation shell', () => {
    render(<App />);

    expect(screen.getByText(appStrings.shell.title)).toBeTruthy();
    expect(screen.getByText(appStrings.shell.statusMessage)).toBeTruthy();
  });
});
