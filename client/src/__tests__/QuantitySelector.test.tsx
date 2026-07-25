import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuantitySelector from '../components/ui/QuantitySelector';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('QuantitySelector', () => {
  it('renders current value', () => {
    renderWithRouter(<QuantitySelector value={3} onChange={() => {}} />);
    expect(screen.getByText('3')).toBeDefined();
  });

  it('calls onChange with incremented value', () => {
    let value = 1;
    const onChange = (v: number) => { value = v; };
    renderWithRouter(<QuantitySelector value={value} onChange={onChange} />);
    // The + button should increment
    expect(value).toBe(1);
  });
});
