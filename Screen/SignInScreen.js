import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../src/features/auth/authSlice';
import { getLearningList } from '../src/features/learningList/learningListSlice';
import { getRecordings } from '../src/features/audio/audioSlice';

const SignInScreen = ({ switchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    console.log('Attempting to sign in...');
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Sign-in response received:', data);

      if (response.ok) {
        dispatch(setCredentials(data));
        console.log('Credentials set, fetching study record...');

        const studyRecordResponse = await fetch(`http://localhost:3000/study-record/${data.user.id}`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });
        
        console.log('Study record response status:', studyRecordResponse.status);

        if (studyRecordResponse.ok) {
          const studyRecord = await studyRecordResponse.json();
          console.log('Study record fetched:', studyRecord);
          
          let learningItems = [];
          try {
            console.log('Attempting to parse learning items:', studyRecord.items);
            if (typeof studyRecord.items === 'string' && studyRecord.items.trim() !== '') {
              learningItems = JSON.parse(studyRecord.items);
              console.log('Parsed learning items (from string):', learningItems);
            } else if (Array.isArray(studyRecord.items)) {
              learningItems = studyRecord.items;
               console.log('Learning items (already array):', learningItems);
            } else {
              console.log('Study record items field is not a string or array, initializing as empty.');
            }
            
            learningItems = learningItems.map(item => ({
              ...item,
              status: item.status || 'current',
              score: item.score || 0,
              recordings: Array.isArray(item.recordings) ? item.recordings : []
            }));
             console.log('Learning items after ensuring structure:', learningItems);

            dispatch(getLearningList(learningItems));
            console.log('Dispatched getLearningList with items.');

            const audioRecordings = learningItems
              .filter(item => Array.isArray(item.recordings) && item.recordings.length > 0)
              .flatMap(item => item.recordings)
              .filter(recording => recording.recordingUri);

            console.log('Extracted audio recordings for dispatch:', audioRecordings);

            if (audioRecordings.length > 0) {
              dispatch(getRecordings(audioRecordings));
               console.log('Dispatched getRecordings with extracted recordings.');
            } else {
               console.log('No audio recordings found to dispatch.');
            }

          } catch (e) {
            console.error('Error parsing or processing learning items:', e);
            learningItems = [];
          }
        } else {
           const errorText = await studyRecordResponse.text();
           console.error('Failed to fetch study record:', studyRecordResponse.status, errorText);
           Alert.alert('Error', `Failed to fetch study record: ${studyRecordResponse.status}`);
        }
        
        Alert.alert('Success', 'Sign in successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to sign in');
      }
    } catch (error) {
      console.error('Sign-in process caught an error:', error);
      Alert.alert('Error', 'Failed to connect to the server or process sign-in.');
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/drugspeak.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign in with your email and password</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Don't have an account? </Text>
        <TouchableOpacity onPress={switchToSignUp}>
          <Text style={styles.toggleLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  clearButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
    padding: 20,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleLink: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default SignInScreen;