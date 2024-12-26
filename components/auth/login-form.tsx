import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import classes from "./login-form.module.scss";
import { toast } from "react-toastify";
import { Box, Container } from "@mui/system";
import Image from "next/image"; // Ensure this import is present
import { LoadingBarRef } from "react-top-loading-bar";
import Visibility from "@mui/icons-material/Visibility"; // Eye icon
import VisibilityOff from "@mui/icons-material/VisibilityOff"; // Eye with slash icon
import LinearProgress from "@mui/material/LinearProgress";

interface LoginFormProps {
  loadingBarRef: React.RefObject<LoadingBarRef>;
}

type Errors = {
  id?: string;
  password?: string;
};

const LoginForm: React.FC<LoginFormProps> = ({ loadingBarRef }) => {
  const router = useRouter();

  const [formData, setData] = useState({
    id: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const { id, password } = formData;

  const handleInputChange = (e: any) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: "",
    }));

    setData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors: Errors = {};

    if (!formData.id) newErrors.id = "Email or Username is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);

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

      //Dẫn tới trang khi đăng nhập thành công
      if (result.ok) {
        const updatedSession = await getSession();
        const userRole = updatedSession?.user?.role;

        if (userRole === "TEACHER") {
          router.replace("/exam/manage-exam");
        } else if (userRole === "ADMIN") {
          router.replace("/user/list-user");
        } else if (userRole === "STUDENT") {
          router.replace("/user/home-student");
        } else {
          throw new Error("Invalid role");
        }
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
      {loading && (
        <Box
          sx={{
            width: "100%",
            padding: "0 50px",
            position: "fixed",
            top: 50,
            left: 0,
            zIndex: 100,
          }}
        >
          <LinearProgress color="primary" />
        </Box>
      )}
      <Box
        className={classes.formContainer}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        style={{
          backgroundImage: "url(/images/bgr-3.jpg)",
          backgroundSize: "cover",
          height: "100vh",
        }}
      >
        <Container component="main">
          <CssBaseline />
          <div
            style={{
              zIndex: 2,
              background: "rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              padding: "10px",
              maxWidth: "1400px",
              height: "600px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className={`${classes.header}`} style={{ margin: "10px" }}>
              <Image
                src="/images/Logo-ExamGuard.svg"
                alt="Logo"
                width={200}
                height={80}
              />
              <Link href="/">
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{
                    color: "#229594",
                    borderRadius: "20px",
                    padding: "10px 20px",
                    fontWeight: 600,
                    borderColor: "#229594",
                    "&:hover": {
                      backgroundColor: "#ddfffe",
                      borderColor: "#229594",
                    },
                  }}
                >
                  <a style={{ textDecoration: "none", color: "inherit" }}>
                    Introduction
                  </a>
                </Button>
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "30px 45px",
              }}
            >
              <div>
                <Typography
                  style={{
                    color: "#1d5e5d",
                    fontFamily: "Lexend",
                    fontSize: "45px",
                    fontWeight: 700,
                    marginTop: "60px",
                  }}
                >
                  Welcome Back!
                </Typography>
                <Typography
                  style={{
                    marginTop: "60px",
                    width: "460px",
                    color: "#1d5e5d",
                    fontFamily: "Lexend",
                    fontSize: "35px",
                    fontWeight: 400,
                  }}
                >
                  Enter your personal details to use all of site features
                </Typography>
              </div>
              <div
                style={{
                  zIndex: 3,
                  background: "rgba(255, 255, 255, 0.3)",
                  borderRadius: "10px",
                  padding: "20px 30px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
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
                </div>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ margin: "20px auto 20px", maxWidth: "325px" }}
                >
                  <TextField
                    name="id"
                    id="id"
                    value={id}
                    label="Email or Username"
                    onChange={handleInputChange}
                    type="text"
                    margin="normal"
                    required
                    fullWidth
                    autoFocus
                  />
                  {errors.id && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.id}
                    </Typography>
                  )}
                  <TextField
                    name="password"
                    id="password"
                    value={password}
                    label="Password"
                    onChange={handleInputChange}
                    type={showPassword ? "text" : "password"} // Điều khiển hiển thị mật khẩu
                    margin="normal"
                    required
                    fullWidth
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleShowPassword}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {errors.password && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.password}
                    </Typography>
                  )}              
                  <Button
                    className={classes.btnGreen}
                    type="submit"
                    fullWidth
                    variant="contained"
                    // style chỉnh đây
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      marginTop: "20px",
                    }}
                    onClick={handleSubmit}
                  >
                    Sign In
                  </Button>
                </Box>
              </div>
            </div>
          </div>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default LoginForm;
