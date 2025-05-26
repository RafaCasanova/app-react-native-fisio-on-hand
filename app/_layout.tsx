import { Header } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native"; // Import ActivityIndicator
import { LinearGradient } from "expo-linear-gradient";
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider and useAuth

const CustomHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#3498db', '#8e44ad']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Fisio On Hand</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const RootLayoutNav = () => {
  const { isLoading, token } = useAuth(); // Get isLoading and token from context

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        header: () => <CustomHeader />,
        headerStyle: { backgroundColor: "transparent" },
        contentStyle: { backgroundColor: "#f8f8f8" },
      }}
    />
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    height: 90,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  gradient: {
    flex: 1,
    width: "100%",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default RootLayout;
