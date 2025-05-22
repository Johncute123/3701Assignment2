import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout, setCredentials } from '../src/features/auth/authSlice'
import { clearLearningList } from '../src/features/learningList/learningListSlice'
import { clearRecordings } from '../src/features/audio/audioSlice'
import SignInScreen from './SignInScreen'
import SignUpScreen from './SignUpScreen'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native'

const UserProfileScreen = () => {
  const user = useSelector(state => state.auth.user)
  const learningList = useSelector(state => state.learningList.items)
  const dispatch = useDispatch()
  const [showSignUp, setShowSignUp] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const currentLearning = learningList.filter(
    item => item.status === 'current'
  ).length
  const finished = learningList.filter(
    item => item.status === 'finished'
  ).length
  const totalScore = learningList.reduce(
    (sum, item) => sum + (item.score || 0),
    0
  )


  const handleUpdate = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty')
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }
    try {
      const updateBody = { username: newUsername }
      if (newPassword) updateBody.password = newPassword

      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updateBody),
      })
      const data = await response.json()
      if (response.ok) {
        dispatch(setCredentials({ ...user, username: newUsername }))
        Alert.alert('Success', 'Profile updated successfully')
        setModalVisible(false)
        setNewPassword('')
        setConfirmPassword('')
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server')
    }
  }

  const handleSignOut = () => {
    dispatch(logout())
    dispatch(clearLearningList())
    dispatch(clearRecordings())
  }

  if (!user) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        {showSignUp ? (
          <SignUpScreen switchToSignIn={() => setShowSignUp(false)} />
        ) : (
          <SignInScreen switchToSignUp={() => setShowSignUp(true)} />
        )}
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.title}>User Profile</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.username}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{user.gender}</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Learning Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentLearning}</Text>
              <Text style={styles.statLabel}>Current Learning</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{finished}</Text>
              <Text style={styles.statLabel}>Finished</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalScore}</Text>
              <Text style={styles.statLabel}>Total Score</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              setModalVisible(true)
              setNewUsername(user.username)
              setNewPassword('')
              setConfirmPassword('')
            }}
          >
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <TextInput
              style={styles.input}
              placeholder='New Username'
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <TextInput
              style={styles.input}
              placeholder='New Password (optional)'
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder='Confirm Password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileContainer: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center'
  },
  infoContainer: { marginBottom: 20 },
  label: { fontSize: 16, color: '#666', marginBottom: 5 },
  value: { fontSize: 18, color: '#333', fontWeight: '500' },
  statsContainer: {
    marginTop: 30,
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5
  },
  statLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center'
  },
  signOutButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalButton: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#6c757d', marginRight: 10 },
  confirmButton: { backgroundColor: '#2196F3', marginLeft: 10 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
})

export default UserProfileScreen
