import React, {useState, useEffect, useSyncExternalStore} from 'react';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
//Import required component
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  FlatList,
  SafeAreaView,
  Image,
  PermissionsAndroid,
  TextInput
} from 'react-native';

//Import Call Detector
import CallDetectorManager from 'react-native-call-detection';
// import { TextInput } from 'react-native-paper';
const App = () => {
  //to keep callDetector reference
  var API_BASE_URL = 'https://b158-2409-4040-e01-7509-18aa-e6c2-1bae-7c50.ngrok.io';
  // var API_BASE_URL = 'http://localhost:5000'
  let callDetector = undefined;

  let [callStates, setCallStates] = useState([]);
  let [isStart, setIsStart] = useState(false);
  let [flatListItems, setFlatListItems] = useState([]);

  const trialSend = () => {
    const userinfo = {
      name: username,
      num: `+91${usernumber}`,
      latitude: latitude,
      longitude: longitude
    }
    const config = {
      method: 'POST',
      body: JSON.stringify(userinfo),
      contentType: 'application/json'
    };
    // fetch(`${API_BASE_URL}/userinfo`, config).then(reas => {console.log(reas);}).catch(err => {console.log(err);})
    fetch(`${API_BASE_URL}/userinfo`,
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(userinfo)
        }).then(reas => {console.log(reas);}).catch(err => {console.log(err);})
  }

  const callFriendTapped = () => {
    trialSend();
    Linking.openURL('tel:+19034965870').catch((err) => {
      console.log(err);
    });
  };
  // useEffect(() => {
  //   trialSend();
  // }, [])
  


  const startStopListener = () => {
    if (isStart) {
      console.log('Stop');
      callDetector && callDetector.dispose();
    } else {
      console.log('Start');
      callDetector = new CallDetectorManager(
        (event, phoneNumber) => {
          console.log(`${event} == ${phoneNumber}`);
          var updatedCallStates = callStates;
          updatedCallStates.push(
            event + (phoneNumber ? phoneNumber : phoneNumber)
          );
          setFlatListItems(updatedCallStates);
          setCallStates(updatedCallStates);
          console.log(flatListItems);

          // For iOS event will be either "Connected",
          // "Disconnected","Dialing" and "Incoming"

          // For Android event will be either "Offhook",
          // "Disconnected", "Incoming" or "Missed"
          // phoneNumber should store caller/called number

          if (event === 'Disconnected') {
            // Do something call got disconnected
          } else if (event === 'Connected') {
            // Do something call got connected
            console.log('number is chhh', phoneNumber);
            
            // This clause will only be executed for iOS
          } else if (event === 'Incoming') {
            // Do something call got incoming
            console.log('number is', phoneNumber);
          } else if (event === 'Dialing') {
            // Do something call got dialing
            // This clause will only be executed for iOS
            console.log('number is', phoneNumber);
          } else if (event === 'Offhook') {
            //Device call state: Off-hook.
            // At least one call exists that is dialing,
            // active, or on hold,
            // and no calls are ringing or waiting.
            // This clause will only be executed for Android
            console.log('number is hhh', phoneNumber);
            console.log('1st', typeof(phoneNumber));
            console.log('2nd', typeof('+19034965870'));
            if((phoneNumber) === ('+19034965870')){
              const userinfo = {
                name: username,
                num: usernumber,
                latitude: latitude,
                longitude: longitude
              }
              const config = {
                method: 'POST',
                body: JSON.stringify(userinfo),
                contentType: 'application/json'
              };
              fetch(`${API_BASE_URL}/userinfo`, config).then(reas => {console.log(reas);}).catch(err => {console.log(err);})
              // axios.post(`${API_BASE_URL}/userinfo`, userinfo).then(reas => {console.log(reas);}).catch(err => {console.log(err);})
            }
          } else if (event === 'Missed') {
            // Do something call got missed
            // This clause will only be executed for Android
            console.log('number is', phoneNumber);
          }
        },
        true, // To detect incoming calls [ANDROID]
        () => {
          // If your permission got denied [ANDROID]
          // Only if you want to read incoming number
          // Default: console.error
          console.log('Permission Denied by User');
        }, 
        {
          title: 'Phone State Permission',
          message:
            'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
        },
      );
    }
    setIsStart(!isStart);
  };

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#ebebeb'
        }} />
    );
  };
  useEffect(() => {
    getLocation();
    AsyncStorage.getItem('username').then((user) => {setUsername(user)});
    AsyncStorage.getItem('userphonenumber').then((phoneNumber) => {setUsernumber(phoneNumber)});
    // trialSend();
  }, [])
  
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [username, setUsername] = useState(null)
  const [usernumber, setUsernumber] = useState(null)

  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      console.log('res is:', res);
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            setLatitude(position.coords.latitude.toString());
            setLongitude(position.coords.longitude.toString());
            
    
            
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
            
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
  }
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('granted', granted);
      if (granted === 'granted') {
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text>Name</Text>
          

        </View> */}
        <TextInput
        placeholder={username? username: 'Enter Name'}
        onChangeText={(text) => {AsyncStorage.setItem("username", text)}}  
         />
        
         
        <TextInput
        onChangeText={(text) => {AsyncStorage.setItem("userphonenumber", text)}}  
        placeholder={usernumber? usernumber: 'Enter phone number'} />
        <TextInput
        placeholder={latitude?latitude: 'latitude'} />
        <TextInput
        placeholder={longitude? longitude: 'longitude'} />
        <FlatList
          style={{flex: 1}}
          data={flatListItems}
          ItemSeparatorComponent={listSeparator}
          renderItem={({item}) => (
            <View style={{flex: 1}}>
              <Text style={styles.callLogs}>
                {JSON.stringify(item)}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={startStopListener}>
          <Text style={styles.buttonText}>
            {isStart ? 'Stop Listner' : 'Start Listener'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={callFriendTapped}
          style={styles.fabStyle}>
          <Image
            source={{
              uri:
                'https://raw.githubusercontent.com/AboutReact/sampleresource/master/input_phone.png',
            }}
            style={styles.fabImageStyle}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    backgroundColor: '#ff8c21',
    padding: 10,
  },
  headerTextLarge: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
  },
  headerText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#ff8c21',
    padding: 10,
    justifyContent: 'center',
    height: 60,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  callLogs: {
    padding: 16,
    fontSize: 16,
    color: '#333333',
  },
  fabStyle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: 'yellow',
  },
  fabImageStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
});