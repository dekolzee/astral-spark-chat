
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const colorPresets = [
    {
      name: 'Cyber Purple',
      colors: {
        primary: '263 70% 50%',
        secondary: '180 62% 55%',
        accent: '315 100% 75%',
      }
    },
    {
      name: 'Neon Green',
      colors: {
        primary: '120 100% 50%',
        secondary: '180 100% 50%',
        accent: '60 100% 50%',
      }
    },
    {
      name: 'Electric Blue',
      colors: {
        primary: '210 100% 56%',
        secondary: '195 100% 50%',
        accent: '225 100% 70%',
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary: '25 100% 50%',
        secondary: '45 100% 50%',
        accent: '10 100% 60%',
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="neumorphic border-cyber-purple/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-cyber text-gradient">
              Theme Customization
            </CardTitle>
            <CardDescription>
              Personalize your chat experience with custom colors and fonts
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Theme Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme.mode === 'dark' ? 'default' : 'outline'}
                  onClick={() => updateTheme({ mode: 'dark' })}
                  className="flex-1"
                >
                  Dark
                </Button>
                <Button
                  variant={theme.mode === 'light' ? 'default' : 'outline'}
                  onClick={() => updateTheme({ mode: 'light' })}
                  className="flex-1"
                >
                  Light
                </Button>
              </div>
            </div>

            <Separator />

            {/* Font Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Font Style</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme.font === 'inter' ? 'default' : 'outline'}
                  onClick={() => updateTheme({ font: 'inter' })}
                  className="flex-1 font-sans"
                >
                  Inter
                </Button>
                <Button
                  variant={theme.font === 'cyber' ? 'default' : 'outline'}
                  onClick={() => updateTheme({ font: 'cyber' })}
                  className="flex-1 font-cyber"
                >
                  Orbitron
                </Button>
              </div>
            </div>

            <Separator />

            {/* Color Presets */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Color Presets</Label>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset, index) => (
                  <motion.button
                    key={preset.name}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateTheme({ colors: { ...theme.colors, ...preset.colors } })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ background: `hsl(${preset.colors.primary})` }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ background: `hsl(${preset.colors.secondary})` }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ background: `hsl(${preset.colors.accent})` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{preset.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetTheme}
                className="flex-1"
              >
                Reset to Default
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 gradient-primary hover:opacity-90"
              >
                Apply Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ThemeSettings;
