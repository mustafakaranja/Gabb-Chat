import React, { Component } from "react";
import { auth, database } from "firebase";
import { FcGoogle } from "react-icons/fc";
import {
  Flex,
  Box,
  Button,
  Image,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/core";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      errorMessage: "",
    };
  }
  loginWithGmail = (e) => {
    e.preventDefault();
    let provider = new auth.GoogleAuthProvider();
    auth()
      .signInWithPopup(provider)
      .then((result) => {
        let additionalUserInfo = result.additionalUserInfo;
        let user = {
          userName: result.additionalUserInfo.profile.given_name,
          profile_picture: result.user.photoURL,
          fullName: result.user.displayName,
          email: result.user.email,
          uid: result.user.uid,
        };
        if (additionalUserInfo.isNewUser) {
          this.addUserList(result);
          this.props.isLogin(user);
        } else {
          let userRef = database()
            .ref()
            .child("usersTable")
            .child(result.user.uid);
          userRef.once("value", (snapshot) => {
            var isAvailable = snapshot.val();
            if (!isAvailable) {
              this.addUserList(result);
            } else {
              userRef.update({
                profile_picture: result.user.photoURL,
                uid: result.user.uid,
              });
            }
          });
          this.props.isLogin(user);
        }
      })
      .catch((error) => {
        var errorMessage = error.message;
        this.setState({ error: true, errorMessage });
      });
  };

  addUserList = (result) => {
    database().ref().child("usersTable").child(result.user.uid).set({
      userName: result.additionalUserInfo.profile.given_name,
      profile_picture: result.user.photoURL,
      fullName: result.user.displayName,
      email: result.user.email,
      uid: result.user.uid,
    });
  };

  render() {
    return (
      <React.Fragment>
        <Flex
          bg="gray.200"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          h="100vh"
        >
          <Alert
            status="error"
            marginBottom={10}
            style={{ display: this.state.error ? "block" : "none" }}
          >
            <AlertIcon />
            {this.state.errorMessage}
          </Alert>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg="white"
            padding="50px"
            shadow="md"
            rounded="md"
            style={{ paddingLeft: "unset", paddingRight: "unset" }}
          >
            <Image
              src="/Assets/logo/gab_login_logo.png"
              alt="logo"
              style={{ width: "50%" }}
            />
            <Button
              onClick={this.loginWithGmail}
              variantColor="teal"
              size="lg"
              marginTop={5}
              style={{ backgroundColor: "#5AD8D6", borderRadius: 30 }}
            >
              <FcGoogle style={{ marginRight: 10, fontSize: 35 }} /> Sign-in
              with Google
            </Button>
          </Box>
        </Flex>
      </React.Fragment>
    );
  }
}
export default Login;
