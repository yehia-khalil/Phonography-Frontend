import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { globalStyles } from "../../styles/global";
import Card from "../../components/shared/card";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../@env";
import SolidButton from "../../components/shared/SolidButton";
import jwt_decode from "jwt-decode";
import Spinner from "react-native-loading-spinner-overlay";


export default function CompetitionDetails({ route, navigation }) {
  const [competitors, setCompetitors] = useState(null);
  const [isJoined, setIsJoined] = useState();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState(false);


  const userToken = route.params.userToken;

    const pressHandler = (competitors) => {
        navigation.navigate('Competitors', competitors);
    }
    const joinHandler = async () => {
        try {
            const res = await fetch(`${API_URL}/competition/${route.params._id}/competitor/join`, {
              headers: { 
                  "Content-Type": "application/json" ,
                  "Authorization": `Bearer ${userToken}`
              },
              method: "PUT",
            });
           
            const jsonRes = await res.json();
            if(jsonRes.Success){
                setIsJoined(true);
                setChanged(!changed);
                
            }
           // console.log("heey",isJoined)
           // console.log(jsonRes);
            return jsonRes;
  
          } catch (error) {
              console.log(error)
            return error;
          }
  };
  const disjoinHandler = async () => {
    try {
      const res = await fetch(`${API_URL}/competition/${route.params._id}/competitor/remove`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        method: "PUT",
      });

      const jsonRes = await res.json();
      if (jsonRes.Success) {
        setIsJoined(false);
        setChanged(!changed)
        //   console.log(isJoined);
      }
      // console.log(jsonRes);
      return jsonRes;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
  useEffect(() => {
    const decodedToken = jwt_decode(userToken);
    const currentUser = decodedToken.userId;
    setCurrentUserId(currentUser);

    fetch(`${API_URL}/competition/${route.params._id}/competitors`)
          .then(res => {
              if(res.ok) {
                  return res.json()
              } else {
                  if (res.status === 404){
                      throw Error("Notfound")
                  }
              }
          })
          .then(data => {
              setCompetitors(data.data.competitors);
              if(currentUser){
                setLoading(false);
                data.data.competitors.forEach((competitor) => {

                    if(currentUser === competitor._id){
                        setIsJoined(true)
                    } else{
                        setIsJoined(false)
                    }
                });    
              }    
          })
          .catch(err => {
              console.log(err)
          })
  }, [changed]);

  return (
    <View style={globalStyles}>
      <Spinner visible={loading} />
      <Card>
        <Text style={{ ...globalStyles.titleText, ...styles.nameText }}>{route.params.name}</Text>
        <View style={styles.items}>
          <Text style={globalStyles.normalText}>Sponsor: </Text>
          <Text style={globalStyles.normalText}>{route.params.sponsor.name}</Text>
        </View>
        <View style={styles.items}>
          <Text style={globalStyles.normalText}>Prizes: </Text>
          <Text style={globalStyles.normalText}>{route.params.prizes}</Text>
        </View>
        <View style={{ ...styles.items, ...styles.date }}>
          <Text style={globalStyles.normalText}>From: {route.params.startDate}</Text>
          <Text style={globalStyles.normalText}>To: {route.params.endDate}</Text>
        </View>
        <View style={styles.items}>
                <Text style={globalStyles.normalText}>Competitors   </Text>
                <Ionicons name="people-outline" size={30} color="black"onPress={() => pressHandler(competitors)} />
        </View>
        {!isJoined ? (
          <View style={styles.items}>
            <SolidButton text="Join This Context" onPress={() => joinHandler()} />
          </View>
        ) : (
          <View style={styles.items}>
            <SolidButton text="Disjoin This Context" onPress={() => disjoinHandler()} />
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  nameText: {
    fontSize: 20,
    alignSelf: "center",
  },
  items: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  date: {
    justifyContent: "space-around",
  },
});
