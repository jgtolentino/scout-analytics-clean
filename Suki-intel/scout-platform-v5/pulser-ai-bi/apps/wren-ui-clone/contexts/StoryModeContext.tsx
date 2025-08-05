/**
 * StoryModeContext
 * Manages the global story mode state (focus vs explore)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type StoryMode = 'focus' | 'explore';

interface StoryModeContextValue {
  mode: StoryMode;
  setMode: (mode: StoryMode) => void;
  toggleMode: () => void;
  isFocusMode: boolean;
  isExploreMode: boolean;
}

const StoryModeContext = createContext<StoryModeContextValue | undefined>(undefined);

interface StoryModeProviderProps {
  children: ReactNode;
  defaultMode?: StoryMode;
  onModeChange?: (mode: StoryMode) => void;
}

export const StoryModeProvider: React.FC<StoryModeProviderProps> = ({
  children,
  defaultMode = 'explore',
  onModeChange
}) => {
  const [mode, setModeState] = useState<StoryMode>(defaultMode);

  // Initialize from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('scout-story-mode') as StoryMode;
    if (savedMode && (savedMode === 'focus' || savedMode === 'explore')) {
      setModeState(savedMode);
      document.body.dataset.storyMode = savedMode;
    }
  }, []);

  const setMode = (newMode: StoryMode) => {
    setModeState(newMode);
    document.body.dataset.storyMode = newMode;
    localStorage.setItem('scout-story-mode', newMode);
    onModeChange?.(newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'focus' ? 'explore' : 'focus');
  };

  const value: StoryModeContextValue = {
    mode,
    setMode,
    toggleMode,
    isFocusMode: mode === 'focus',
    isExploreMode: mode === 'explore'
  };

  return (
    <StoryModeContext.Provider value={value}>
      {children}
    </StoryModeContext.Provider>
  );
};

export const useStoryMode = (): StoryModeContextValue => {
  const context = useContext(StoryModeContext);
  if (!context) {
    throw new Error('useStoryMode must be used within a StoryModeProvider');
  }
  return context;
};

// Helper hook for conditional rendering based on story mode
export const useStoryModeVisibility = (visibilityConfig: {
  showInFocus?: boolean;
  showInExplore?: boolean;
  dimInFocus?: boolean;
  emphasizeInFocus?: boolean;
}) => {
  const { mode } = useStoryMode();
  
  const {
    showInFocus = true,
    showInExplore = true,
    dimInFocus = false,
    emphasizeInFocus = false
  } = visibilityConfig;

  const isVisible = (mode === 'focus' && showInFocus) || (mode === 'explore' && showInExplore);
  
  const className = [
    !showInFocus && 'story-hide-in-focus',
    !showInExplore && 'story-hide-in-explore',
    dimInFocus && 'story-dim-in-focus',
    emphasizeInFocus && 'story-emphasize-in-focus',
    'story-mode-transition'
  ].filter(Boolean).join(' ');

  return { isVisible, className };
};