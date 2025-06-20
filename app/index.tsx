import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, isLoading } = useAuth();

  // If loading, return null to show the splash screen
  if (isLoading) {
    return null;
  }

  // If user is authenticated, redirect to the tabs screen
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // If user is not authenticated, redirect to the welcome screen
  return <Redirect href="/welcome" />;
}