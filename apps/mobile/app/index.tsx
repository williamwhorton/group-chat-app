import { View, Text, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { APP_NAME } from '@treehouse/shared-utils'

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {APP_NAME}</Text>
      <Text style={styles.subtitle}>Mobile App (Scaffold)</Text>
      
      <View style={styles.linkContainer}>
        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>Go to Login</Text>
        </Link>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>
          This is a scaffolded Expo app with Expo Router.
        </Text>
        <Text style={styles.infoText}>
          It's connected to the shared packages in the monorepo.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  linkContainer: {
    marginVertical: 20,
  },
  link: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
})
