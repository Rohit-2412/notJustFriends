import { Amplify } from "aws-amplify";
import Navigator from "./src/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import awsconfig from "./src/aws-exports";
import { withAuthenticator } from "aws-amplify-react-native";

Amplify.configure({ ...awsconfig, Analytics: { disabled: true } });

function App() {
    return (
        <SafeAreaProvider style={styles.container}>
            <Navigator />
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#c9c9c9",
    },
});

export default withAuthenticator(App);
