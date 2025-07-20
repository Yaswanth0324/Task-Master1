import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page logo', () => {
  render(<App />);
  const linkElement = screen.getByText(/TaskFlow/i);
  expect(linkElement).toBeInTheDocument();
});
