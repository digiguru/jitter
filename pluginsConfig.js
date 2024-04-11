// Define available plugins with metadata
export const pluginsConfig = [
    {
      id: 'jitterImage',
      name: 'Jitter Effect',
      scriptPath: './jitterImage.js',
      defaultSettings: {}
    },
    {
      id: 'spectrogram',
      name: 'Spectrogram',
      scriptPath: './spectrogram.js',
      defaultSettings: { color: '#FF0000' }
    }
  ];
  