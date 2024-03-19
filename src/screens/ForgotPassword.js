import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, Image, PixelRatio, TouchableOpacity } from 'react-native';
import config from '../../config';
import { useNavigation } from '@react-navigation/native';
import CustomizedButton from '../components/CustomizedButton';
import axios from 'axios';
import ModalLoader from '../components/ModalLoader';
import AlertIcon from '../components/AlertIcon';
import ValidationError from '../components/ValidationError';
import OtpInput from '../components/OTPInput';
import Snackbar from '../components/Snackbar';
import Svg, { Path } from 'react-native-svg';
import qs from 'qs';
const ForgotPassword = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPassFocused, setIsConfirmPassFocused] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarKey, setSnackbarKey] = useState(0);
  const [usernameError, setUsernameError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailExist, setEmailExist] = useState(true);
  const [OTPbox, setOTPbox] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [otp, setOtp] = useState('');
  const [InvalidOTP, setInvalidOTP] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(null);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [ConfirmPass, setConfirmPass] = useState(null)
  const [passwordInput, setPasswordInput] = useState(true);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const handleOtpChange = (otpValue) => {
    setOtp(otpValue);
    // console.warn(otpValue);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };

  const handleConfirmPassFocus = () => {
    setIsConfirmPassFocused(true);
  };

  const handleConfirmPassBlur = () => {
    setIsConfirmPassFocused(false);
  };

  const handleConfirm = () => {
    setUsernameError(false);
    setErrorMessage('');
    if (!username) {
      setUsernameError(true);
      setErrorMessage("Incorrect Username/E-mail");
    } else if (!validateEmail(username)) {
      setInvalidEmail(true);
      setErrorMessage("Invalid email");
    }
    else if (emailExist) {
      checkEmailExist();
    } else if (!otp) {
      handleShowSnackbar("Invalid OTP");
    } else if (InvalidOTP) {
      VerifyOTP()
    } else if (passwordInput) {
      if (!password) {
        setPasswordError(true);
        setErrorMessage("Incorrect Password");
      } else if (!ConfirmPass) {
        setConfirmPasswordError(true);
        setErrorMessage("Incorrect Confirm Password");
      } else {
        changePassword();
      }
    }
  }
  const handleEmailFocus = () => {
    setIsEmailFocused(true);
  };

  const handleEmailBlur = () => {
    setIsEmailFocused(false);
  };
  const changePassword = () => {
    setShowLoader(true);
    let data = qs.stringify({
      'username': username,
      'change_key': otp,
      'new_password': password
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-patient-dev.easy-health.app/o/reset-password',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ZWZmZWN0aXZlc2FsZXNfd2ViX2NsaWVudDo4dz9keF5wVUVxYiZtSnk/IWpBZiNDJWtOOSFSMkJaVQ=='
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setShowLoader(false);
        navigation.navigate("Dashboard");
      })
      .catch((error) => {
        setShowLoader(false);
        handleShowSnackbar('Error! try again');
        navigation.goBack();
        console.log(error);
      });

  }

  const VerifyOTP = () => {
    let data = qs.stringify({
      'email': username,
      'code': otp
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-patient-dev.easy-health.app/patient/verify-otp',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ZWZmZWN0aXZlc2FsZXNfd2ViX2NsaWVudDo4dz9keF5wVUVxYiZtSnk/IWpBZiNDJWtOOSFSMkJaVQ=='
      },
      data: data
    };
    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        if (response.data.valid === true) {
          setShowPassword(true);
          setOTPbox(false);
          setInvalidOTP(false);
        } else {
          handleShowSnackbar("Invalid OTP");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const checkEmailExist = async () => {
    try {
      setShowLoader(true);
      const response = await axios.get(`https://api-patient-dev.easy-health.app/patient/${username}`);
      if (response.data.registered === true) {
        setOTPbox(true);
        setEmailExist(false);
        sendOTP();

      } else {
        handleShowSnackbar("Incorrect Username/E-mail");
      }
      setShowLoader(false);
    } catch (error) {
      console.error('Error:', error);
      setShowLoader(false);
    }
  }

  const sendOTP = () => {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api-patient-dev.easy-health.app/o/forgot-password/${username}`,
      headers: {
        'Authorization': 'Basic ZWZmZWN0aXZlc2FsZXNfd2ViX2NsaWVudDo4dz9keF5wVUVxYiZtSnk/IWpBZiNDJWtOOSFSMkJaVQ=='
      }
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));

      })
      .catch((error) => {
        console.log(error);
      });

  }

  const handleShowSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarKey((prevKey) => prevKey + 1);
  };

  const handleRegister = () => {
    navigation.navigate('Signup')
  }

  const handleLogin = () => {
    navigation.goBack();
  }

  return (
    <ImageBackground source={config.backgroundImage} style={styles.backgroundImage}>
      {showLoader && <ModalLoader />}
      <View style={styles.container}>
        <Image source={config.logo} style={styles.logo}></Image>
        <Image source={config.subLogo} style={styles.subLogo}></Image>
        {!showPassword &&
          <Text style={styles.signup}>Forgot Password</Text>
        }
        {!OTPbox && !showPassword &&
          <>
            <View style={[styles.inputContainer, isEmailFocused && styles.focusedInput]}>
              <Svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 24 24" style={styles.icon}>
                <Path d="M22 6.27V18H2V6.27l9.99 7.36L22 6.27zM12 13.36L3.09 7.12H20.91L12 13.36z" fill="none" stroke="black" strokeWidth="1" />
              </Svg>
              <TextInput
                style={styles.inputEmail}
                placeholder="E-mail"
                value={username}
                onChangeText={(text) => setUsername(text.trim())}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
                placeholderTextColor="gray"
                color="black"
              />
            </View>
            <View style={{ width: '100%', right: 30, bottom: 0 }}>
              {usernameError && !username && (
                <>
                  <AlertIcon />
                  <ValidationError errorMessage={errorMessage} />
                </>
              )}
              {invalidEmail && (
                <>
                  <AlertIcon />
                  <ValidationError errorMessage={errorMessage} />
                </>
              )}
            </View>
          </>
        }
        {showPassword &&
          <>
            <View style={{ marginTop: 55 }}></View>
            <TextInput
              style={[
                styles.inputConfirmPass,
                isPasswordFocused && styles.focusedInput,
              ]}
              placeholder="Password"
              onChangeText={(text) => setPassword(text.trim())}
              secureTextEntry={true}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              placeholderTextColor="gray"
              color="black"
            />
            <View style={{ width: '100%', right: 30, bottom: 10 }}>

              {passwordError && !password && (
                <>
                  <AlertIcon />
                  <ValidationError errorMessage={errorMessage} />
                </>
              )}
            </View>
            <TextInput
              style={[
                styles.inputConfirmPass,
                isConfirmPassFocused && styles.focusedInput,
              ]}
              placeholder="Confirm Password"
              onChangeText={setConfirmPass}
              secureTextEntry={true}
              onFocus={handleConfirmPassFocus}
              onBlur={handleConfirmPassBlur}
              placeholderTextColor="gray"
              color="black"
            />
            <View style={{ width: '100%', right: 30, bottom: 10 }}>
              {confirmPasswordError && !ConfirmPass && (
                <>
                  <AlertIcon />
                  <ValidationError errorMessage={errorMessage} />
                </>
              )}
            </View>
          </>
        }


        {OTPbox &&
          <>
            <View style={styles.TextContainer}>
              <Text style={styles.TextContainerText}>You will receive a code at the registered email. Enter the code below.</Text>
            </View>
            <View style={styles.OTPContainer}>
              <OtpInput onChange={handleOtpChange} />
            </View>
          </>
        }


        <View style={{ width: '100%', marginTop: 40 }}>
          <CustomizedButton onPress={handleConfirm} buttonColor={config.secondaryColor} borderColor={config.secondaryColor} textColor={"white"} text={"Confirm"} />
        </View>
        {!OTPbox && !showPassword &&
          <>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.login}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.login}>I already have an account</Text>
            </TouchableOpacity>
          </>
        }
        {OTPbox &&
          <>
            <View style={{ marginTop: '8%' }}><Text style={styles.codeText}>Didn't receive the code?</Text><Text style={styles.codeText}>Click here:</Text></View>
            <View style={{ marginTop: '7%' }}>
              <TouchableOpacity onPress={sendOTP}>
                <Text style={[styles.codeText, { textDecorationLine: 'underline', color: config.secondaryColor }]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        {snackbarMessage !== '' && <Snackbar message={snackbarMessage} keyProp={snackbarKey} />}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '20%'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: PixelRatio.getFontScale() * 17,
    borderBottomColor: config.secondaryColor,
    borderBottomWidth: 2,
    width: '90%',
  },
  inputEmail: {
    marginBottom:-8,
    flex: 1,
    fontSize: PixelRatio.getFontScale() * 17,
  },
  focusedInput: {
    borderBottomWidth: 4, // Increased border bottom width when focused
  },
  icon: {
    marginBottom:-7,
    marginRight: 2,
  },
  focusedInput: {
    borderBottomWidth: 3,
  },
  inputConfirmPass: {
    // marginTop: '1%',
    height: 40,
    borderWidth: 0,
    padding: 0,
    marginBottom: 15,
    borderBottomWidth: 2,
    width: '90%',
    fontSize: PixelRatio.getFontScale() * 17,
    borderBottomColor: config.secondaryColor,
  },
  TextContainer: {
    width: '80%',
    marginTop: 40,
  },
  TextContainerText: {
    fontSize: PixelRatio.getFontScale() * 17,
    textAlign: 'center',
    color: 'gray',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'stretch',
    width: '100%',
  },
  OTPContainer: {
    marginTop: 40,
  },
  logo: {
    height:58,
    borderColor: '#fff',
    resizeMode: 'contain',
    zIndex: 999,
  },
  subLogo: {
    height:19,
    width:180,
    marginTop: 10,
  },
  codeText: {
    fontSize: PixelRatio.getFontScale() * 18,
    textAlign: 'center',
    color: 'gray'
  },

  signup: {
    fontWeight: 'bold',
    fontSize: PixelRatio.getFontScale() * 18,
    marginTop: 30,
    color: config.textColorHeadings,
  },
  login: {
    paddingTop: '15%',
    textDecorationLine: 'underline',
    color: config.secondaryColor,
    fontSize: PixelRatio.getFontScale() * 15
  },
});

export default ForgotPassword;
