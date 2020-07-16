import React, {useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import RNImageTools from 'react-native-image-tools-wm';
import {RNCamera} from 'react-native-camera';

import Mask from './src/assets/mask2.svg';

const App = () => {
  const camera = useRef(null);

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  const takePicture = async () => {
    if (camera.current) {
      const options = {quality: 0.5};
      const data = await camera.current.takePictureAsync(options);

      if (Platform.OS === 'android' && !(await hasAndroidPermission())) return;

      const maskImage = Image.resolveAssetSource(
        require('./src/assets/mask2.png'),
      ).uri;

      CameraRoll.save(data.uri)
        .then(() => {
          RNImageTools.mask(data.uri, maskImage, {
            trimTransparency: true,
          })
            .then(({uri}) => {
              CameraRoll.save(uri).then(() => {
                Alert.alert('Salvo na galeria');
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <>
      <View style={styles.cameraContainer}>
        <RNCamera
          ref={camera}
          style={styles.camera}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.auto}
          androidCameraPermissionOptions={{
            title: 'Permissão para usar a camera',
            message: 'Nós precisamos da sua permissão para usar a sua camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancelar',
          }}
          captureAudio={false}
        />
        <Mask width={'100%'} height={'80%'} fill={'black'} />

        <View style={styles.buttomContainer}>
          <TouchableOpacity onPress={takePicture} style={styles.button}>
            <Text style={{fontSize: 14}}>Capturar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  buttomContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'yellow',
  },
});

export default App;
