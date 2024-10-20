import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Avatar,
    Modal,
    Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import NavBarHome from "../../components/home/navbar-home";
import { getUserProfile, updateProfile } from "../../helpers/api/user-api";

// SCSS
import classes from "./profileUser.module.scss";

// Định nghĩa kiểu dữ liệu cho user
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    gender: string;
    address: string;
    phone_number: string;
    avatarUrl: string;
}

const ProfileUserPage: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [formData, setFormData] = useState<User>({
        id: "",
        name: "",
        email: "",
        role: "",
        gender: "",
        address: "",
        phone_number: "",
        avatarUrl: "",
    });

    // Thay đổi mật khẩu
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Router chuyển page
    const router = useRouter();

    // Load trang
    const [loading, setLoading] = useState(false);
    const loadingBarRef = useRef(null);

    // Báo lỗi
    const [error, setError] = useState<string | null>(null);

    // Get session data
    const { data: session, status } = useSession();

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

    // Lấy thông tin người dung
    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setLoading(false);

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
                        console.log("Profile:", profile.password);

                        setFormData({
                            id: profile._id || "",
                            name: profile.name || "",
                            email: profile.email || "",
                            role: profile.role || "",
                            gender: profile.gender,
                            address: profile.address || "",
                            phone_number: profile.phone_number || "",
                            avatarUrl:
                                profile.avatar || "/images/default-avatar.png",
                        });

                        console.log("Form Data:", formData);
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

    // Nút bấm cập nhật thông tin
    const handleUpdateButton = () => {
        saveID = formData.id;
        router.push("/user/updateProfileUser");
        return saveID;
    };

    // Nút bấm đổi mật khẩu
    const handleOpenPasswordModal = () => setOpenPasswordModal(true);
    const handleClosePasswordModal = () => {
        setOpenPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        // if (oldPassword !== formData.password) {
        //     toast.error("Old password is incorrect");
        //     return;
        // }
        setLoading(true);
        setError(null);

        try {
            if (!session || !session.accessToken) {
                throw new Error("User is not authenticated");
            }

            const response = await updateProfile(
                session.userId,
                session.accessToken,
                { password: newPassword }
            ); // Gọi hàm updateUser với token và formData
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Error updating profile");
        } finally {
            setLoading(false);
        }
        console.log(formData);
        console.log("Changing password...");

        handleClosePasswordModal();
    };

    if (loading) {
        return <div>Loading user profile...</div>;
    }

    //Hiển thị ra màn hình
    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <Container>
                <div
                    style={{
                        marginTop: "155px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Hiển thị ngày giờ hiện tại */}
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

                    {/* Nút bấm đổi mật khẩu */}
                    <div>
                        <Button
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            style={{
                                width: "250px",
                            }}
                            onClick={handleOpenPasswordModal}
                        >
                            Change Password
                        </Button>
                    </div>
                </div>

                {/* Cửa sổ thông tin người dùng */}
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
                            <div className={classes.profileItem}>
                                <p>Address: </p>
                                <p>{formData.address}</p>
                            </div>
                            <div className={classes.profileItem}>
                                <p>Phone number: </p>
                                <p>{formData.phone_number}</p>
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

                    {/* Nút thay đổi thông tin người dùng */}
                    <Button
                        className={classes.button}
                        fullWidth
                        variant="contained"
                        style={{
                            margin: "34px 0 26px 90px",
                            padding: "5px 0",
                        }}
                        onClick={handleUpdateButton}
                    >
                        Update Profile
                    </Button>
                </div>

                {/* Cửa sổ đổi mật khẩu */}
                <Modal
                    open={openPasswordModal}
                    onClose={handleClosePasswordModal}
                    aria-labelledby="change-password-modal"
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 400,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" component="h2" gutterBottom>
                            Change Password
                        </Typography>
                        <TextField
                            fullWidth
                            type="password"
                            label="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleChangePassword}
                            sx={{ mt: 2 }}
                        >
                            Change Password
                        </Button>
                    </Box>
                </Modal>
            </Container>
        </>
    );
};
export let saveID: string;
export default ProfileUserPage;
