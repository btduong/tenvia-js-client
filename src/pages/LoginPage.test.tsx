import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockHandleLogin = vi.fn();

describe('LoginPage', () => {
  it('can render default view', () => {
    render(<LoginPage handleLogin={mockHandleLogin} />);

    expect(screen.getByText(/Enter a name to play/i)).toBeInTheDocument();

    const playButton = screen.getByRole('button', { name: /Play/i });
    expect(playButton).toBeInTheDocument();
    expect(playButton).toBeDisabled();
  });

  it('can handleLogin with typed username when click Play button', async () => {
    render(<LoginPage handleLogin={mockHandleLogin} />);

    expect(screen.getByText(/Enter a name to play/i)).toBeInTheDocument();

    const playButton = screen.getByRole('button', { name: /Play/i });
    expect(playButton).toBeInTheDocument();

    const inputField = screen.getByRole('textbox');
    await userEvent.type(inputField, 'alice');
    expect(playButton).toBeEnabled();

    await userEvent.click(playButton);
    expect(mockHandleLogin).toHaveBeenCalledTimes(1);
    expect(mockHandleLogin).toHaveBeenCalledWith('alice');
  });
});
