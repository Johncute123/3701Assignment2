import { Audio } from 'expo-av';
import { sounds } from './sound';
import * as FileSystem from 'expo-file-system';

export const playSound = (
  soundFile,
  currentSound,
  setSound,
  setIsPlaying,
  playbackSpeed
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (currentSound) await currentSound.unloadAsync();

      let source;
      if (soundFile.startsWith('file://')) {
        source = { uri: soundFile };
      } else if (sounds && sounds[soundFile]) {
        source = sounds[soundFile];
      } else {
        console.warn('Unknown sound source');
        return resolve();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: true,
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 100,
        }
      );

      setSound(newSound);
      setIsPlaying(true);

      const interval = setInterval(async () => {
        const status = await newSound.getStatusAsync();
        if (
          status.didJustFinish ||
          status.positionMillis >= status.durationMillis
        ) {
          clearInterval(interval);
          setIsPlaying(false);
          await newSound.unloadAsync();
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        console.warn('⚠️ Fallback timeout triggered');
        setIsPlaying(false);
        newSound.unloadAsync();
        resolve();
      }, 10000); 
    } catch (e) {
      reject(e);
    }
  });
};

export const stopSound = async (currentSound, setIsPlaying) => {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }
  } catch (error) {
    console.error('Error stopping sound:', error);
  }
};

export const handleSpeedSelect = (speed, setPlaybackSpeed, setShowSpeedDropdown, isPlaying, currentSound, soundFile, setSound, setIsPlaying) => {
  setPlaybackSpeed(speed);
  setShowSpeedDropdown(false);
  if (isPlaying) {
    stopSound(currentSound, setIsPlaying);
    playSound(soundFile, currentSound, setSound, setIsPlaying, speed);
  }
};

export const toggleSpeedDropdown = (setShowSpeedDropdown, showSpeedDropdown, setSelectedSound, soundItem) => {
  setSelectedSound(soundItem);
  setShowSpeedDropdown(!showSpeedDropdown);
};

export const getChevronIcon = (showSpeedDropdown) => {
  return showSpeedDropdown ? 'chevron-up' : 'chevron-down';
};

export const addToStudyList = (drugName) => {
  drugName.status = "current";
}; 