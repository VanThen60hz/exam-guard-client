import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Avatar,
    Grid,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { toast } from "react-toastify";
import classes from "./profileUser.module.scss";
import { getUserProfile } from "../../helpers/api/user-api";
import NavBarHome from "../../components/home/navbar-home";
import { LoadingBarRef } from "react-top-loading-bar";
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    gender: string;
    dateOfBirth: string;
    address: string;
    phoneNumber: string;
    avatarUrl: string;
}

const UpdateProfileUserPage: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState<string>("");

    const [formData, setFormData] = useState<User>({
        id: 0,
        name: "",
        email: "",
        role: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        phoneNumber: "",
        avatarUrl: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingBarRef = useRef<LoadingBarRef>(null);

    useEffect(() => {
        // Cập nhật ngày giờ mỗi giây
        const intervalId = setInterval(() => {
            const now = new Date();
            const formattedDate = now.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            const formattedTime = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
            setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
        }, 1000);

        // Fetch user profile data when component mounts
        // fetchUserProfile();

        return () => clearInterval(intervalId);
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");
            const response = await getUserProfile(token);
            setFormData(response);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Error fetching user profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // e.preventDefault();
        // setLoading(true);
        // setError(null);
        // try {
        //     const token = localStorage.getItem("token");
        //     if (!token) throw new Error("No token found");
        //     const response = await updateUserProfile(token, formData);
        //     if (response.status === 200) {
        //         toast.success("Profile updated successfully!");
        //     } else {
        //         throw new Error("Failed to update profile");
        //     }
        // } catch (err: any) {
        //     setError(err.message);
        //     toast.error(err.message || "Error updating profile");
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleButtonClick = () => {
        // Navigate programmatically if needed
        // If using Next.js, you can use router.push('/user/profile')
    };

    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <Container>
                <div style={{ marginTop: "155px" }}>
                    <Typography className={classes.dateTime}>
                        {currentDateTime}
                    </Typography>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={classes.updateProfileContainer}
                >
                    <Typography
                        variant="h4"
                        className={classes.updateProfileHeader}
                    >
                        Change Information
                    </Typography>
                    <Grid
                        sx={{
                            margin: "100px 0 0 90px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "880px",
                        }}
                        container
                    >
                        <Grid sx={{ width: "450px", padding: "0" }} item md={5}>
                            <TextField
                                className={classes.textField}
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                            <TextField
                                className={classes.textField}
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                margin="normal"
                                disabled
                            />
                            <TextField
                                className={classes.textField}
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                            <TextField
                                className={classes.textField}
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                className={classes.textField}
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                            <TextField
                                className={classes.textField}
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ marginLeft: "200px" }}>
                            <Avatar
                                src={"/images/avatar_mau.png"}
                                alt="User Avatar"
                                style={{
                                    width: "230px",
                                    height: "230px",
                                    border: "1px solid #000",
                                }}
                            />
                            <Button
                                className={classes.buttonUploadAvatar}
                                variant="contained"
                                component="label"
                            >
                                <p
                                    style={{
                                        paddingTop: "4px",
                                        fontFamily: "Lexend",
                                        fontSize: "16px",
                                        fontWeight: 400,
                                        color: "#229594",
                                        lineHeight: "normal",
                                    }}
                                >
                                    Upload New Avatar
                                </p>
                                <img src="/images/icon/uploadFile.svg" alt="" />
                            </Button>
                            <div className={classes.chooseGender}>
                                <p
                                    style={{
                                        fontFamily: "Lexend",
                                        fontSize: "20px",
                                        fontWeight: 400,
                                        color: "#229594",
                                    }}
                                >
                                    Choose Gender
                                </p>
                                <FormControl>
                                    <RadioGroup
                                        aria-labelledby="demo-radio-buttons-group-label"
                                        defaultValue="female"
                                        name="radio-buttons-group"
                                    >
                                        <FormControlLabel
                                            value="female"
                                            control={<Radio />}
                                            label="Female"
                                        />
                                        <FormControlLabel
                                            value="male"
                                            control={<Radio />}
                                            label="Male"
                                        />
                                        <FormControlLabel
                                            value="other"
                                            control={<Radio />}
                                            label="Other"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </Grid>
                        <div style={{ margin: "50px 0 " }}>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    fontFamily: "Lexend",
                                    marginLeft: "150px",
                                    width: "220px",
                                    fontSize: "20px",
                                    fontWeight: 400,
                                    borderRadius: "10px",
                                    backgroundColor: "#229594",
                                    ":hover": {
                                        backgroundColor: "#229594",
                                        opacity: "0.8",
                                    },
                                }}
                                onClick={handleButtonClick}
                            >
                                <a href="/user/profileUser">Cancel</a>
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    fontFamily: "Lexend",
                                    marginLeft: "90px",
                                    width: "220px",
                                    fontSize: "20px",
                                    fontWeight: 400,
                                    borderRadius: "10px",
                                    backgroundColor: "#229594",
                                    ":hover": {
                                        backgroundColor: "#229594",
                                        opacity: "0.8",
                                    },
                                }}
                                onClick={handleButtonClick}
                            >
                                <a href="/user/profileUser">Update Profile</a>
                            </Button>
                        </div>
                    </Grid>
                </form>
            </Container>
        </>
    );
};

export default UpdateProfileUserPage;
