import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LectureLens app', () => {
  render(<App />);
  const elements = screen.getAllByText(/LectureLens/i);
  expect(elements.length).toBeGreaterThan(0);
});
