import "react-native-get-random-values";

import * as ImagePicker from "expo-image-picker";

import { API, Auth, DataStore, Storage, graphqlOperation } from "aws-amplify";
import {
    Button,
    Image,
    KeyboardAvoidingView,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useEffect, useState } from "react";

import { User } from "../models";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

const dummy_img =
    "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/user.png";

const createUserQuery = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      createdAt
      updatedAt
      name
      image
      _version
      _lastChangedAt
      _deleted
    }
  }
`;

const UpdateProfileScreen = () => {
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState(null);
    const navigator = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await Auth.currentAuthenticatedUser();
            if (!userData) return;

            // fetch the user from backend
            const dbUser = await DataStore.query(User, userData.attributes.sub);

            if (!dbUser) {
                return;
            }

            setUser(dbUser);
            setName(dbUser.name);
        };

        fetchUser();
    }, []);

    const uploadFile = async (fileUri) => {
        try {
            const response = await fetch(fileUri);
            const blob = await response.blob();
            const key = `${uuidv4()}.png`;
            await Storage.put(key, blob, {
                contentType: "image/png",
            });
            return key;
        } catch (err) {
            console.log("Error uploading file:", err);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    const onSave = async () => {
        if (user) {
            // update
            await updateUser();
        } else {
            // create user
            await createUser();
        }

        navigator.goBack();
    };

    const createUser = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        // console.warn("Saving the user profile");
        const newUser = {
            id: userData.attributes.sub,
            name,
            _version: 1,
        };

        if (image) {
            newUser.image = await uploadFile(image);
        }

        await API.graphql(
            graphqlOperation(createUserQuery, {
                input: newUser,
            })
        );
    };

    const updateUser = async () => {
        let imageKey;
        if (image) {
            imageKey = await uploadFile(image);
        }

        await DataStore.save(
            User.copyOf(user, (updated) => {
                updated.name = name;
                if (imageKey) {
                    updated.image = imageKey;
                }
            })
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { marginBottom: insets.bottom }]}
            contentContainerStyle={{ flex: 1 }}
            keyboardVerticalOffset={150}
        >
            <Pressable onPress={pickImage} style={styles.imagePickerContainer}>
                <Image
                    source={{ uri: image || user?.image || dummy_img }}
                    style={styles.image}
                />
                <Text>Change photo</Text>
            </Pressable>

            <TextInput
                placeholder="Full name"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <View style={styles.buttonContainer}>
                <Button onPress={onSave} title="Save" disabled={!name} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        padding: 10,
    },
    imagePickerContainer: {
        alignItems: "center",
    },
    image: {
        width: "30%",
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 500,
    },
    input: {
        borderColor: "lightgrayVa",
        borderBottomWidth: StyleSheet.hairlineWidth,
        width: "100%",
        marginVertical: 10,
        padding: 10,
    },
    buttonContainer: {
        marginTop: "auto",
        marginBottom: 10,
        alignSelf: "stretch",
    },
});

export default UpdateProfileScreen;
