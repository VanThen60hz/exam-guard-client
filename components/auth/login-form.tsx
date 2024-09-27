import { Avatar, Button, CssBaseline, TextField, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import classes from "./login-form.module.scss";
import { toast } from "react-toastify";
import { Box, Container } from "@mui/system";
import Image from "next/image";
import { LoadingBarRef } from "react-top-loading-bar";

interface LoginFormProps {
    loadingBarRef: React.RefObject<LoadingBarRef>;
}

const LoginForm: React.FC<LoginFormProps> = ({ loadingBarRef }) => {
    const router = useRouter();

    const [formData, setData] = useState({
        usernameOrEmail: "nguyenvanadmin@example.com",
        password: "securepassword123",
    });

    const [loading, setLoading] = useState(false);

    const { usernameOrEmail, password } = formData;

    const handleInputChange = (e: any) => {
        const newData = {
            ...formData,
            [e.target.name]: e.target.value,
        };

        setData(newData);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            usernameOrEmail: usernameOrEmail,
            password: password,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow" as RequestRedirect,
        };

        try {
            const response = await fetch("http://localhost:8000/auth/login", requestOptions);
            const result = await response.json();

            if (response.ok) {
                // Store user ID and access token in localStorage
                localStorage.setItem("x-client-id", result.metadata.user._id); // Store user ID
                localStorage.setItem("Authorization", result.metadata.tokens.accessToken); // Store access token

                // Redirect to Home page
                router.push("/"); // Change this to the path of your Home page

                console.log(result);
            } else {
                console.error(result);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <React.Fragment>
            <div className={classes.formContainer}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />

                    <Box
                        sx={{
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            border: "solid rgba(0, 0, 0, 0.23) 1px",
                            borderRadius: "0.4rem",
                            padding: "3rem",
                        }}
                    >
                        <Avatar
                            sx={{
                                height: "5rem",
                                width: "5rem",
                                mb: 3,
                            }}
                        >
                            <Image src="/images/logo.png" height="128px" width="128px" alt="Logo" />
                        </Avatar>

                        <Typography component="h1" variant="h5" sx={{ mb: 5 }}>
                            ExamGuard App
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                name="usernameOrEmail"
                                id="usernameOrEmail"
                                value={usernameOrEmail}
                                label="Username or Email"
                                onChange={handleInputChange}
                                type="text"
                                margin="normal"
                                required
                                fullWidth
                                autoFocus
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
                            />

                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                                Sign In
                            </Button>
                        </Box>
                    </Box>

                    {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
                </Container>
            </div>
            {/* <div className={classes.footerContainer}>
        <Footer />
      </div> */}
        </React.Fragment>
    );
};

export default LoginForm;
