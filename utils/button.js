import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import { sounds } from './sound';
import * as FileSystem from 'expo-file-system';

export const playSound = async (soundFile, currentSound, setSound, setIsPlaying, playbackSpeed) => {
  try {
    console.log('soundFile', soundFile);

    // Stop and unload current sound if playing
    if (currentSound) {
      await currentSound.unloadAsync();
    }

    let soundSource;

    // Check if soundFile is a local file URI (recorded sound)
    if (soundFile.startsWith('file://') || FileSystem.documentDirectory && soundFile.includes(FileSystem.documentDirectory)) {
      soundSource = { uri: soundFile };
    } else if (sounds && sounds[soundFile]) {
      soundSource = sounds[soundFile]; // Preloaded sound
    } else {
      console.warn('Unknown sound source:', soundFile);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      soundSource,
      { rate: playbackSpeed, shouldPlay: true }
    );

    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate(async status => {
      if (status.didJustFinish && !status.isLooping) {
        setIsPlaying(false);
        await newSound.unloadAsync();
      }
    });
    

  } catch (error) {
    console.error('Error playing sound:', error);
  }
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

  console.log('Added to study list:', drugName);
  drugName.status = "current";
}; 