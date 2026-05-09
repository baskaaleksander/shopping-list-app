import { render, screen } from '@testing-library/react-native';

import App from '../App';
import { en } from '../src/localization/resources/en';

describe('App', () => {
  it('renders the bootstrap navigation shell', () => {
    render(<App />);

    expect(screen.getByText(en.auth.guestHint)).toBeTruthy();
    expect(screen.getAllByText(en.auth.signInAction).length).toBeGreaterThan(0);
  });
});
