import React, { useState, useEffect } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Avatar,
} from "@mui/material";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import classes from "./profileUser.module.scss";
import { getUserProfile } from "../../helpers/api/user-api";
import NavBarHome from "../../components/home/navbar-home";
import { LoadingBarRef } from "react-top-loading-bar";
import { useRef } from "react";
import { useSession } from "next-auth/react";
// State cho ngày giờ hiện tại

// Định nghĩa kiểu dữ liệu cho user
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    gender: string;
    //dateOfBirth: string;
    address: string;
    phoneNumber: string;
    avatarUrl: string;
}

const ProfileUserPage: React.FC = () => {
    const router = useRouter();
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [formData, setFormData] = useState<User>({
        id: "",
        name: "",
        email: "",
        role: "",
        gender: "",
        address: "",
        phoneNumber: "",
        avatarUrl: "",
    });
    const formProfile = {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingBarRef = useRef(null);

    const { data: session, status } = useSession(); // Get session data

    // console.log("Session:", session);

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

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (status === "authenticated" && session) {
                const userId = session.userId;
                const accessToken = session.accessToken;

                if (userId && accessToken) {
                    setLoading(true);
                    try {
                        const profile = await getUserProfile(
                            userId,
                            accessToken
                        );
                        console.log("Profile:", profile);

                        // Ánh xạ các trường từ dữ liệu API vào formData
                        setFormData({
                            id: profile._id || "",
                            name: profile.name || "",
                            email: profile.email || "",
                            role: profile.role || "",
                            gender: profile.gender, // Ánh xạ giới tính
                            address: profile.address || "",
                            phoneNumber: profile.phone_number || "",
                            avatarUrl: profile.avatar || "", // Đảm bảo URL ảnh hợp lệ
                        });
                        console.log("FormData:", formProfile);
                    } catch (error) {
                        console.error("Error getting user profile:", error);
                        toast.error("Failed to fetch user profile");
                        setError(error.message);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        };

        fetchUserProfile(); // Call the function to fetch user profile
    }, [status, session]);

    const handleChangePasswordButton = () => {
        saveID = formData.id;
        router.push(`/user/changePassword`);
        return saveID;
    };

    const handleButtonClick = () => {
        saveID = formData.id;
        router.push(`/user/updateProfileUser`);
        return saveID;
    };

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            // ... (rest of the fetchUserProfile function)
            setIsLoading(false);
        };

        fetchUserProfile();
    }, [status, session]);

    // In your render method:
    if (isLoading) {
        return <div>Loading user profile...</div>;
    }

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
                            onClick={handleChangePasswordButton}
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
                                <p>{formData.name}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Gender: </p>
                                <p>{formData.gender}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Role: </p>
                                <p>{formData.role}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Email: </p>
                                <p>{formData.email}</p>
                            </div>
                            {/* <div className={classes.profileItem}>
                                <p>Date of birth: </p>
                                <p>{formData.dateOfBirth}</p>
                            </div> */}
                            <div className={classes.profileItem}>
                                <p>Address: </p>
                                <p>{formData.address}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Phone number: </p>
                                <p>{formData.phoneNumber}</p>
                            </div>
                        </div>
                        <div className={classes.profileAvatar}>
                            <Avatar
                                style={{
                                    width: "230px",
                                    height: "230px",
                                    border: "1px solid #000",
                                }}
                                src={formData.avatarUrl}
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
                        Update Profile
                    </Button>
                </div>
            </Container>
        </>
    );
};
export let saveID: string;
export default ProfileUserPage;
