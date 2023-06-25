import "react-native-get-random-values";

import {
    AntDesign,
    Entypo,
    FontAwesome5,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { DataStore } from "aws-amplify";
import LikeImage from "../../assets/images/like.png";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../models";
import { useNavigation } from "@react-navigation/native";

const dummy_img =
    "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/user.png";

const FeedPost = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [user, setUser] = useState(null);

    function formatDate(date) {
        // return date and time in indian format
        const d = new Date(date).toString().split(" ");
        return `${d[1]} ${d[0]}, ${d[2]}`;
    }

    useEffect(() => {
        DataStore.query(User, post.postUserId).then(setUser);
    }, []);

    const navigation = useNavigation();
    return (
        <Pressable style={styles.post}>
            {/* Header */}
            <Pressable
                style={styles.header}
                onPress={() =>
                    navigation.navigate("Profile", { id: post.postUserId })
                }
            >
                {post.image ? (
                    <S3Image imgKey={user?.image} style={styles.profileImage} />
                ) : (
                    <Image
                        source={{ uri: dummy_img }}
                        style={styles.profileImage}
                    />
                )}
                <View>
                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.subtitle}>
                        {formatDate(post.createdAt)}
                    </Text>
                </View>
                <Entypo
                    name="dots-three-horizontal"
                    size={18}
                    color="gray"
                    style={styles.icon}
                />
            </Pressable>

            {/* Body */}
            {post.description && (
                <Text style={styles.description}>{post.description}</Text>
            )}

            {post.image && <S3Image imgKey={post.image} style={styles.image} />}

            {/* Footer */}
            <View style={styles.footer}>
                {/* Stats row */}
                <View style={styles.statsRow}>
                    <Image source={LikeImage} style={styles.likeIcon} />
                    <Text style={styles.likedBy}>
                        {post.numberOfLikes &&
                            `You and ${post.numberOfLikes - 1} others`}
                    </Text>
                    <Text style={styles.shares}>
                        {post.numberOfShares} shares
                    </Text>
                </View>
                {/* Buttons Row  */}
                <View style={styles.buttonsRow}>
                    <Pressable
                        onPress={() => setIsLiked(!isLiked)}
                        style={styles.iconButton}
                    >
                        <AntDesign
                            name="like2"
                            size={18}
                            color={isLiked ? "royalblue" : "gray"}
                        />
                        <Text
                            style={[
                                styles.iconButtonText,
                                { color: isLiked ? "royalblue" : "gray" },
                            ]}
                        >
                            Like
                        </Text>
                    </Pressable>

                    <View style={styles.iconButton}>
                        <FontAwesome5
                            name="comment-alt"
                            size={18}
                            color="gray"
                        />
                        <Text style={styles.iconButtonText}>Comment</Text>
                    </View>

                    <View style={styles.iconButton}>
                        <MaterialCommunityIcons
                            name="share-outline"
                            size={18}
                            color="gray"
                        />
                        <Text style={styles.iconButtonText}>Share</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    post: {
        marginVertical: 5,
        backgroundColor: "#fff",
    },
    // Header
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginRight: 10,
    },
    name: {
        fontWeight: "500",
    },
    subtitle: {
        color: "gray",
    },
    icon: {
        marginLeft: "auto",
    },

    // Body
    description: {
        paddingHorizontal: 10,
        lineHeight: 20,
        letterSpacing: 0.3,
    },
    image: {
        width: "100%",
        aspectRatio: 16 / 9,
        marginTop: 10,
        objFit: "cover",
    },

    // Footer
    footer: {
        paddingHorizontal: 10,
    },
    statsRow: {
        paddingVertical: 10,
        flexDirection: "row",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "lightgray",
    },
    likeIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    likedBy: {
        color: "gray",
    },
    shares: {
        marginLeft: "auto",
        color: "gray",
    },

    // Buttons row
    buttonsRow: {
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    iconButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButtonText: {
        marginLeft: 5,
        color: "gray",
        fontWeight: "500",
    },
});

export default FeedPost;
