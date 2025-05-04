import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { drugData, drugCategory } from '../resources/resource.js'
import {
  playSound,
  stopSound,
  handleSpeedSelect,
  toggleSpeedDropdown,
  getChevronIcon
} from '../utils/button'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateStatus,
  removeFromLearningList
} from '../src/features/learningList/learningListSlice'
import { addRecording, getRecordings } from '../src/features/audio/audioSlice'
import { getEnforcing } from 'react-native/Libraries/TurboModule/TurboModuleRegistry.js'
import { getLearningList } from '../src/features/learningList/learningListSlice'

const speed_options = [0.25, 0.33, 0.75, 1.0]

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
  const handlePlayPress = () => {
    if (isPlaying) {
      stopSound(sound, setIsPlaying)
    } else {
      setSelectedSound(soundItem)
      playSound(
        soundItem.file ? soundItem.file : soundItem.recordingUri,
        sound,
        setSound,
        setIsPlaying,
        playbackSpeed,
        () => {},
        setSelectedSound
      )
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
            name={soundItem.gender === 'female' ? 'female' : soundItem.gender === 'male' ? 'male' : 'user'}
            size={24}
            color='#2196F3'
          />
        </View>
        <Text style={styles.pronunciationText}>
          {soundItem.gender === 'female' ? 'Female' : soundItem.gender === 'male' ? 'Male' : 'User'}
        </Text>
      </View>

      <View style={styles.labelControls}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
          <Ionicons
            name={isPlaying && selectedSound === soundItem ? 'pause' : 'play'}
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

export default function LearningDetailScreen ({ route, navigation }) {
  const { categoryId } = route.params
  const learningList = useSelector(state => state.learningList.items)
  const audio = useSelector(state => state.audio.recordings)
  const item = learningList.find(i => i.id === categoryId)
  const drug = item ? drugData.find(d => d.id === item.drugId) : null
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSound, setSelectedSound] = useState(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false)
  const [sound, setSound] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [filteredAudio, setFilteredAudio] = useState()
  const dispatch = useDispatch()

  useEffect(() => {
    if(drug) {
    const filteredAudioData = audio.filter(item => item.drugId == drug.id)
    setFilteredAudio(filteredAudioData)
    }
  }, [audio])


  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync()
      }
    }
  }, [recording])

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(recording)
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording')
      console.error('Failed to start recording', err)
    }
  }

  const stopRecording = async () => {
    try {
      if (!recording) return

      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)

      if (drug) {
        dispatch(
          addRecording({
            drugId: drug.id,
            drugName: drug.name,
            recordingUri: uri,
            timestamp: new Date().toISOString()
          })
        )
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording')
      console.error('Failed to stop recording', err)
    }
  }

  const handleRecordPressIn = async () => {
    setIsRecording(true)
    await startRecording()
  }

  const handleRecordPressOut = async () => {
    setIsRecording(false)
    await stopRecording()
  }

  if (!item || !drug) {
    return (
      <View style={styles.container}>
        <Text>Not found.</Text>
      </View>
    )
  }

  const handleRemove = () => {
    const updateLearningList = learningList.filter(i => i.id !== item.id)
    dispatch(getLearningList(updateLearningList))
    const updateRecording = audio.filter(item => item.drugId !== drug.id)
    dispatch(getRecordings(updateRecording))
    navigation.goBack()
  }

  const handleFinish = () => {
    dispatch(updateStatus({ id: item.id, status: 'finished' }))
    navigation.goBack()
  }

  const handleReview = () => {
    dispatch(updateStatus({ id: item.id, status: 'current' }))
    navigation.goBack()
  }

  return (
    <ScrollView style={styles.container}>
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
</View>
      <View style={styles.section}>
        <Text style={styles.title}>{drug.name}</Text>
        {drug.other_names.length > 0 && (
          <Text style={styles.subtitle}>
            Also known as: {drug.other_names.join(', ')}
          </Text>
        )}
        <Text style={styles.text}>{drug.molecular_formula}</Text>
        <Text style={styles.text}>
          Categories:{' '}
          {drug.categories
            .map(
              categoryId => drugCategory[categoryId]?.name || 'Unknown Category'
            )
            .join(', ')}
        </Text>
        <Text style={styles.text}>{drug.desc}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pronunciation</Text>
        {filteredAudio && filteredAudio.map((soundItem, index) => (
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

      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPressIn={handleRecordPressIn}
          onPressOut={handleRecordPressOut}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Recording...' : 'Hold to Record'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={item.status === 'finished' ? handleReview : handleFinish}
        >
          <Text style={styles.actionButtonText}>
            {item.status === 'finished' ? 'REVIEW' : 'FINISH'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Text style={styles.actionButtonText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  statusButtonContainer: {
    padding: 20,
    alignItems: 'center'
  },
  statusButton: {
    backgroundColor: '#FFA726',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8
  },
  removeButton: {
    backgroundColor: '#FF5252',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginBottom: 16
  },

  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e57373',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },

  recordButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  recordingButton: {
    backgroundColor: '#ff5252'
  }
})
