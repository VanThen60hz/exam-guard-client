import React, { useState, useEffect } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Avatar,
} from "@mui/material";
import { toast } from "react-toastify";
import classes from "./profileUser.module.scss";
import { getUserProfile } from "../../helpers/api/user-api";
import NavBarHome from "../../components/home/navbar-home";
import { LoadingBarRef } from "react-top-loading-bar";
import { useRef } from "react";
// State cho ngày giờ hiện tại

// Định nghĩa kiểu dữ liệu cho user
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

const ProfileUserPage: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        role: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        phoneNumber: "",
        avatarUrl: "",
    });

    // Tạo đối tượng user mẫu
    const sampleUser: User = {
        id: 1,
        name: "Nguyễn Văn A",
        gender: "Nam",
        role: "Học sinh",
        email: "nguyenvana@example.com",
        dateOfBirth: "2000-01-01",
        address: "123 Đường A, Quận B, TP.HCM",
        phoneNumber: "0987654321",
        avatarUrl: "/images/avatar_mau.png",
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingBarRef = useRef(null);

    useEffect(() => {
        // Cập nhật ngày giờ mỗi giây
        const intervalId = setInterval(() => {
            const now = new Date();

            // Định dạng ngày giờ theo dd/MM/YYYY, hh:mm:ss
            const formattedDate = now.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            const formattedTime = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true, // Thêm tùy chọn hour12 để hiển thị giờ theo 12 giờ và AM/PM
            });

            setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
        }, 1000); // Cập nhật mỗi giây

        // Clear interval khi component bị unmount
        return () => clearInterval(intervalId);
    }, []);
    // useEffect(() => {
    //     // Fetch user profile data when component mounts
    //     fetchUserProfile();
    // }, []);

    // const fetchUserProfile = async () => {
    //     setLoading(true);
    //     try {
    //         // Assume you have a way to get the user's token, e.g., from localStorage or a state management solution
    //         const token = localStorage.getItem("token");
    //         const response = await getUserProfile(token);
    //         setFormData(response);
    //     } catch (err) {
    //         setError(err.message);
    //         toast.error(err.message || "Error fetching user profile");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        // try {
        //     const response = await updateUserProfile(formData); // Implement this function to update user data
        //     if (response.status === 200) {
        //         toast.success("Profile updated successfully!");
        //     } else {
        //         throw new Error("Failed to update profile");
        //     }
        // } catch (err) {
        //     setError(err.message);
        //     toast.error(err.message || "Error updating profile");
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleButtonClick = () => {
        // Xử lý logic khi nút được nhấn
        console.log("Button clicked");
        // Thêm logic xử lý khác nếu cần
    };

    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <Container>
                {/* Hiển thị ngày giờ hiện tại */}
                <div
                    style={{
                        marginTop: "155px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div className={classes.dateTime}>
                        <Typography
                            style={{
                                fontFamily: "Lexend",
                                fontSize: "20px",
                                fontWeight: 400,
                                color: "#fff",
                            }}
                        >
                            {currentDateTime}
                        </Typography>
                    </div>
                    <div>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                fontFamily: "Lexend",
                                width: "250px",
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
                            Change Password
                        </Button>
                    </div>
                </div>

                <div className={classes.profileContainer}>
                    <div className={classes.profileHeader}>
                        <p>Information Account</p>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div className={classes.profileContent}>
                            <div className={classes.profileItem}>
                                <p>Full name: </p>
                                {/* <p>{formData.username}</p> */}
                                <p>{sampleUser.name}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Gender: </p>
                                {/* <p>{formData.gender}</p> */}
                                <p>{sampleUser.gender}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Role: </p>
                                {/* <p>{formData.role}</p> */}
                                <p>{sampleUser.role}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Email: </p>
                                {/* <p>{formData.email}</p> */}
                                <p>{sampleUser.email}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Date of birth: </p>
                                {/* <p>{formData.dateOfBirth}</p> */}
                                <p>{sampleUser.dateOfBirth}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Address: </p>
                                {/* <p>{formData.address}</p> */}
                                <p>{sampleUser.address}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Phone number: </p>
                                {/* <p>{formData.phoneNumber}</p> */}
                                <p>{sampleUser.phoneNumber}</p>
                            </div>
                        </div>
                        <div className={classes.profileAvatar}>
                            <Avatar
                                style={{
                                    width: "230px",
                                    height: "230px",
                                    border: "1px solid #000",
                                }}
                                src={sampleUser.avatarUrl}
                            />
                        </div>
                    </div>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            fontFamily: "Lexend",
                            margin: "34px 0 26px 90px",
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
                        <a href="/user/updateProfileUser">Update Profile</a>
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default ProfileUserPage;
