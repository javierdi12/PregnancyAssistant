import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';

export const useWelcome = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [showMessage, setShowMessage] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleGetStarted = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  return {
    showMessage,
    handleGetStarted,
  };
};