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

import * as Location from 'expo-location';

function Home({ navigation, firebase }) {

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
    
    const startLocationTracking = async () => {
        console.log("Start location tracking button pressed")

        // get curr location
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
        }

        let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
        console.log(location.coords.latitude, location.coords.longitude)
        let round_latitude = (Math.trunc(location.coords.latitude * 10000))/10000
        let round_longitude = (Math.trunc(location.coords.longitude * 10000))/10000
        console.log(round_latitude, round_longitude)
        let curr_coords = round_latitude + ' ' + round_longitude

        // get home coordinates
        let currentUser = firebase.firebase.auth().currentUser.uid;
        let curr_user_data = await firebase.firebase
            .firestore()
            .collection("UserDetails")
            .doc(currentUser)
            .get()
        if(!curr_user_data.data()["isUnderObserVation"]) {
            return
        }
        // check if over
        if(curr_coords !== curr_user_data.data()["GPSCoordinates"]) {
            console.log("You are not in quarantine!");
            alert("You are not in quarantine! If you keep violating quarantine, you will e sent to institutional quarantine");
        }

        // increase violation

    }

    const startContactTracing = async () => {
        console.log("Start contact tracing button pressed")

        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
        }

        let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
        console.log(location.coords.latitude, location.coords.longitude)
        let round_latitude = (Math.trunc(location.coords.latitude * 10000))/10000
        let round_longitude = (Math.trunc(location.coords.longitude * 10000))/10000
        console.log(round_latitude, round_longitude)

        // get current date/time
        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        var hours = new Date().getHours(); //Current Hours
        var min = new Date().getMinutes(); //Current Minutes
        let datetime = year + '-' + month + '-' + date + '-' + hours + '-' + min
        console.log(datetime)

        // check if this lat, long exists in nearby time
        let doc_id = round_latitude + ' ' + round_longitude
        // let doc = await firebase.firestore
        //                         .collection("contact_tracing")
        //                         .doc(doc_id).get()
        let doc = await firebase.firebase
                .firestore()
                .collection("contact_tracing")
                .doc(doc_id)
                .get()

        if(!doc.exists) {
            console.log("No one has been near your location")
        } else {
            console.log("Someone ill was here at " + doc.data().datetime)
            const ill_datetime = doc.data().datetime.split('-')

            let isThreat = true
            if(year != parseInt(ill_datetime[0])) {
                isThreat = false
            }
            else if(month != parseInt(ill_datetime[1])) {
                isThreat = false
            }
            else if(date != parseInt(ill_datetime[2])) {
                isThreat = false
            }
            else if(hours < parseInt(ill_datetime[3]) - 1 || hours > parseInt(ill_datetime[3]) + 1) {
                isThreat = false
            }

            if(isThreat) {
                console.log("You have been in proximity of ill person")
                alert("You have been in proximity of ill person")
            } else {
                console.log("You are under no threat of disease")
            }
        }

        // insert this into table if curr_user is sick
        let currentUser = firebase.firebase.auth().currentUser.uid;
        let curr_user_data = await firebase.firebase
            .firestore()
            .collection("UserDetails")
            .doc(currentUser)
            .get()

        if(curr_user_data.data()["isUnderObserVation"] && curr_user_data.data()["GPSCoordinates"] !== doc_id) {
            // upload location to db
            firebase.firebase
                    .firestore()
                    .collection("contact_tracing")
                    .doc(doc_id)
                    .set({datetime: datetime})
            console.log("doc_id:", doc_id, "\ndatetime: ", datetime, " pushed to db because you are ill and not at home")
        } else {
            console.log("You're either not ill or are at home so your location is not pushed to db");
        }
        
    }

    async function handleSignout() {
        try {
            await firebase.signOut();
            navigation.navigate("Auth");
        } catch (error) {
            console.log(error);
        }
    }

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
                console.log("Failed to upload file and get link - ${error}");
            });
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => setRefreshing(false));
    }, []);

    console.log("idk");

    // getCurrentUserData();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: photoWarning,
                }}
            >
                <Text style={styles.mainText}>{mainText}</Text>
                <View style={styles.toggleView}>
                    {/* <Switch
                        style={styles.toggleInput}
                        trackColor={{ false: "grey", true: "grey" }}
                        thumbColor="white"
                        onValueChange={toggleSwitchContactTracing}
                        value={isEnabledContactTracing}
                    /> */}
                    <Button
                        style="flex: 1"
                        onPress={startContactTracing}
                        title="START"
                        color="grey"
                        disabled={false}
                    />
                    <Text style={styles.toggleText}>Contact Tracing</Text>
                </View>
                <View style={styles.toggleView}>
                <Button
                        style="flex: 1"
                        onPress={startLocationTracking}
                        title="START"
                        color="grey"
                        disabled={false}
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
        fontSize: 40,
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
