import { useContext } from 'react';
import { SettingsContext } from 'src/contexts/settings-context';

export const useSettings = () => useContext(SettingsContext);
