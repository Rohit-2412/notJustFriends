import * as ImagePicker from "expo-image-picker";

import { Auth, DataStore, Storage } from "aws-amplify";
import {
    Button,
    Image,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { Entypo } from "@expo/vector-icons";
import { Post } from "../models";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// import {}

const user = {
    id: "u1",
    image: "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg",
    name: "Vadim Savin",
};

const CreatePostScreen = () => {
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);

    const navigation = useNavigation();

    const insets = useSafeAreaInsets();

    const onSubmit = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const newPost = {
            description,
            numberOfLikes: 0,
            numberOfShares: 0,
            postUserId: userData.attributes.sub,
            _version: 1,
        };

        if (image) {
            newPost.image = await uploadFile(image);
        }

        await DataStore.save(new Post(newPost));
        setDescription("");

        navigation.goBack();
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // console.log(result);

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    const uploadFile = async (fileUri) => {
        try {
            const response = await fetch(fileUri);
            const blob = await response.blob();
            const key = `${uuidv4()}.png`;
            await Storage.put(key, blob, {
                contentType: "image/png", // contentType is optional
            });
            return key;
        } catch (err) {
            console.log("Error uploading file:", err);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { marginBottom: insets.bottom }]}
            contentContainerStyle={{ flex: 1 }}
            keyboardVerticalOffset={150}
        >
            <View style={styles.header}>
                <Image
                    source={{ uri: user.image }}
                    style={styles.profileImage}
                />
                <Text style={styles.name}>{user.name}</Text>
                <Entypo
                    onPress={pickImage}
                    name="images"
                    size={24}
                    color="limegreen"
                    style={styles.icon}
                />
            </View>

            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What is on your mind?"
                multiline
            />

            {image && <Image source={{ uri: image }} style={styles.image} />}

            <View style={styles.buttonContainer}>
                <Button title="Post" onPress={onSubmit} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 10,
    },
    profileImage: {
        height: 40,
        width: 40,
        borderRadius: 30,
        marginRight: 10,
    },
    image: {
        width: "50%",
        aspectRatio: 4 / 3,
        alignSelf: "center",
    },
    name: {
        fontWeight: "500",
    },
    buttonContainer: {
        marginTop: "auto",
    },
    icon: {
        marginLeft: "auto",
    },
});

export default CreatePostScreen;
