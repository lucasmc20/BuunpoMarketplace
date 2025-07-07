import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, BackHandler, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

// Configuração das URLs
const PRODUCTION_URL = 'https://buunpo.com/';
const DEVELOPMENT_URL = 'https://sandbox.buunpsgpsystem.com.br/';

// Altere para false em produção
const IS_DEVELOPMENT = __DEV__;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // URL baseada no ambiente
  const webViewUrl = IS_DEVELOPMENT ? DEVELOPMENT_URL : PRODUCTION_URL;
//#f14a3e
  // Solicita permissões ao iniciar o app
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Solicita permissão para notificações
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus === 'granted') {
        console.log('Permissão de notificações concedida');
      }

      // Solicita permissão para câmera
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus === 'granted') {
        console.log('Permissão de câmera concedida');
      }

      // Solicita permissão para microfone
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      if (audioStatus === 'granted') {
        console.log('Permissão de microfone concedida');
      }

      setPermissionsGranted(true);
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      setPermissionsGranted(true); // Continua mesmo se houver erro
    }
  };

  // Manipula o botão voltar do Android
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  // Manipula o carregamento da página
  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  // Manipula mudanças no estado de navegação
  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  // Manipula erros de carregamento
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    
    Alert.alert(
      'Erro de Conexão',
      'Não foi possível carregar a página. Verifique sua conexão com a internet.',
      [
        { text: 'Tentar Novamente', onPress: () => webViewRef.current?.reload() },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsBackForwardNavigationGestures={true}
        pullToRefreshEnabled={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36 BuunpoApp/1.0.0"
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f14a3e',
    paddingTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: Constants.statusBarHeight,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});