import { Avatar, Button, CssBaseline, TextField, Typography, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import classes from "./login-form.module.scss";
import { toast } from "react-toastify";
import { Box, Container } from "@mui/system";
import Image from "next/image";
import { LoadingBarRef } from "react-top-loading-bar";
import { useSession } from "next-auth/react";

//sx: style chỉnh đây
import { blueGrey } from "@mui/material/colors";
interface LoginFormProps {
    loadingBarRef: React.RefObject<LoadingBarRef>;
}

const LoginForm: React.FC<LoginFormProps> = ({ loadingBarRef }) => {
    const router = useRouter();

    const [formData, setData] = useState({
        id: "nguyenvanadmin@example.com",
        password: "securepassword123",
    });

    const [errors, setErrors] = useState({
        idError: "",
        passwordError: "",
    });

    const [loading, setLoading] = useState(false);

    const { id, password } = formData;
    const { idError, passwordError } = errors;

    const handleInputChange = (e: any) => {
        const newData = {
            ...formData,
            [e.target.name]: e.target.value,
        };

        setData(newData);
        validateInputs(newData.id, newData.password); // Call validation
    };

    const validateInputs = (id: string, password: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email validation
        const usernameRegex = /^[^\s]+$/; // Username validation (any string without spaces)
        const passwordRegex = /^.{8,}$/; // Password must be at least 8 characters

        const isIdValid = emailRegex.test(id) || usernameRegex.test(id);
        const isPasswordValid = passwordRegex.test(password);

        setErrors({
            idError: isIdValid ? "" : "Invalid ID (must be email or username without spaces)",
            passwordError: isPasswordValid ? "" : "Password must be at least 8 characters",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading || idError !== "" || passwordError !== "") {
            return;
        }

        setLoading(true);
        loadingBarRef?.current?.continuousStart(50);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                id: id,
                password: password,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.ok) {
                router.replace("/dashboard");
            }
        } catch (e) {
            console.log(e);
            toast(e.message || "Login failed, please try again!");
            setLoading(false);
            loadingBarRef?.current?.complete();
        } finally {
            loadingBarRef?.current?.complete();
        }
    };

    return (
        <React.Fragment>
            <div className={classes.formContainer} style={{ display: "flex" }}>
                <Container
                    component="main"
                    sx={{
                        marginLeft: 0,
                        maxWidth: "50%",
                        width: "50%",
                    }}
                >
                    <CssBaseline />
                    <div className={`${classes.header}`}>
                        <img
                            style={{
                                width: "153px",
                                height: "70px",
                            }}
                            src="/images/Logo-ExamGuard.svg"
                            alt="Logo"
                        />
                        <Link href="#">
                            <a>Introduction</a>
                        </Link>
                    </div>
                    <div className={classes.title}>
                        <p
                            style={{
                                color: "#1D5E5D",
                                fontSize: "36px",
                                fontWeight: 700,
                            }}
                        >
                            SIGN IN
                        </p>
                        <p
                            style={{
                                color: "#1DB0A6",
                                fontWeight: 700,
                            }}
                        >
                            CHOOSE ACCOUNT ROLE
                        </p>
                    </div>
                    <div className={classes.buttonContainer}>
                        <Button
                            className={classes.button}
                            sx={{
                                backgroundImage: "url(/images/teacher-signin.png)",
                            }}
                        >
                            <p
                                style={{
                                    margin: "285px auto auto 65px",
                                    fontSize: "14px",
                                    color: "#1DB0A6",
                                    fontWeight: 700,
                                }}
                            >
                                TEACHER
                            </p>
                        </Button>
                        <Button
                            className={classes.button}
                            sx={{
                                backgroundImage: "url(/images/student-signin.png)",
                            }}
                        >
                            <p
                                style={{
                                    margin: "285px auto auto 65px",
                                    fontSize: "14px",
                                    color: "#1DB0A6",
                                    fontWeight: 700,
                                }}
                            >
                                STUDENT
                            </p>
                        </Button>
                    </div>
                    <div className={classes.greeting}>
                        <div style={{ display: "flex" }}>
                            <p
                                style={{
                                    color: "#1DB0A6",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                }}
                            >
                                Hello
                            </p>
                            <Typography>{/* người được chọn */}</Typography>
                        </div>
                        <p
                            style={{
                                marginTop: "12px",
                                color: "#1DB0A6",
                                fontSize: "12px",
                                fontWeight: 700,
                            }}
                        >
                            Please fill out the form below to get started
                        </p>
                    </div>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ margin: "52px auto", maxWidth: "325px" }}>
                        <TextField
                            name="id"
                            id="id"
                            value={id}
                            label="ID"
                            onChange={handleInputChange}
                            type="text"
                            margin="normal"
                            required
                            fullWidth
                            autoFocus
                            error={idError != ""}
                            helperText={idError}
                        />

                        <TextField
                            name="password"
                            id="password"
                            value={password}
                            label="Password"
                            onChange={handleInputChange}
                            type="password"
                            margin="normal"
                            required
                            fullWidth
                            autoComplete="current-password"
                            error={passwordError != ""}
                            helperText={passwordError}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                margin: "20px auto",
                            }}
                        >
                            <FormGroup>
                                <FormControlLabel control={<Checkbox />} label="Remember me" />
                            </FormGroup>

                            <Typography
                                style={{
                                    color: "#000",
                                    fontFamily: "Lexend",
                                    fontSize: "15px",
                                    fontWeight: 400,
                                }}
                            >
                                Forgot password?
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            // style chỉnh đây
                            sx={{
                                fontSize: "16px",
                                fontWeight: 700,
                                backgroundColor: "#229594",
                            }}
                            onClick={handleSubmit}
                            disabled={loading || idError != "" || passwordError != ""}
                        >
                            Sign In
                        </Button>
                    </Box>

                    {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
                </Container>
                <Box sx={{ maxWidth: "50%", width: "50%" }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            backgroundImage: "url(/images/background-signin.png)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <Typography
                            style={{
                                color: "#fff",
                                fontFamily: "Lexend",
                                fontSize: "40px",
                                fontWeight: 700,
                            }}
                        >
                            Welcome Back!
                        </Typography>
                        <Typography
                            style={{
                                marginTop: "60px",
                                width: "460px",
                                color: "#fff",
                                fontFamily: "Lexend",
                                fontSize: "34px",
                                fontWeight: 400,
                            }}
                        >
                            Enter your personal details to use all of site features
                        </Typography>
                        <Button
                            onClick={() => router.push("/auth/signup")}
                            variant="outlined"
                            color="primary"
                            sx={{
                                marginTop: "60px",
                                width: "300px",
                                height: "80px",
                                borderRadius: "2rem",
                                fontSize: "30px",
                                fontWeight: 700,
                                border: "0.5px solid #fff",
                                color: "#fff",
                                ":hover": {
                                    border: "transparent",
                                    color: "#229594",
                                    opacity: "0.8",
                                    backgroundColor: "#fff",
                                    fontWeight: "bold",
                                    transition: "all 0.9s ease-in-out",
                                },
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </Box>
            </div>
            {/* <div className={classes.footerContainer}>
        <Footer />
      </div> */}
        </React.Fragment>
    );
};

export default LoginForm;
