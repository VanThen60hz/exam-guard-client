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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

import { toast } from "react-toastify";
import { LoadingBarRef } from "react-top-loading-bar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import NavBarHome from "../../components/home/navbar-home";
import { updateProfile } from "../../helpers/api/user-api";
import { saveID } from "./profileUser";

// SCSS
import classes from "./profileUser.module.scss";

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

const UpdateProfileUserPage: React.FC = () => {
    const [formData, setFormData] = useState<User>({
        id: `${saveID}`,
        name: "",
        email: "",
        role: "",
        gender: "",
        address: "",
        phone_number: "",
        avatarUrl: "",
    });

    //Biến thời gian
    const [currentDateTime, setCurrentDateTime] = useState<string>("");

    // Router chuyển Page
    const router = useRouter();

    // Load page
    const [loading, setLoading] = useState(false);
    const loadingBarRef = useRef<LoadingBarRef>(null);

    //Biến báo lỗi
    const [error, setError] = useState<string | null>(null);

    // Get session data
    const { data: session, status } = useSession();

    // Thêm state cho modal xác nhận cancel
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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

        return () => clearInterval(intervalId);
    }, []);

    // Mở modal khi nhấn nút Cancel
    const handleCancelButton = () => {
        setOpenConfirmDialog(true);
    };
    const handleCloseDialog = (confirm: boolean) => {
        setOpenConfirmDialog(false); // Đóng modal
        if (confirm) {
            router.push("/user/profileUser"); // Chuyển hướng nếu xác nhận
        }
    };

    // Xử lí thay đổi khi nhập vào TextField
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Xử lí thay đổi khi chọn Giới tính
    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData({ ...formData, gender: value });
    };

    // Xử lí thay đổi khi chọn Role user
    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData({ ...formData, role: value });
    };

    // Xử lí nút Cập nhật
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Ngăn không cho trang bị reload
        setLoading(true);
        setError(null);

        try {
            if (!session || !session.accessToken) {
                throw new Error("User is not authenticated");
            }

            const response = await updateProfile(
                session.userId,
                session.accessToken,
                formData
            ); // Gọi hàm updateUser với token và formData
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Error updating profile");
        } finally {
            setLoading(false);
        }
        console.log(formData);
    };

    // Hiển thị ra màn hình
    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />

            {/* Ngày giờ */}
            <Container>
                <div
                    className={classes.dateTime}
                    style={{ marginTop: "155px" }}
                >
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

                {/* Form submit */}
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
                        style={{
                            margin: "100px 0 0 90px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "880px",
                        }}
                        container
                    >
                        <Grid
                            style={{ width: "450px", padding: "0" }}
                            item
                            md={5}
                        >
                            <TextField
                                className={classes.textField}
                                label={`${saveID}`}
                                name="id"
                                value={`${saveID}`}
                                margin="normal"
                                disabled
                            />
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
                            />
                            {/* <TextField
                                className={classes.textField}
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            /> */}
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
                                name="phone_number"
                                value={formData.phone_number}
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

                            {/* Nút upload Avatar */}
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

                            <div
                                style={{
                                    display: "flex",
                                    gap: "40px",
                                    marginLeft: "-70px",
                                }}
                            >
                                {/* Radio button chọn Giới tính */}
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
                                            defaultValue="FEMALE"
                                            name="gender"
                                            onChange={handleGenderChange}
                                        >
                                            <FormControlLabel
                                                value="FEMALE"
                                                control={<Radio />}
                                                label="Female"
                                            />
                                            <FormControlLabel
                                                value="MALE"
                                                control={<Radio />}
                                                label="Male"
                                            />
                                            <FormControlLabel
                                                value="OTHER"
                                                control={<Radio />}
                                                label="Other"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </div>

                                {/* Radio button chọn Role user */}
                                <div className={classes.chooseGender}>
                                    <p
                                        style={{
                                            fontFamily: "Lexend",
                                            fontSize: "20px",
                                            fontWeight: 400,
                                            color: "#229594",
                                        }}
                                    >
                                        Choose Role
                                    </p>
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="demo-radio-buttons-group-label"
                                            defaultValue="TEACHER"
                                            name="role"
                                            onChange={handleRoleChange}
                                        >
                                            <FormControlLabel
                                                value="TEACHER"
                                                control={<Radio />}
                                                label="Teacher"
                                            />
                                            <FormControlLabel
                                                value="STUDENT"
                                                control={<Radio />}
                                                label="Student"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </div>
                        </Grid>

                        {/* Nút Cancel và Update */}
                        <div style={{ margin: "50px 0 " }}>
                            <Button
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                style={{
                                    marginLeft: "150px",
                                    padding: "5px 0",
                                }}
                                onClick={handleCancelButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={classes.button}
                                type="submit"
                                fullWidth
                                variant="contained"
                                style={{
                                    marginLeft: "90px",
                                    padding: "5px 0",
                                }}
                            >
                                Update Profile
                            </Button>
                        </div>
                    </Grid>
                </form>
            </Container>

            {/* Modal xác nhận Cancel*/}
            <Dialog
                open={openConfirmDialog}
                onClose={() => handleCloseDialog(false)}
            >
                <div
                    style={{
                        width: "500px",
                        padding: "20px 20px",
                        border: "3px solid #229594",
                    }}
                >
                    <DialogTitle
                        style={{
                            fontSize: "25px",
                        }}
                    >
                        Xác Nhận
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText
                            style={{
                                fontSize: "20px",
                            }}
                        >
                            Bạn có muốn thoát không?
                        </DialogContentText>
                    </DialogContent>

                    {/* Nút Hủy và Đồng ý */}
                    <DialogActions
                        style={{
                            gap: "10px",
                        }}
                    >
                        <Button
                            onClick={() => handleCloseDialog(false)}
                            color="primary"
                            sx={{
                                fontSize: "20px",
                                fontWeight: 400,
                                color: "#229594",
                                ":hover": {
                                    backgroundColor: "#229594",
                                    color: "#fff",
                                },
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={() => handleCloseDialog(true)}
                            color="primary"
                            sx={{
                                fontSize: "20px",
                                fontWeight: 400,
                                color: "#229594",
                                ":hover": {
                                    backgroundColor: "#229594",
                                    color: "#fff",
                                },
                            }}
                        >
                            Đồng Ý
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </>
    );
};

export default UpdateProfileUserPage;
