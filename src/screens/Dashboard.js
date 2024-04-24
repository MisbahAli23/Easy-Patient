import React, { useState, useEffect } from 'react';
import { View, Text, RefreshControl, ScrollView, StyleSheet, ImageBackground, Image, PixelRatio, TouchableOpacity } from 'react-native';
import config from '../../config';
import profileIcon from '../assets/profile.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import FolderSlider from '../components/FolderSlider';
import BellAlarm from '../components/BellAlarm';
import goodHealth from '../assets/good-health.png';
import CrossAlarm from '../components/CrossAlarm';
import CrossBell from '../components/CrossBell';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../components/Footer';
import ImageLogo from '../components/ImageLogo'
import { BackHandler } from 'react-native';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import Snackbar from '../components/Snackbar';
import Medications from '../components/Medications';
const Dashboard = () => {
    const navigation = useNavigation();
    const [backPressed, setBackPressed] = useState(false);
    const route = useRoute();
    const [name, setName] = useState('');
    const [healthInfo, setHealthInfo] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [alarmComponents, setAlarmComponents] = useState([]);
    const [image, setImage] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const isFocused = useIsFocused();
    const [snackbarKey, setSnackbarKey] = useState(0);
    useEffect(() => {

        const fetchData = async () => {
            await getLoginResponse();

            await getMedicinesAndSupplements();
            // await renderAlarmComponents();
            renderTimeComponents();
        };
        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    useEffect(() => {
        const fetchData = async () => {
            await getLoginResponse();
            await getMedicinesAndSupplements();
            renderTimeComponents();
        };
        fetchData();
    }, [route]);



    const handleShowSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarKey((prevKey) => prevKey + 1);
    };

    const getLoginResponse = async () => {
        const loginResponse = await AsyncStorage.getItem('loginResponse');
        const responseObject = JSON.parse(loginResponse);
        setName(responseObject.user.full_name);
        const access_token = responseObject.access_token;
        setImage(responseObject.user.profile_pic);
        getHealthCheck(access_token);
    }

    const getHealthCheck = async (access_token) => {
        let config = {
            method: 'get',
            url: 'https://api-patient-dev.easy-health.app/patient/health-data',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        };
        await axios.request(config)
            .then((response) => {
                if (response.data.length > 0) {

                    setHealthInfo(true);
                    console.log("data found");
                } else {
                    console.log(`No data found for userId`);
                    setHealthInfo(false);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }



    const getMedicinesAndSupplements = async () => {
        try {
            const loginResponse = await AsyncStorage.getItem('loginResponse');
            const responseObject = JSON.parse(loginResponse);
            const access_token = responseObject.access_token;

            if (access_token) {
                const config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: 'https://api-patient-dev.easy-health.app/medicines',
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                };
                const response = await axios.request(config);
                setMedicines(response.data);

            }
        } catch (error) {
            console.error('Error retrieving medicines:', error);
        }
    }
    const renderTimeComponents = async () => {
        try {
            const allAlarmComponents = [];
            const AlarmsArray = JSON.parse(await AsyncStorage.getItem('Alarms'));
            if (AlarmsArray) {
                // Flatten all times for sorting
                const allTimes = AlarmsArray.reduce((acc, alarm) => {
                    return acc.concat(alarm.times.map((timeObj) => ({ ...timeObj, ...alarm })));
                }, []);

                // Sort all times
                allTimes.sort((a, b) => {
                    return moment(`${a.days[0]} ${a.time}`, 'YYYY-MM-DD HH:mm').diff(moment(`${b.days[0]} ${b.time}`, 'YYYY-MM-DD HH:mm'));
                });

                // Generate alarm components for sorted times
                allTimes.forEach((timeObj, index) => {
                    const { time, id: timeId, taken, medicine, id, dosage } = timeObj;
                    const alarmTime = moment(`${timeObj.days[0]} ${time}`, 'YYYY-MM-DD HH:mm');
                    const remainingTime = alarmTime.diff(moment(), 'minutes');

                    let alarmComponent;
                    // Check if this is the next upcoming alarm
                    if (remainingTime > 0 && !allTimes.some((otherTime) => moment(`${otherTime.days[0]} ${otherTime.time}`).isBetween(moment(), alarmTime))) {
                        alarmComponent = (
                            <CrossBell
                                remainingTime={remainingTime}
                                time={alarmTime.format('HH:mm')}
                                id={timeId}
                                dosage={dosage}
                                Medicine={medicine}
                                medicineId={id}
                                taken={taken}
                                reloadFunction={renderTimeComponents}
                            />
                        );
                    } else {
                        // Check if the alarm is in the past
                        if (alarmTime.isBefore(moment())) {
                            alarmComponent = (
                                <CrossAlarm
                                    time={alarmTime.format('HH:mm')}
                                    medicineId={id}
                                    id={timeId}
                                    Medicine={medicine}
                                    taken={taken}
                                    reloadFunction={renderTimeComponents}
                                />
                            );
                        } else {
                            // Default case: future alarm
                            alarmComponent = (
                                <BellAlarm
                                    time={alarmTime.format('HH:mm')}
                                    id={timeId}
                                    Medicine={medicine}
                                    medicineId={id}
                                    taken={taken}
                                    reloadFunction={renderTimeComponents}

                                />
                            );
                        }
                    }

                    // Add the generated alarm component to the list
                    allAlarmComponents.push({ time: alarmTime.format('HH:mm'), component: alarmComponent });
                });

                // Render components
                const components = allAlarmComponents.map((item, index) => (
                    <View style={styles.component} key={index}>
                        {item.component}
                    </View>
                ));

                // Update state with rendered components
                setAlarmComponents(components);
            }
        } catch (error) {
            console.error('Error rendering alarm components:', error);
        }
    };


    // const renderTimeComponents = async () => {
    //     try {

    //         const allAlarmComponents = [];
    //         const AlarmsArray = JSON.parse(await AsyncStorage.getItem('Alarms'));
    //         console.log(AlarmsArray);
    //         if (AlarmsArray) {
    //             AlarmsArray.forEach((alarm) => {
    //                 const { days, times, medicine, id, dosage, frequency } = alarm;
    //                 const currentTime = moment();

    //                 days.forEach((day) => {
    //                     times.forEach((timeObj) => {
    //                         const { time, id: timeId, taken } = timeObj;
    //                         const alarmTime = moment(`${day} ${time}`, 'YYYY-MM-DD HH:mm');
    //                         let alarmComponent;
    //                         // Check if this is the next upcoming alarm
    //                         if (alarmTime.isAfter(moment()) &&
    //                             !times.some((otherTime) => moment(`${day} ${otherTime.time}`).isBetween(moment(), alarmTime))) {
    //                             alarmComponent = (
    //                                 // <></>
    //                                 <CrossBell
    //                                     remainingTime={alarmTime.diff(moment(), 'minutes')} // Calculate remaining time
    //                                     time={alarmTime.format('HH:mm')}
    //                                     id={timeId}
    //                                     dosage={dosage}
    //                                     Medicine={medicine}
    //                                     medicineId={id}
    //                                     taken={taken}
    //                                     reloadFunction={renderTimeComponents} // Optional: for manual refresh
    //                                 />
    //                             );
    //                         } else {
    //                             if (alarmTime.isBefore(moment())) {
    //                                 alarmComponent = (
    //                                     <CrossAlarm
    //                                         time={alarmTime.format('HH:mm')}
    //                                         medicineId={id}
    //                                         id={timeId}
    //                                         Medicine={medicine}
    //                                         taken={taken}
    //                                         reloadFunction={renderTimeComponents}
    //                                     />
    //                                 );
    //                             } else {
    //                                 alarmComponent = (
    //                                     <BellAlarm
    //                                         time={alarmTime.format('HH:mm')}
    //                                         id={timeId}
    //                                         Medicine={medicine}
    //                                         medicineId={id}
    //                                         taken={taken}
    //                                         reloadFunction={renderTimeComponents}
    //                                     />
    //                                 );
    //                             }
    //                         }
    //                         if (alarmComponent) { // Only add if a component is defined
    //                             allAlarmComponents.push({ time: alarmTime.format('HH:mm'), component: alarmComponent });
    //                         }
    //                     });
    //                 });
    //             });
    //         }

    //         allAlarmComponents.sort((a, b) => moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm')));
    //         const components = allAlarmComponents.map((item, index) => (
    //             <View style={styles.component} key={index}>
    //                 {item.component}
    //             </View>
    //         ));
    //         setAlarmComponents(components);
    //     } catch (error) {
    //         console.error('Error rendering alarm components:', error);
    //     }
    // }



    // const renderTimeComponents = async () => {
    //     try {
    //         const allAlarmComponents = [];
    //         const AlarmsArray = JSON.parse(await AsyncStorage.getItem('Alarms'));
    //         if (AlarmsArray) {
    //             AlarmsArray?.forEach((alarm) => {
    //                 const { days, times, medicine, id, dosage, frequency } = alarm;
    //                 const currentTime = moment();

    //                 days.forEach((day) => {
    //                     times.forEach((timeObj) => {
    //                         const { time, id: timeId, taken } = timeObj;
    //                         const alarmTime = moment(`${day} ${time}`, 'YYYY-MM-DD HH:mm');
    //                         let remainingTime = alarmTime.diff(currentTime, 'minutes');
    //                         if (remainingTime < 0) {
    //                             remainingTime = 0;
    //                         }
    //                         let alarmComponent;
    //                         if (alarmTime.isBefore(currentTime)) {
    //                             alarmComponent = (
    //                                 <CrossAlarm
    //                                     time={alarmTime.format('HH:mm')}
    //                                     medicineId={id}
    //                                     id={timeId}
    //                                     Medicine={medicine}
    //                                     taken={taken}
    //                                     reloadFunction={renderTimeComponents}
    //                                 />
    //                             );
    //                         }
    //                         else if (alarmTime.isBetween(currentTime, moment(currentTime).add(frequency, 'hour'))) {
    //                             alarmComponent = (
    //                                 <CrossBell
    //                                     remainingTime={remainingTime}
    //                                     time={alarmTime.format('HH:mm')}
    //                                     id={timeId}
    //                                     dosage={dosage}
    //                                     Medicine={medicine}
    //                                     medicineId={id}
    //                                     taken={taken}
    //                                     reloadFunction={renderTimeComponents}
    //                                 />
    //                             );
    //                         } else {
    //                             alarmComponent = (
    //                                 <BellAlarm
    //                                     time={alarmTime.format('HH:mm')}
    //                                     id={timeId}
    //                                     Medicine={medicine}
    //                                     medicineId={id}
    //                                     taken={taken}
    //                                     reloadFunction={renderTimeComponents}
    //                                 />
    //                             );
    //                         }
    //                         allAlarmComponents.push({ time: alarmTime.format('HH:mm'), component: alarmComponent });
    //                     });
    //                 });
    //             });
    //         }

    //         allAlarmComponents.sort((a, b) => moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm')));
    //         const components = allAlarmComponents.map((item, index) => (
    //             <View style={styles.component} key={index}>
    //                 {item.component}
    //             </View>
    //         ));
    //         setAlarmComponents(components);
    //     } catch (error) {
    //         console.error('Error rendering alarm components:', error);
    //     }
    // };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await getMedicinesAndSupplements();
            // await AsyncStorage.setItem('Alarms', JSON.stringify(""));
            renderTimeComponents();
        } catch (error) {
            console.error('Error refreshing medicines:', error);
        } finally {
            setRefreshing(false);
        }
    };
    const props = {
        activeStrokeWidth: 11,
        inActiveStrokeWidth: 11,
        inActiveStrokeOpacity: 0.2
    };

    return (
        <ImageBackground source={config.backgroundImage} style={styles.backgroundImage}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                <View style={styles.headerContainer}>
                    <Image source={config.logo} style={styles.logo} />
                    {
                        image &&
                        <>
                            <ImageLogo imageURI={image} name={name} healthInfo={healthInfo} />
                        </>
                    }
                    {
                        !image &&
                        <>
                            <View style={{ position: 'absolute', right: 0 }}>
                                <CircularProgressBase
                                    {...props}
                                    value={healthInfo === false ? 30 : 100}
                                    radius={26}
                                    activeStrokeColor={healthInfo === false ? '#9e1b32' : '#379237'}
                                    inActiveStrokeColor={healthInfo === false ? '#9e1b32' : '#379237'}
                                />
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileAndHealth', { imageURI: image, name: name, healthInfo: healthInfo })} style={styles.profileButton}>
                                <Image source={profileIcon} style={styles.ProfileLogo} />
                            </TouchableOpacity>
                        </>
                    }
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameHeading}>Hello {name}!</Text>
                    <Text style={styles.nameSideHeading}>Welcome to Easy Patient</Text>
                </View>


                <View style={styles.parentView}>
                    {/* <Text style={styles.heading}>Notifications</Text>
                    <View style={styles.NotificationContainer}>
                        <Image source={goodHealth} style={styles.healthIcon} />
                        <Text style={styles.reminder}>Dr Ahmed sent you a package of reminders</Text>
                    </View> */}
                    <View style={styles.sliderContainer}>
                        <FolderSlider />
                    </View>
                    <Text style={styles.heading}>Todays Medications</Text>
                    {
                        !alarmComponents.length > 0 &&
                        <View style={styles.component}>
                            <Medications />
                        </View>
                    }
                    {
                        alarmComponents.map((component, index) => (
                            <View style={styles.component} key={index}>
                                {component}
                            </View>
                        ))
                        // {renderTimeComponents}
                    }

                </View>
            </ScrollView>
            {snackbarMessage !== '' && <Snackbar message={snackbarMessage} keyProp={snackbarKey} />}

            <Footer prop={0} />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    component: {
        marginBottom: 8,
    },
    reminder: {
        // textAlign: 'center',
        color: config.textColorHeadings,
        fontSize: PixelRatio.getFontScale() * 17,
    },
    sliderContainer: {
        minHeight: 170,
        marginLeft: 16,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'stretch',
        width: '100%',
    },
    profileButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    healthIcon: {
        height: 30,
        width: 30,
    },
    NotificationContainer: {
        flexDirection: 'row',
        height: 90,
        width: '90%',
        alignSelf: 'center',
        padding:25,
        gap:15,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 20,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    nameContainer: {
        marginLeft: 16,
        marginTop: -5,
    },
    nameHeading: {
        fontWeight: '500',
        fontSize: PixelRatio.getFontScale() * 24,
        color: config.textColorHeadings,
    },
    logo: {
        width: '10%',
        resizeMode: 'contain',
    },
    heading: {
        fontSize: PixelRatio.getFontScale() * 22,
        color: config.textColorHeadings,
        marginBottom: 15,
        marginTop: -5,
        fontWeight: '400',
        marginLeft: 16,
    },
    ProfileLogo: {
        width: '100%',
        height: '70%',
        resizeMode: 'contain',
    },
    headerContainer: {
        justifyContent: 'space-between',
        marginRight: 10,
        marginLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameSideHeading: {
        fontSize: PixelRatio.getFontScale() * 20,
        color: config.textColorHeadings,
    },
    parentView: {
        marginTop: '6%',
    },
});

export default Dashboard;
