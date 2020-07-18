import React from "react";
import { Button } from "react-native-elements";
import { withFirebaseHOC } from "../config/Firebase";
import { StatusBar } from "expo-status-bar";
import {
    Switch,
    StyleSheet,
    Text,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

function Home({ navigation, firebase }) {
    // firebase = firebase.firebase;
    const [refreshing, setRefreshing] = React.useState(false);
    const [mainText, setMainText] = React.useState("You're okay.\nStay safe.");
    const [
        isEnabledContactTracing,
        setIsEnabledContactTracing,
    ] = React.useState(false);
    const [
        isEnabledLocationTracking,
        setIsEnabledLocationTracking,
    ] = React.useState(false);
    const [picture, setPicture] = React.useState({});
    const [photoWarning, setPhotoWarning] = React.useState("green");

    const toggleSwitchLocationTracking = () =>
        setIsEnabledLocationTracking((previousState) => !previousState);
    const toggleSwitchContactTracing = () =>
        setIsEnabledContactTracing((previousState) => !previousState);

    async function handleSignout() {
        try {
            await firebase.signOut();
            navigation.navigate("Auth");
        } catch (error) {
            console.log(error);
        }
    }

    // async function getData() {
    //     let currentUser = firebase.firebase.auth().currentUser.uid;
    //     let obj = await firebase.firebase
    //         .firestore()
    //         .collection("UserDetails")
    //         .doc(currentUser)
    //         .get()
    //         .then((data) => {
    //             return data.data();
    //         });
    //     console.log();
    // }
    const checkPhoto = async () => {
        let currentUser = firebase.firebase.auth().currentUser.uid;
        firebase.firebase
            .firestore()
            .collection("UserDetails")
            .doc(currentUser)
            .get()
            .then((data) => {
                let diffdate =
                    new Date().getMinutes() -
                    new Date(data.data().PhotoDate.seconds * 1000).getMinutes();
                if (diffdate > 1) setPhotoWarning("red");
                console.log();
            });
    };

    const uploadPicture = async () => {
        // console.log(setField());
        console.log("Upload picture button pressed");

        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== "granted") {
            console.log("Camera permission denied");
        }

        let result = await ImagePicker.launchCameraAsync();
        if (result.cancelled) {
            console.log("No picture selected");
        }

        const response = await fetch(result.uri);
        const blob = await response.blob();
        let imageName = "TODO";

        var ref = firebase.firebase
            .storage()
            .ref()
            .child("images/" + firebase.getUserId());
        return ref
            .put(blob)
            .then((snapshot) => {
                return snapshot.ref.getDownloadURL(); // Will return a promise with the download link
            })
            .then((downloadURL) => {
                let currentUser = firebase.firebase.auth().currentUser.uid;
                firebase.firebase
                    .firestore()
                    .collection("UserDetails")
                    .doc(currentUser)
                    .update({
                        PhotoUrl: downloadURL,
                        PhotoDate: new Date(),
                    });
            })
            .catch((error) => {
                console.log(Failed to upload file and get link - ${error});
            });
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => setRefreshing(false));
    }, []);

    console.log("idk");

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                // refreshControl={
                //     <RefreshControl
                //         refreshing={refreshing}
                //         onRefresh={onRefresh}
                //     />
                // }
            >
                <Text style={styles.mainText}>{mainText}</Text>
                <View style={styles.toggleView}>
                    <Switch
                        style={styles.toggleInput}
                        trackColor={{ false: "grey", true: "grey" }}
                        thumbColor="white"
                        onValueChange={toggleSwitchContactTracing}
                        value={isEnabledContactTracing}
                    />
                    <Text style={styles.toggleText}>Contact Tracing</Text>
                </View>
                <View style={styles.toggleView}>
                    <Switch
                        style={styles.toggleInput}
                        trackColor={{ false: "grey", true: "grey" }}
                        thumbColor="white"
                        onValueChange={toggleSwitchLocationTracking}
                        value={isEnabledLocationTracking}
                    />
                    <Text style={styles.toggleText}>Location tracking</Text>
                </View>
                <View style={styles.toggleView}>
                    <Button
                        style="flex: 1"
                        onPress={uploadPicture}
                        title="UPLOAD"
                        color="grey"
                        disabled={false}
                    />
                    <Text style={styles.toggleText}>
                        Upload quarantine picture
                    </Text>
                </View>
                <View style={styles.toggleView}>
                    <Button
                        style="flex: 1"
                        onPress={checkPhoto}
                        title="Check Photo Status"
                        color={photoWarning}
                        disabled={false}
                    />
                    <Text style={styles.toggleText}>
                        Upload quarantine picture
                    </Text>
                </View>
                <View style={styles.container}>
                    <Text>Home</Text>
                    <Button
                        title="Signout"
                        onPress={handleSignout}
                        titleStyle={{
                            color: "#F57C00",
                        }}
                        type="clear"
                    />
                </View>
            </ScrollView>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
        backgroundColor: "green",
        alignItems: "center",
        justifyContent: "center",
    },
    mainText: {
        marginTop: 50,
        flex: 3,
        fontFamily: "sans-serif-medium",
        color: "white",
        fontSize: 60,
        padding: 20,
    },
    toggleView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    toggleInput: {
        flex: 1,
    },
    toggleText: {
        flex: 5,
        fontFamily: "sans-serif",
        fontSize: 20,
        color: "white",
    },
});

export default withFirebaseHOC(Home);