import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import { sounds } from './sound';

export const playSound = async (soundFile, currentSound, setSound, setIsPlaying, playbackSpeed) => {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
    }

    if (!sounds || !sounds[soundFile]) {
      return; 
    }

    const soundSource = sounds[soundFile];
    const { sound: newSound } = await Audio.Sound.createAsync(
      soundSource,
      { rate: playbackSpeed }
    );
    setSound(newSound);
    await newSound.playAsync();
    setIsPlaying(true);
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
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