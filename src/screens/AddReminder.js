import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Animated, StyleSheet, Switch, Image, PixelRatio, TouchableOpacity } from 'react-native';
import config from '../../config';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomizedButton from '../components/CustomizedButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import redDrop from '../assets/redDrop.png';
import blackDrop from '../assets/blackDrop.png';
import blueDrop from '../assets/blueDrop.png';
import { readFile } from 'react-native-fs';
import yellowDrink from '../assets/yellowDrink.png';
import yellowDrop from '../assets/yellowDrop.png';
import redDrink from '../assets/redDrink.png';
import blueDrink from '../assets/blueDrink.png';
import blackDrink from '../assets/blackDrink.png';
import yellowMed from '../assets/yellowMed.png';
import blueMed from '../assets/blueMed.png';
import redMed from '../assets/redMed.png';
import blackMed from '../assets/blackMed.png';
import yellowCapsule from '../assets/yellowCapsule.png';
import RNFS from 'react-native-fs';
import blueCapsule from '../assets/blueCapsule.png';
import redCapsule from '../assets/redCapsule.png';
import blackCapsule from '../assets/blackCapsule.png';
import moment from "moment";
import axios from 'axios';
import BottomModalPopup from '../components/BottomModalPopup';
import RNFetchBlob from 'rn-fetch-blob';
import ModalLoader from '../components/ModalLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackHeader from '../components/backHeader';
const AddReminder = ({ route }) => {
    const { selectedImage, image } = route.params || { selectedImage: 1 };
    const navigation = useNavigation();
    const scrollViewRef = useRef();
    const [placeholderLabelAnim] = useState(new Animated.Value(selectedDays ? 1 : 0));
    const [isOpen, setIsOpen] = useState(false);
    const [placeholderVisible, setPlaceholderVisible] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const [MedicineName, setMedicineName] = useState('');
    const [days, setDays] = useState('');
    const [frequency, setFrequency] = useState('');
    const [dose, setDose] = useState('');
    const [date, setDate] = useState("");
    const [time, setTime] = useState(new Date());
    const [selectedDays, setSelectedDays] = useState('');
    const errorRefs = useRef([]);
    //validation feilds
    const [medicineError, setMedicineError] = useState(false);
    const [doseError, setDoseError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [daysError, setDaysError] = useState('');
    const [frequencyError, setFrequencyError] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isNotify, setIsNotify] = useState(false);
    const [priority, setPriority] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [freNumber, setFreNumber] = useState('');
    const [duration, setDuration] = useState('');
    const [freNumberError, setFreNumberError] = useState('');
    const [imagePath, setImagePath] = useState('');
    const toggleNotifySwitch = () => {
        setIsNotify(previousState => !previousState);
    };
    const togglePrioritySwitch = () => {
        setPriority(previousState => !previousState);
    };
    const handlePressDatePicker = () => {
        setShowDatePicker(true);
    };
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setShowTimePicker(true);
    };
    const handleSelect = (item) => {
        setSelectedDays(item.value);
        setIsOpen(false);
        setPlaceholderVisible(false);
        Animated.timing(placeholderLabelAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
        }).start();
    };
    let formattedDate = '';
    if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthAbbreviation = monthNames[parseInt(month) - 1];
        formattedDate = `${day} ${monthAbbreviation}.${year} as ${hours}h ${minutes}min`;
    }

    const DaysArray = [
        { label: 'Days', value: '1' },
        { label: 'Weeks', value: '2' },
        { label: 'Months', value: '3' },
    ];
    const handleOpen = () => setIsOpen(!isOpen);

    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(false);
        const currentTime = selectedTime || time;
        setTime(currentTime);
    };

    const getFileExtension = (fileUri) => {
        if (!fileUri) {
            return null;
        }
        const parts = fileUri.split('.');
        return parts.length > 1 ? parts.pop() : null;
    }


    const handleConfirm = async () => {
        setMedicineError(false);
        setErrorMessage('');
        setDateError(false);
        setDaysError(false);
        setDoseError(false);
        if (!MedicineName) {
            setMedicineError(true);
            setErrorMessage('Enter the name of Medicine/Supplement');
        }
        else if (!dose) {
            setDoseError(true);
            setErrorMessage('Enter dosage');
        }
        else if (!date) {
            setDateError(true);
            setErrorMessage('Enter start date and time');
        }
        else if (!days) {
            setDaysError(true);
            setErrorMessage('Enter number of days')
        } else if (!freNumber) {
            setFreNumberError(true);
            setErrorMessage('Please enter the frequency');
        } else {
            // setShowLoader(true);

            let loginResponse = await AsyncStorage.getItem('loginResponse');
            let responseObject = JSON.parse(loginResponse);
            let access_token = responseObject.access_token;
            let userId = responseObject.user.user_id;
            const fileExtension = getFileExtension(image) || 'jpg'; // Default extension 'jpg'
            const fileName = `imageMed.${fileExtension}`;

            // Prepare image data (adjust based on your image source):
            let imageData;
            if (Platform.OS === 'ios') {
                imageData = image.replace('file://', ''); // Remove 'file://' for iOS
            } else {
                imageData = image;
            }
            const formData = new FormData();
            if (image) {
                console.warn("imageCase");
                formData.append('file', {
                    uri: Platform.OS !== 'ios' ? image : image.replace('file://', ''),
                    type: `image/${fileExtension}`,
                    name: fileName,
                });
                try {
                    const response = await fetch('https://api-patient-dev.easy-health.app/medicines', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${access_token}`,
                            'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json', // Set based on data type
                        },
                        body: formData,
                    });

                    if (response.ok) {

                        const apiData = await response.json();
                        console.log(apiData);
                        updateMedicine(apiData.id, access_token, userId);
                        // renderAlarmComponents(apiData, userId, apiData.picture_link);
                    } else {
                        console.error('Error sending medicine data:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error sending medicine data:', error);
                } finally {

                    setShowLoader(false);
                    // navigation.navigate('Dashboard', { /* isChanged: true, */ }); // Remove the commented line if needed
                }
            } else {
                console.warn("iconCase");
                const Newdate = `${date?.getFullYear()}-${String(date?.getMonth() + 1).padStart(2, '0')}-${String(date?.getDate()).padStart(2, '0')}`;
                const Newtime = `${String(time?.getHours()).padStart(2, '0')}:${String(time?.getMinutes()).padStart(2, '0')}:${String(time?.getSeconds()).padStart(2, '0')}`;

                const data = new FormData();
                data.append('name', MedicineName);
                data.append('dosage', dose);
                data.append('number_of_days', days);
                data.append('frequency', freNumber);
                data.append('days_of_the_week', '4,7,5');
                data.append('st_notification', !isNotify ? 0 : 1);
                data.append('st_critical', !priority ? 0 : 1);
                data.append('default_icon', selectedImage)
                data.append('start_time', `${Newdate} ${Newtime}`);
                const config = {
                    method: 'POST',
                    maxBodyLength: Infinity,
                    url: `https://api-patient-dev.easy-health.app/medicines`,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${access_token}`,
                    },
                    data: data
                };

                axios.request(config)
                    .then((response) => {
                        console.log(JSON.stringify(response.data.id));
                        getMedicine(response.data.id,access_token,userId);
                    })
                    .catch((error) => {
                        console.log(error);
                    }).finally(() => {
                        // updateMedicineById();
                    });
            }



        }
    }

    const updateMedicine = async (medicineId, access_token, userId) => {
        const Newdate = `${date?.getFullYear()}-${String(date?.getMonth() + 1).padStart(2, '0')}-${String(date?.getDate()).padStart(2, '0')}`;
        const Newtime = `${String(time?.getHours()).padStart(2, '0')}:${String(time?.getMinutes()).padStart(2, '0')}:${String(time?.getSeconds()).padStart(2, '0')}`;
        const data = new FormData();
        data.append('name', MedicineName);
        data.append('dosage', dose);
        data.append('number_of_days', days);
        data.append('frequency', freNumber);
        data.append('days_of_the_week', '4,7,5');
        data.append('st_notification', !isNotify ? 0 : 1);
        data.append('st_critical', !priority ? 0 : 1);
        data.append('start_time', `${Newdate} ${Newtime}`);

        const config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `https://api-patient-dev.easy-health.app/medicines/${medicineId}`,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${access_token}`,
            },
            data: data
        };
        const response = await axios.request(config);
        // console.log("Credentails",medicineId, access_token, userId)
        getMedicine(medicineId, access_token, userId);
    }

    const getMedicine = (medicineId, access_token, userId) => {
        console.log("inside get");
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api-patient-dev.easy-health.app/medicines',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        };

        axios.request(config)
            .then((response) => {
                for (let i = 0; i < response.data.length; i++) {
                    if (response.data[i].id === medicineId) {
                        // console.log(JSON.stringify(response.data[i]));
                        
                        renderAlarmComponents(response.data[i], userId);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }


    const renderAlarmComponents = async (medicines, userId) => {
        try {
            medicines = Array.isArray(medicines) ? medicines : [medicines];

            // Fetch existing alarms from AsyncStorage
            const existingAlarmsJSON = await AsyncStorage.getItem('Alarms');
            const existingAlarms = existingAlarmsJSON ? JSON.parse(existingAlarmsJSON) : [];

            // Initialize variables
            const idDosageMedicineFrequencyMap = {};

            // Process each medicine
            for (const medicine of medicines) {
                const { start_time, frequency, name, id, dosage, picture_link } = medicine;

                const startTimeDate = moment(start_time).format('YYYY-MM-DD');
                const currentTime = moment();
                const nextAlarmTime = moment(start_time);

                if (moment(start_time).isSame(moment(), 'day')) {
                    let timeId = 1; // Initialize timeId

                    while (nextAlarmTime.isBefore(moment().endOf('day'))) {
                        const newAlarm = {
                            time: nextAlarmTime.format('HH:mm'),
                            medicine: name,
                            dosage,
                            id,
                            frequency,
                            picture_link:picture_link? picture_link: null,
                            selectedImage: selectedImage // Include picture_path in the alarm object
                        };

                        // Create a key based on id, dosage, medicine, and frequency
                        const key = `${id}_${dosage}_${name}_${frequency}`;

                        // Initialize times array if it doesn't exist
                        if (!idDosageMedicineFrequencyMap[key]) {
                            idDosageMedicineFrequencyMap[key] = {
                                id,
                                dosage,
                                medicine: name,
                                user_id: userId,
                                frequency,
                                times: [],
                                days: [],
                                picture_link:picture_link? picture_link: null,
                                selectedImage: selectedImage // Include picture_path in the medicine entry
                            };
                        }

                        // Push the time to the times array with taken: false and timeId
                        idDosageMedicineFrequencyMap[key].times.push({ time: newAlarm.time, id: timeId, taken: false });
                        if (!idDosageMedicineFrequencyMap[key].days.includes(startTimeDate)) {
                            idDosageMedicineFrequencyMap[key].days.push(startTimeDate);
                        }

                        nextAlarmTime.add(frequency, 'hours');
                        timeId++; // Increment timeId for the next time
                    }
                }
            }

            // Convert the map to an array of values
            const updatedAlarmsData = Object.values(idDosageMedicineFrequencyMap);

            // If existing alarms exist, concatenate with the new alarms
            const finalAlarmsArray = existingAlarms.length > 0 ? existingAlarms.concat(updatedAlarmsData) : updatedAlarmsData;

            // Store updated alarms in AsyncStorage
            await AsyncStorage.setItem('Alarms', JSON.stringify(finalAlarmsArray));
            console.log('Added alarms:', finalAlarmsArray);

        } catch (error) {
            console.error('Error rendering alarm components:', error);
        }
    };


    const handleCounter = () => {
        setModalVisible(true);
    }


    const renderImage = () => {

        switch (selectedImage) {
            case 1:
                return <Image source={blackMed} style={styles.Profilelogo} />;
            case 2:
                return <Image source={blackCapsule} style={styles.capsulelogo} />;
            case 3:
                return <Image source={blackDrop} style={styles.Profilelogo} />;
            case 4:
                return <Image source={blackDrink} style={styles.Profilelogo} />;
            case 5:
                return <Image source={blueMed} style={styles.Profilelogo} />;
            case 6:
                return <Image source={blueCapsule} style={styles.capsulelogo} />;
            case 7:
                return <Image source={blueDrop} style={styles.Profilelogo} />;
            case 8:
                return <Image source={blueDrink} style={styles.Profilelogo} />;
            case 9:
                return <Image source={yellowMed} style={styles.Profilelogo} />;
            case 10:
                return <Image source={yellowCapsule} style={styles.capsulelogo} />;
            case 11:
                return <Image source={yellowDrop} style={styles.Profilelogo} />;
            case 12:
                return <Image source={yellowDrink} style={styles.Profilelogo} />;
            case 13:
                return <Image source={redMed} style={styles.Profilelogo} />;
            case 14:
                return <Image source={redCapsule} style={styles.capsulelogo} />;
            case 15:
                return <Image source={redDrop} style={styles.Profilelogo} />;
            case 16:
                return <Image source={redDrink} style={styles.Profilelogo} />;
            case 17:
                return <Image source={{ uri: image }} style={styles.ProfileImage} />;
            case 18:
                return <Image source={{ uri: image }} style={styles.ProfileImage} />;
            default:
                return <Image source={blackMed} style={styles.Profilelogo} />;
        }
    };
    // console.log(image);


    return (
        <>
            <View style={styles.container}>
                {showLoader && <ModalLoader />}
                <BottomModalPopup visible={modalVisible} setFreNumber={setFreNumber} setDuration={setDuration} onClose={() => setModalVisible(false)} />
                <BackHeader name={"Add Reminder"} />

                <TouchableOpacity onPress={() => navigation.navigate('MedicineImage', { selectedImageD: selectedImage, imageD: image })} style={styles.medicineContiner}>
                    {renderImage()}
                </TouchableOpacity>
                <ScrollView ref={scrollViewRef} style={{ width: '100%', height: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
                    <View style={styles.signupFormContainer}>
                        <View
                            ref={(ref) => (errorRefs.current[0] = ref)}
                            style={styles.floatingLabel}>
                            <FloatingLabelInput
                                label={'Name of Medicine/Supplement'}
                                inputStyles={styles.inputStyles}
                                labelStyles={{ paddingHorizontal: 0 }}
                                customLabelStyles={!medicineError ? styles.customLabelStyles : styles.customLabelStylesEmpty}
                                value={MedicineName}
                                onChangeText={value => setMedicineName(value)}
                                containerStyles={!medicineError ? styles.containerStyles : styles.containerStylesEmpty}
                            />
                            {medicineError && (
                                <>
                                    <View><Text style={styles.ErrorText}>{errorMessage}</Text></View>
                                </>
                            )}
                        </View>

                        <View
                            ref={(ref) => (errorRefs.current[1] = ref)}
                            style={styles.floatingLabel}>
                            <FloatingLabelInput
                                label={'Dose'}
                                inputStyles={styles.inputStyles}
                                customLabelStyles={!doseError ? styles.customLabelStyles : styles.customLabelStylesEmpty}
                                value={dose}
                                onChangeText={value => setDose(value)}
                                containerStyles={!doseError ? styles.containerStyles : styles.containerStylesEmpty}
                            />
                            {doseError && (
                                <>
                                    <View><Text style={styles.ErrorText}>{errorMessage}</Text></View>
                                </>
                            )}
                        </View>
                        <View
                            ref={(ref) => (errorRefs.current[2] = ref)}
                            style={styles.floatingLabel}>
                            <TouchableOpacity onPress={handlePressDatePicker}>
                                <View style={!dateError ? styles.containerStyles : styles.containerStylesEmpty}>
                                    {date ? (
                                        <Text style={{ marginBottom: 8, color: config.secondaryColor }}>Start Date and Time</Text>
                                    ) : (
                                        <TextInput
                                            style={{ ...styles.inputStyles, marginTop: -16, marginBottom: 10, left: 5 }}
                                            placeholder="Start Date and Time"
                                            placeholderTextColor={!dateError ? config.primaryColor : 'red'}
                                            editable={false}
                                            value={date ? formattedDate : ""}
                                        />
                                    )}
                                    {date && (
                                        <Text style={{ ...styles.inputStyles, marginTop: -32 }}>{formattedDate}</Text>
                                    )}

                                </View>
                                {dateError && (
                                    <>
                                        <View><Text style={styles.ErrorTextDate}>{errorMessage}</Text></View>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        {showDatePicker && (
                            <>

                                <DateTimePicker
                                    testID="datePicker"
                                    value={date || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onChange}

                                />
                            </>
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                testID="timePicker"
                                value={time}
                                mode="time"
                                onChange={onChangeTime}

                            />
                        )}
                        <View style={{ flexDirection: 'row', width: '90%', }}>
                            <View
                                ref={(ref) => (errorRefs.current[5] = ref)}
                                style={{ ...styles.floatingLabelH, borderBottomWidth: 0.5, borderBottomColor: config.secondaryColor }}>
                                <FloatingLabelInput
                                    label={'Number of Days'}
                                    inputStyles={styles.inputStyles}
                                    labelStyles={{ paddingHorizontal: 0 }}
                                    customLabelStyles={!daysError ? styles.customLabelStyles : styles.customLabelStylesEmpty}
                                    value={days}
                                    onChangeText={value => setDays(value)}
                                    containerStyles={!daysError ? styles.containerStyles : styles.containerStylesEmpty}
                                    keyboardType="numeric"
                                />

                                {daysError && (
                                    <>
                                        <View><Text style={styles.ErrorTextDate}>{errorMessage}</Text></View>
                                    </>
                                )}
                            </View>

                            <View
                                ref={(ref) => (errorRefs.current[3] = ref)}
                                style={{ ...styles.floatingLabelN, borderBottomWidth: 1.5, borderBottomColor: config.secondaryColor, zIndex: 999, marginTop: 0 }}>
                                <Animated.Text
                                    style={[
                                        styles.placeholderLabel,
                                        {
                                            transform: [
                                                {
                                                    translateY: placeholderLabelAnim.interpolate({
                                                        inputRange: [0, 1.2],
                                                        outputRange: [0, -25],
                                                    }),
                                                },
                                                {
                                                    scale: placeholderLabelAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0.95, 0.9],
                                                    }),
                                                },
                                            ],
                                            // Apply margin left conditionally
                                            marginLeft: placeholderLabelAnim.interpolate({
                                                inputRange: [0, 1.5],
                                                outputRange: [0, -5],
                                            }),
                                            // Interpolate font size
                                            fontSize: placeholderLabelAnim.interpolate({
                                                inputRange: [0, 1.5],
                                                outputRange: [PixelRatio.getFontScale() * 18, PixelRatio.getFontScale() * 16],
                                            }),
                                            color: placeholderLabelAnim.interpolate({
                                                inputRange: [0, 1.5],
                                                outputRange: [config.primaryColor, config.secondaryColor],
                                            }),
                                        },
                                    ]}
                                >
                                    Days
                                </Animated.Text>

                                <DropDownPicker
                                    items={DaysArray}
                                    value={selectedDays}
                                    onSelectItem={handleSelect}
                                    placeholder=""
                                    open={isOpen}
                                    showArrowIcon={false}
                                    onOpen={handleOpen}
                                    onClose={handleOpen}
                                    listMode="SCROLLVIEW"
                                    style={{
                                        backgroundColor: styles.primaryColor,
                                        borderWidth: 0,
                                        left: -7,
                                        top: 22,
                                        color: config.primaryColor,
                                        zIndex: 999,
                                    }}
                                    textStyle={{
                                        fontSize: PixelRatio.getFontScale() * 18,
                                    }}
                                />
                            </View>
                        </View>


                        <TouchableOpacity
                            onPress={() => handleCounter()}
                            ref={(ref) => (errorRefs.current[5] = ref)}
                            style={styles.floatingLabel}>
                            {
                                freNumber &&
                                <>
                                    <View style={{ marginTop: 10, }}></View>
                                    <FloatingLabelInput
                                        label={'Frequency'}
                                        inputStyles={styles.inputStyles}
                                        customLabelStyles={styles.customLabelStyles}
                                        value={`Every ${freNumber} ${duration}`}
                                        onChangeText={value => setFrequency(value)}
                                        containerStyles={styles.containerStyles}
                                        onPressOut={() => handleCounter()}
                                    />
                                </>
                            }
                            {
                                !freNumber &&
                                <TextInput
                                    style={
                                        !freNumberError ?
                                            {
                                                ...styles.containerStyles,
                                                marginTop: 10,
                                                paddingLeft: 10,
                                                marginBottom: 20
                                            } :
                                            {
                                                ...styles.containerStylesEmpty,
                                                marginTop: 10,
                                                paddingLeft: 10,
                                                marginBottom: 20
                                            }

                                    }
                                    editable={false}
                                    placeholder="Frequency"
                                    placeholderTextColor={!freNumberError ? 'gray' : 'red'}
                                    onChangeText={value => setFrequency(value)} // You can remove this line
                                />
                            }

                            {freNumberError && !freNumber && (
                                <>
                                    <View><Text style={styles.ErrorTextFrequency}>{errorMessage}</Text></View>
                                </>
                            )}

                        </TouchableOpacity>

                        {freNumberError && !freNumber && (
                            <>
                                <View style={{ marginBottom: 30 }}></View>
                            </>
                        )}
                        <View style={styles.switchContainer}>
                            <Switch
                                trackColor={{ false: config.primaryColor, true: '#CFB53B' }}
                                thumbColor={isNotify ? config.secondaryColor : config.primaryColor}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleNotifySwitch}
                                value={isNotify}
                            />
                            <Text style={styles.NotifyText}>Notifications</Text>
                        </View>
                        <View style={styles.switchContainer}>
                            <Switch
                                trackColor={{ false: config.primaryColor, true: '#CFB53B' }}
                                thumbColor={priority ? config.secondaryColor : config.primaryColor}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={togglePrioritySwitch}
                                value={priority}
                            />
                            <View>
                                <Text style={styles.NotifyText}>High priority</Text>
                            </View>
                        </View>
                        <View style={styles.notifyContainer}>
                            <Text style={styles.NotifyMsg}>Allow Easy Patient to make sound notifications even when you cell phone is in silent mode.</Text>
                        </View>
                        <View style={{ width: '95%', marginTop: 35 }}>
                            <CustomizedButton onPress={handleConfirm} buttonColor={config.secondaryColor} borderColor={config.secondaryColor} textColor={"white"} text={"Confirm"} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        // justifyContent:'center',
    },
    medicineContiner: {
        borderRadius: 40,
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: config.secondaryColor,
        marginTop: 40,
        marginBottom: 25,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    ErrorText: {
        color: 'red',
        marginTop: 10,
        marginBottom: -10,
        marginLeft: 0,
    },
    ErrorTextDate: {
        color: 'red',
        marginBottom: -30,
        marginLeft: 0,
    },
    ErrorTextFrequency: {
        color: 'red',
        marginBottom: -30,
        marginLeft: 0,
        top: -15,
        // marginBottom:20,
    },
    switchContainer: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        marginLeft: 18,
        gap: 5,
        marginTop: 15,
        alignItems: 'center',
    },
    notifyContainer: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        marginLeft: 70,
        gap: 20,
        marginTop: 8,
        alignItems: 'center',
    },
    ProfileLogo: {
        height: 52,
        width: 35,
    },
    inputContainer: {
        marginTop: '4%',
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: PixelRatio.getFontScale() * 17,
        borderBottomColor: config.secondaryColor,
        borderBottomWidth: 2,
        width: '90%',
    },
    NotifyMsg: {
        color: config.secondaryColor,
        width: '90%',
        fontSize: PixelRatio.getFontScale() * 14,
    },
    placeholderLabel: {
        position: 'absolute',
        left: 0,
        top: 25,
        fontSize: PixelRatio.getFontScale() * 17,
        color: config.primaryColor,
        zIndex: 1,
        lineHeight: PixelRatio.getFontScale() * 20,
    },
    TextContainer: {
        width: '80%',
        marginTop: 40,
    },
    TextContainerText: {
        fontSize: PixelRatio.getFontScale() * 17,
        textAlign: 'center',
        color: 'gray'
    },

    inputEmail: {
        marginBottom: -8,
        flex: 1,
        fontSize: PixelRatio.getFontScale() * 17,
    },
    icon: {
        marginBottom: -8,
        marginRight: 2,
    },
    focusedInput: {
        borderBottomWidth: 3,
    },
    OTPContainer: {
        marginTop: 50,
    },
    codeText: {
        fontSize: PixelRatio.getFontScale() * 17,
        textAlign: 'center',
        color: 'gray',
    },
    label: {
        position: 'absolute',
        left: 0,
        top: 0,
        fontSize: PixelRatio.getFontScale() * 17,
        color: config.primaryColor,
        zIndex: 1,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        lineHeight: PixelRatio.getFontScale() * 20,
    },
    labelFloating: {
        top: -PixelRatio.getFontScale() * 4,
        fontSize: PixelRatio.getFontScale() * 17,
    },
    dropdownPicker: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: config.secondaryColor,
    },
    dropdownTextStyle: {
        color: config.primaryColor,
        fontSize: PixelRatio.getFontScale() * 17,
    },
    button: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 5,
    },
    NotifyText: {
        color: config.primaryColor,
        fontSize: PixelRatio.getFontScale() * 17,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 10,
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        alignItems: 'left',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalItem: {
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    signupContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    signupFormContainer: {
        flex: 1,
        width: '98%',
        height: '100%',
        alignItems: 'center',
        flexDirection: 'column',
    },

    FocusStyling: {
        color: config.primaryColor,
    },
    ProfileImage: {
        height: 75,
        width: 75,
        borderRadius: 37.5,
    },
    Profilelogo: {
        height: 36,
        width: 24,
        borderColor: config.secondaryColor,
    },
    capsulelogo: {
        height: 30,
        width: 28,
        borderColor: config.secondaryColor,
    },
    backLink: {
        fontSize: PixelRatio.getFontScale() * 17,
        color: config.secondaryColor,
        textDecorationLine: 'underline',
        marginTop: 30,
        marginBottom: 30,
    },
    inputPassword: {
        marginTop: 10,
        height: 40,
        borderWidth: 0,
        padding: 10,
        marginBottom: 10,
        borderBottomWidth: 2,
        width: '90%',
        fontSize: PixelRatio.getFontScale() * 17,
        borderBottomColor: config.secondaryColor,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'stretch',
        width: '100%',
    },
    logo: {
        borderColor: '#fff',
        resizeMode: 'contain',
        zIndex: 999,
    },
    subLogo: {
        marginTop: 15,
    },

    signup: {
        fontWeight: 'bold',
        fontSize: PixelRatio.getFontScale() * 20,
        marginTop: '6%',
        color: config.textColorHeadings,
    },
    loginButton: {
        width: '90%',
        height: 40,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        borderWidth: 1,
        color: config.secondaryColor,
        borderColor: config.secondaryColor,
        fontSize: PixelRatio.getFontScale() * 17,
        // backgroundColor: 'rgba(0,0,0,0)', // Set background color directly
    },
    forgotPassword: {
        justifyContent: 'flex-end',
        textDecorationLine: 'underline',
        width: '90%',
        textAlign: 'right',
        marginTop: 20,
        fontSize: PixelRatio.getFontScale() * 17
    },
    login: {
        paddingTop: '15%',
        textDecorationLine: 'underline',
        color: config.secondaryColor,
        fontSize: PixelRatio.getFontScale() * 15,

    },
    checkbox: {
        marginTop: '4%',
        width: '90%',
        justifyContent: 'left',
        textAlign: 'left',
        flexDirection: 'row'
    },
    text: {
        fontSize: PixelRatio.getFontScale() * 17,
        padding: 2,
        color: config.secondaryColor,
        flexDirection: 'row',
        textAlign: 'center',
        alignItems: 'center',
    },
    textt: {
        fontSize: PixelRatio.getFontScale() * 17,
        padding: 2,
        color: 'gray',
        flexDirection: 'row',
        textAlign: 'center',
        alignItems: 'center',
    },
    label: {
        position: 'absolute',
        left: 10,
        top: 10,
        fontSize: 16,
        color: config.primaryColor,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderColor: config.primaryColor,
        borderRadius: 5,
        fontSize: 16,
    },
    floatingLabel: {
        marginBottom: 10,
        width: '90%',
        height: '100%',
        flex: 1
    },
    floatingLabelH: {
        marginBottom: 6,
        width: '60%',
        height: '100%',
        flex: 0.8
    },
    floatingLabelN: {
        marginBottom: 0,
        marginStart: 20,
        width: '60%',
        height: '100%',
        flex: 0.5
    },
    containerStyles: {
        fontSize: PixelRatio.getFontScale() * 17,
        borderWidth: 0,
        height: '100%',
        paddingVertical: 0,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderColor: config.secondaryColor,
    },
    containerStylesEmpty: {
        fontSize: PixelRatio.getFontScale() * 17,
        borderWidth: 0,
        height: '100%',
        paddingVertical: 0,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderColor: 'red'
    },

    customLabelStyles: {
        colorFocused: config.secondaryColor,
        colorBlurred: config.primaryColor,
        fontSizeFocused: PixelRatio.getFontScale() * 14,
        fontSizeBlurred: PixelRatio.getFontScale() * 17,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginVertical: 0
    },
    customLabelStylesEmpty: {
        colorFocused: 'red',
        colorBlurred: 'red',
        fontSizeFocused: PixelRatio.getFontScale() * 14,
        fontSizeBlurred: PixelRatio.getFontScale() * 17,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginVertical: 0
    },
    inputStyles: {
        fontSize: PixelRatio.getFontScale() * 17,
        paddingBottom: 0,
        paddingHorizontal: 0,
        paddingTop: 30,
        color: config.textColorHeadings

    }

});

export default AddReminder;
