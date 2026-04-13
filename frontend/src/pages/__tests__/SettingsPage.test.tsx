// React import removed
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsPage } from '../SettingsPage';
import { useTheme as _useTheme } from '../../context/ThemeContext';
const useTheme = _useTheme as any;

vi.mock('../../context/ThemeContext', () => ({
    useTheme: vi.fn()
}));

vi.stubGlobal('alert', vi.fn());

describe('SettingsPage', () => {
    let toggleMock;

    beforeEach(() => {
        toggleMock = vi.fn();
        useTheme.mockReturnValue({
            darkMode: true,
            toggleDarkMode: toggleMock
        });
        vi.clearAllMocks();
    });

    it('renders profile and system sections', () => {
        render(<SettingsPage />);
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByText('System Preferences')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    });

    it('renders in light mode', () => {
        useTheme.mockReturnValue({
            darkMode: false,
            toggleDarkMode: vi.fn()
        });
        render(<SettingsPage />);
        expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('toggles appearance', () => {
        render(<SettingsPage />);
        const themeBtn = screen.getByText('Dark');
        fireEvent.click(themeBtn);
        expect(toggleMock).toHaveBeenCalled();
    });

    it('toggles checkboxes', () => {
        render(<SettingsPage />);
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBe(2);
        
        checkboxes.forEach(cb => {
            expect((cb as any).checked).toBe(true);
            fireEvent.click(cb);
            expect((cb as any).checked).toBe(false);
        });
    });

    it('handles save', () => {
        render(<SettingsPage />);
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);
        expect(global.alert).toHaveBeenCalledWith('Settings saved successfully!');
    });
});
