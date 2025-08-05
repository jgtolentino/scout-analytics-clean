/**
 * StoryModeToggle Component
 * Allows users to switch between Focus and Explore storytelling modes
 */

import React, { useState, useEffect } from 'react';
import { Switch } from '@radix-ui/themes';
import { Focus, Compass, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoryMode } from '../../contexts/StoryModeContext';
import * as Tooltip from '@radix-ui/react-tooltip';

export type StoryMode = 'focus' | 'explore';

interface StoryModeToggleProps {
  defaultMode?: StoryMode;
  onModeChange?: (mode: StoryMode) => void;
  showLabels?: boolean;
  showTooltip?: boolean;
  className?: string;
  position?: 'fixed' | 'relative';
}

export const StoryModeToggle: React.FC<StoryModeToggleProps> = ({
  defaultMode = 'explore',
  onModeChange,
  showLabels = true,
  showTooltip = true,
  className = '',
  position = 'relative'
}) => {
  const { mode, setMode } = useStoryMode();
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  // Handle mode changes
  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? 'focus' : 'explore';
    setMode(newMode);
    
    // Update body data attribute for CSS styling
    document.body.dataset.storyMode = newMode;
    
    // Save preference to localStorage
    localStorage.setItem('scout-story-mode', newMode);
    
    // Trigger callback
    onModeChange?.(newMode);
    
    // Log analytics event
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Story Mode Changed', {
        from: mode,
        to: newMode
      });
    }
  };

  // Initialize mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('scout-story-mode') as StoryMode;
    if (savedMode && (savedMode === 'focus' || savedMode === 'explore')) {
      setMode(savedMode);
      document.body.dataset.storyMode = savedMode;
    } else {
      setMode(defaultMode);
      document.body.dataset.storyMode = defaultMode;
    }
  }, [defaultMode, setMode]);

  const containerClasses = position === 'fixed' 
    ? 'fixed top-4 right-4 z-50' 
    : 'relative';

  const modeDescriptions = {
    focus: {
      title: 'Focus Mode',
      description: 'Shows only key insights and AI-generated narratives. Perfect for presentations and quick decision-making.',
      icon: <Focus size={20} />,
      benefits: [
        'Distraction-free viewing',
        'AI-powered summaries',
        'Executive-friendly layout',
        'Quick export to slides'
      ]
    },
    explore: {
      title: 'Explore Mode',
      description: 'Full interactive dashboard with all charts and detailed analytics. Ideal for deep analysis and discovery.',
      icon: <Compass size={20} />,
      benefits: [
        'All charts and metrics',
        'Interactive filtering',
        'Drill-down capabilities',
        'Raw data access'
      ]
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Mode Icons */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                opacity: mode === 'explore' ? 1 : 0.5,
                scale: mode === 'explore' ? 1 : 0.9
              }}
              className="text-blue-600"
            >
              <Compass size={20} />
            </motion.div>
            
            {/* Toggle Switch */}
            <Switch
              checked={mode === 'focus'}
              onCheckedChange={handleModeChange}
              className="data-[state=checked]:bg-purple-600"
            />
            
            <motion.div
              animate={{ 
                opacity: mode === 'focus' ? 1 : 0.5,
                scale: mode === 'focus' ? 1 : 0.9
              }}
              className="text-purple-600"
            >
              <Focus size={20} />
            </motion.div>
          </div>

          {/* Labels */}
          {showLabels && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {mode === 'focus' ? 'Focus Mode' : 'Explore Mode'}
              </span>
              <span className="text-xs text-gray-500">
                {mode === 'focus' ? 'Key insights only' : 'All data available'}
              </span>
            </div>
          )}

          {/* Info Button */}
          {showTooltip && (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setIsInfoVisible(!isInfoVisible)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs"
                    sideOffset={5}
                  >
                    Toggle between Focus and Explore modes to change how data is presented
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>

        {/* Expanded Info Panel */}
        <AnimatePresence>
          {isInfoVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(modeDescriptions).map(([key, info]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg ${
                        mode === key ? 'bg-gray-50 border-2 border-purple-200' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={mode === key ? 'text-purple-600' : 'text-gray-400'}>
                          {info.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">{info.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {info.benefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-gray-500 flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Transition Indicator */}
      <AnimatePresence>
        {mode === 'focus' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm"
          >
            <div className="flex items-center gap-2">
              <Focus size={14} />
              <span>Focus Mode Active - Showing key insights only</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact version for header integration
export const StoryModeToggleCompact: React.FC<Omit<StoryModeToggleProps, 'showLabels' | 'position'>> = (props) => {
  const { mode, setMode } = useStoryMode();
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
      <Compass size={16} className={mode === 'explore' ? 'text-blue-600' : 'text-gray-400'} />
      <Switch
        checked={mode === 'focus'}
        onCheckedChange={(checked) => {
          const newMode = checked ? 'focus' : 'explore';
          setMode(newMode);
          document.body.dataset.storyMode = newMode;
          props.onModeChange?.(newMode);
        }}
        className="data-[state=checked]:bg-purple-600"
        size="1"
      />
      <Focus size={16} className={mode === 'focus' ? 'text-purple-600' : 'text-gray-400'} />
    </div>
  );
};

// CSS helper for story mode styling
export const storyModeStyles = `
  /* Focus Mode Styles */
  [data-story-mode="focus"] .story-hide-in-focus {
    display: none !important;
  }
  
  [data-story-mode="focus"] .story-dim-in-focus {
    opacity: 0.3;
    pointer-events: none;
  }
  
  [data-story-mode="focus"] .story-emphasize-in-focus {
    transform: scale(1.05);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  /* Explore Mode Styles */
  [data-story-mode="explore"] .story-hide-in-explore {
    display: none !important;
  }
  
  [data-story-mode="explore"] .story-compact-in-explore {
    max-height: 200px;
    overflow: hidden;
  }
  
  /* Smooth transitions */
  .story-mode-transition {
    transition: all 0.3s ease-in-out;
  }
`;