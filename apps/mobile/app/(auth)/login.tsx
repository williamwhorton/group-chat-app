import { View, Text, StyleSheet } from 'react-native'
import { Link } from 'expo-router'

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.text}>
        Login screen will be implemented here.
      </Text>
      <Text style={styles.text}>
        This screen will use @treehouse/shared-supabase for authentication.
      </Text>
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkLabel}>Don't have an account? </Text>
        <Link href="/(auth)/sign-up">
          <Text style={styles.link}>Sign Up</Text>
        </Link>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  linkLabel: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
})
