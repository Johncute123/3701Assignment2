import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { drugData, drugCategory } from '../resources/resource.js'
import {
  playSound,
  stopSound,
  handleSpeedSelect,
  toggleSpeedDropdown,
  getChevronIcon,
  addToStudyList
} from '../utils/button'
import { useDispatch, useSelector } from 'react-redux'
import { addToLearningList } from '../src/features/learningList/learningListSlice'
import { getRecordings } from '../src/features/audio/audioSlice.js'

const speed_options = [0.25, 0.33, 0.75, 1.0]

const CategoryChip = ({ categoryId }) => (
  <View style={styles.categoryChip}>
    <Text style={styles.categoryText}>
      {drugCategory[categoryId]?.name || 'Unknown Category'}
    </Text>
  </View>
)

const SpeedOption = ({ speed, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[styles.speedOption, isSelected && styles.speedOptionActive]}
    onPress={onSelect}
  >
    <Text
      style={[
        styles.speedOptionText,
        isSelected && styles.speedOptionTextActive
      ]}
    >
      {speed}
    </Text>
  </TouchableOpacity>
)

const PronunciationLabel = ({
  soundItem,
  isPlaying,
  selectedSound,
  playbackSpeed,
  showSpeedDropdown,
  sound,
  setSelectedSound,
  setShowSpeedDropdown,
  setIsPlaying,
  setSound,
  setPlaybackSpeed
}) => {
  const handlePlayPress = async () => {
    setSelectedSound(soundItem)
    if (isPlaying) {
      stopSound(sound, setIsPlaying)
    } else {
      await playSound(
        soundItem.file,
        sound,
        setSound,
        setIsPlaying,
        playbackSpeed
      )
      console.log('✅ Finished playing:', soundItem.file)
    }
  }

  const handleSpeedOptionPress = speed => {
    handleSpeedSelect(
      speed,
      setPlaybackSpeed,
      setShowSpeedDropdown,
      isPlaying,
      sound,
      soundItem.file,
      setSound,
      setIsPlaying
    )
  }

  return (
    <View style={styles.pronunciationLabel}>
      <View style={styles.labelHeader}>
        <View style={styles.genderIconContainer}>
          <Ionicons
            name={soundItem.gender === 'female' ? 'female' : 'male'}
            size={24}
            color='#2196F3'
          />
        </View>
        <Text style={styles.pronunciationText}>
          {soundItem.gender === 'female' ? 'Female' : 'Male'}
        </Text>
      </View>

      <View style={styles.labelControls}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
          <Ionicons
            name={
              isPlaying && selectedSound === soundItem
                ? 'volume-high-outline'
                : 'volume-high'
            }
            size={24}
            color='#fff'
          />
        </TouchableOpacity>

        <View style={styles.speedDropdownContainer}>
          <TouchableOpacity
            style={styles.speedDropdown}
            onPress={() =>
              toggleSpeedDropdown(
                setShowSpeedDropdown,
                showSpeedDropdown,
                setSelectedSound,
                soundItem
              )
            }
          >
            <Text style={styles.speedDropdownText}>{playbackSpeed}x</Text>
            <Ionicons
              name={getChevronIcon(showSpeedDropdown)}
              size={16}
              color='#000'
            />
          </TouchableOpacity>
          {showSpeedDropdown && selectedSound === soundItem && (
            <View style={styles.speedOptions}>
              {speed_options.map(speed => (
                <SpeedOption
                  key={speed}
                  speed={speed}
                  isSelected={playbackSpeed === speed}
                  onSelect={() => handleSpeedOptionPress(speed)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default function DrugDetailScreen ({ route }) {
  const { drugId } = route.params
  const drug = drugData.find(d => d.id === drugId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSound, setSelectedSound] = useState(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false)
  const [sound, setSound] = useState(null)
  const dispatch = useDispatch()
  const learningList = useSelector(state => state.learningList.items)
  const audio = useSelector(state => state.audio.recordings)

  const handleAddToLearningList = () => {
    const findAudio = audio.find(item => item.drugId === drug.id)
    if (!findAudio) {
      const newAudio = drug.sounds.map(item => ({
        drugId: drug.id,
        drugName: drug.name,
        file: item.file,
        gender: item.gender,
        recordingUri: undefined
      }))
      const addNewAudio = JSON.parse(JSON.stringify(audio)).concat(newAudio)

      dispatch(getRecordings(addNewAudio))
    }
    dispatch(
      addToLearningList({
        drugId: drug.id,
        name: drug.name,
        category: drug.category,
        pronunciations: drug.pronunciations
      })
    )
  }

  const isInLearningList = learningList.some(item => item.drugId === drug.id)

  if (!drug) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>{drug.name}</Text>
        {drug.other_names.length > 0 && (
          <Text style={styles.subtitle}>
            Also known as: {drug.other_names.join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.text}>{drug.desc}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Molecular Formula</Text>
        <Text style={styles.text}>{drug.molecular_formula}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {drug.categories.map(categoryId => (
            <CategoryChip key={categoryId} categoryId={categoryId} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pronunciation</Text>
        {drug.sounds.map((soundItem, index) => (
          <PronunciationLabel
            key={index}
            soundItem={soundItem}
            isPlaying={isPlaying}
            selectedSound={selectedSound}
            playbackSpeed={playbackSpeed}
            showSpeedDropdown={showSpeedDropdown}
            sound={sound}
            setSelectedSound={setSelectedSound}
            setShowSpeedDropdown={setShowSpeedDropdown}
            setIsPlaying={setIsPlaying}
            setSound={setSound}
            setPlaybackSpeed={setPlaybackSpeed}
          />
        ))}
      </View>

      {!isInLearningList && (
        <View style={styles.studyButtonContainer}>
          <TouchableOpacity
            style={[
              styles.studyButton,
              isInLearningList && styles.studyButtonActive
            ]}
            onPress={handleAddToLearningList}
            disabled={isInLearningList}
          >
            <Text
              style={[
                styles.studyButtonText,
                isInLearningList && styles.studyButtonTextActive
              ]}
            >
              Study
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000'
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  categoryText: {
    color: '#1976D2',
    fontSize: 14
  },
  pronunciationLabel: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  labelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  genderIconContainer: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 20,
    marginRight: 12
  },
  pronunciationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  labelControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  playButton: {
    backgroundColor: '#2196F3',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  speedDropdownContainer: {
    position: 'relative'
  },
  speedDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  speedDropdownText: {
    color: '#666',
    marginRight: 4,
    fontSize: 14
  },
  speedOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
    zIndex: 1
  },
  speedOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  speedOptionActive: {
    backgroundColor: '#2196F3'
  },
  speedOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center'
  },
  speedOptionTextActive: {
    color: '#fff'
  },
  studyButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  studyButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  addButtonActive: {
    backgroundColor: '#2196F3'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
