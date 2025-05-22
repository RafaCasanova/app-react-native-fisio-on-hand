import { HeaderShownContext } from "@react-navigation/elements";
import { Stack  } from "expo-router";

const LoginLayout = () => {
    return <Stack screenOptions={{headerShown: false}} />;
}

export default LoginLayout;