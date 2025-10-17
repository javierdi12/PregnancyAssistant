import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';

export const useWelcome = () => {
  const router = useRouter();  // Initialize the router to handle navigation between screens
  const navigation = useNavigation();
  const [showMessage, setShowMessage] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleGetStarted = () => {
    setShowMessage(true);// Display the temporary message
    setTimeout(() => {
      setShowMessage(false);// Hide the message after 2 seconds
      router.replace('/(tabs)');
    }, 2000);
  };

  return {
    showMessage,
    handleGetStarted,
  };
};