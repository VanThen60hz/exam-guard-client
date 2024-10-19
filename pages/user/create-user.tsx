import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Button, Container, CssBaseline, TextField, Typography, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Avatar, Link as MuiLink, InputLabel, Select, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import Link from "next/link";
import styles from './create-user.module.scss';
import { createUser } from "../../helpers/api/user-api";
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { SelectChangeEvent } from '@mui/material/Select';
import NavBarHome from "../../components/home/navbar-home";
import axios from 'axios';

interface FormData  {
  username: string;
  password: string;
  name: string;
  email: string;
  dob: string;
  address: string;
  phone_number: string;
  role: string;
  gender: string;
  avatar: string;
  ssn: number;
  status: string;
};

type Errors = {
  username?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  email?: string;
  dob?: string;
  address?: string;
  phone_number?: string;
  avatar?: string;
  ssn?: string;
};

const CreateUserPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        name: '',
        email: '',
        dob: '',
        address: '',
        phone_number: '',
        role: '',
        gender: '',
        avatar: '',
        ssn: 0,
        status: 'ACTIVE',
    });
    const { data: session, status } = useSession();
    const [errors, setErrors] = useState<Errors>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const dateInputRef = useRef<HTMLInputElement>(null);
    const loadingBarRef = useRef(null);
    const [currentDateTime, setCurrentDateTime] = useState<string>("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Thêm useEffect để log session khi nó thay đổi
    useEffect(() => {
        console.log("Session:", session);
    }, [session]);

    useEffect(() => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        if (name === 'confirmPassword') {
            setConfirmPassword(value as string);
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
        setPasswordError('');
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prevState => ({ ...prevState, }));
            setAvatarPreview(URL.createObjectURL(file));
            setErrors(prevErrors => ({
                ...prevErrors,
                avatar: '' // Xóa lỗi khi người dùng chọn file
            }));
        }
    };
    const handleAvatarUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.split(".")[0]; // Lấy tên file để kiểm tra sự tồn tại
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default"); // Thay thế bằng upload_preset từ Cloudinary
        formData.append("folder", "imageUser"); // Thêm vào thư mục cụ thể

        try {
            setLoading(true); // Bắt đầu quá trình tải lên

            // Tải ảnh mới lên Cloudinary
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/duv0ugc5x/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error uploading avatar: ${errorText}`);
            }

            const data = await response.json();
            const imgUrl: string = data.secure_url;

            setFormData((prevState) => ({
                ...prevState,
                avatar: imgUrl,
            }));

            toast.success("Avatar uploaded successfully!");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error("Failed to upload avatar.");
        } finally {
            setLoading(false); // Kết thúc quá trình tải lên
        }
    };

    const handleSelectChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: Errors = {};

        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.password) newErrors.password = 'Password is required';

        // Chỉ kiểm tra confirmPassword nếu password đã được nhập
        if (formData.password && !confirmPassword) {
            newErrors.confirmPassword = 'Confirm Password is required';
        } else if (formData.password && confirmPassword && formData.password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.dob) newErrors.dob = 'Date of Birth is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.phone_number) newErrors.phone_number = 'Phone Number is required';
        if (!formData.ssn) newErrors.ssn = 'Social Security Number is required';

        setErrors(newErrors);

        // Tiếp tục xử lý submit nếu không có lỗi
        if (Object.keys(newErrors).length === 0) {
            try {
                if (!session || !session.accessToken) {
                    throw new Error("User is not authenticated");
                }
                const userData = {
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                    dob: formData.dob,
                    address: formData.address,
                    phone_number: formData.phone_number,
                    role: formData.role,
                    gender: formData.gender,
                    ssn: formData.ssn,
                    status: formData.status,
                    avatar: formData.avatar,
                };
                const response = await createUser(
                    session.userId,
                    session.accessToken,
                    userData
                );
                toast.success("User created successfully!");
            } catch (err: any) {
                if (err.response && err.response.data) {
                    const serverErrors = err.response.data;
                    if (serverErrors.username) newErrors.username = "Username already exists";
                    if (serverErrors.email) newErrors.email = "Email already exists";
                    if (serverErrors.phone_number) newErrors.phone_number = "Phone number is already in use";
                    if (serverErrors.ssn) newErrors.ssn = "SSN already exists";
                    setErrors(newErrors);
                } else {
                    setError(err.message || "Error creating user");
                    toast.error(err.message || "Error creating user");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <Container>
                <div
                    style={{
                        marginTop: "155px",
                        display: "flex",
                        justifyContent: "flex-start", // Đưa thời gian về bên trái
                        alignItems: "center",
                    }}
                >
                    <div className={styles.dateTime}>
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
                </div>

                <React.Fragment>
                    <div>
                        <Container component="main" sx={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
                            <CssBaseline />
                            <Box
                                sx={{
                                    border: '2px solid #ccc', // Đường viền dày hơn
                                    borderRadius: '10px', // Bo góc
                                    padding: '15px', // Giảm padding bên trong
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Đổ bóng đậm hơn
                                    marginTop: '20px', // Khoảng cách từ trên
                                    width: '100%', // Chiếm toàn bộ chiều rộng
                                }}
                            >
                                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700 }}>
                                    Create User
                                </Typography>
                                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={8}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sx={{ marginBottom: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        Username <span style={{ color: 'red' }}>*</span>
                                                    </Typography>
                                                    <TextField
                                                        name="username"
                                                        required
                                                        fullWidth
                                                        id="username"
                                                        label="" // Giữ label nếu bạn muốn hiển thị trong ô nhập
                                                        className={`${styles.inputField} ${errors.username ? styles.errorField : ''}`}
                                                        onChange={handleInputChange}
                                                        error={!!errors.username}
                                                    />
                                                    {errors.username && (
                                                        <Typography variant="body2" sx={{ color: 'red' }}>
                                                            {errors.username}
                                                        </Typography>
                                                    )}
                                                </Grid>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6} sx={{ marginBottom: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1, marginLeft: '14px' }}>
                                                            Password <span style={{ color: 'red' }}>*</span>
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            name="password"
                                                            type="password"
                                                            label=""
                                                            id="password"
                                                            className={`${styles.inputField} ${errors.password ? styles.errorField : ''}`}
                                                            onChange={handleInputChange}
                                                            sx={{ marginLeft: 2, marginTop: 0 }} // Giảm khoảng cách
                                                        />
                                                        {errors.password && (
                                                            <Typography variant="body2" sx={{ color: 'red' }}>
                                                                {errors.password}
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                    <Grid item xs={6} sx={{ marginBottom: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1, marginLeft: '14px' }}>
                                                            Confirm Password <span style={{ color: 'red' }}>*</span>
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            name="confirmPassword"
                                                            type="password"
                                                            label=""
                                                            id="confirmPassword"
                                                            value={confirmPassword}
                                                            className={`${styles.inputField} ${errors.confirmPassword ? styles.errorField : ''}`}
                                                            onChange={handleInputChange}
                                                            sx={{ marginLeft: 1, marginTop: 0 }} // Giảm khoảng cách
                                                        />
                                                        {errors.confirmPassword && (
                                                            <Typography variant="body2" sx={{ color: 'red' }}>
                                                                {errors.confirmPassword}
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Cột chứa Avatar và nút Upload */}
                                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Avatar src={ formData.avatar} sx={{ width: 130, height: 130, marginBottom: 2 }} /> {/* Giảm kích thước Avatar */}
                                                <Button
                                                    variant="contained"
                                                    component="label"
                                                    sx={{
                                                        backgroundColor: '#fff',
                                                        padding: '5px 10px', // Giảm padding
                                                        minWidth: 'unset',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        textTransform: 'none',
                                                        color: 'green',
                                                        border: '2px solid #28a745',
                                                        fontSize: '14px',
                                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                            backgroundColor: '#fff'
                                                        }
                                                    }}
                                                >
                                                    <Image src="/images/vector.png" alt="Upload Icon" width={20} height={20} /> {/* Giảm kích thước icon */}
                                                    Upload Image
                                                    <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarUpload}  // Gọi hàm handleAvatarUpload
    />
                                                </Button>
                                                {errors.avatar && (
                                                    <Typography variant="body2" sx={{ color: 'red', marginTop: 1 }}>
                                                        {errors.avatar}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sx={{ marginBottom: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
                                                Name <span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField
                                                required
                                                fullWidth
                                                name="name"
                                                id="name"
                                                className={`${styles.inputField} ${errors.name ? styles.errorField : ''}`}
                                                onChange={handleInputChange}
                                            />
                                            {errors.name && (
                                                <Typography variant="body2" sx={{ color: 'red' }}>
                                                    {errors.name}
                                                </Typography>
                                            )}
                                        </Grid>
                                        <Grid item xs={6} sx={{ marginBottom: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: 1 }}>
                                                Email <span style={{ color: 'red' }}>*</span>
                                            </Typography>
                                            <TextField
                                                required
                                                fullWidth
                                                name="email"
                                                id="email"
                                                className={`${styles.inputField} ${errors.email ? styles.errorField : ''}`}
                                                onChange={handleInputChange}
                                            />
                                            {errors.email && (
                                                <Typography variant="body2" sx={{ color: 'red' }}>
                                                    {errors.email}
                                                </Typography>
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend" sx={{ fontWeight: 600 }}>Role:</FormLabel>
                                                <RadioGroup
                                                    aria-label="role"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                    sx={{ display: "flex", flexDirection: "row" }}
                                                >
                                                    <FormControlLabel value="TEACHER" control={<Radio />} label="Teacher" />
                                                    <FormControlLabel value="STUDENT" control={<Radio />} label="Student" />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6} sx={{ marginBottom: 1, paddingLeft: 3 }}> {/* Thêm paddingLeft để đẩy qua bên phải */}
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend" sx={{ fontWeight: 600 }}>Gender:</FormLabel>
                                                <RadioGroup
                                                    aria-label="gender"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    sx={{ display: "flex", flexDirection: "row" }}
                                                >
                                                    <FormControlLabel value="MALE" control={<Radio />} label="Male" />
                                                    <FormControlLabel value="FEMALE" control={<Radio />} label="Female" />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={4} sx={{ marginBottom: 2 }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="status-label">Status</InputLabel>
                                                <Select
                                                    labelId="status-label"
                                                    id="status"
                                                    name="status"
                                                    value={formData.status}
                                                    label="Status"
                                                    onChange={handleSelectChange}
                                                >
                                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                                                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={4} sx={{ marginBottom: 2 }}>
                                            <TextField
                                                name="dob"
                                                fullWidth
                                                required
                                                id="dob"
                                                label="Date of Birth"
                                                type="date"
                                                InputLabelProps={{
                                                    shrink: true, // Đảm bảo nhãn không bị che khuất
                                                }}
                                                className={`${styles.inputField} ${errors.dob ? styles.errorField : ''}`}
                                                onChange={handleInputChange}
                                                inputRef={dateInputRef}
                                            />
                                            {errors.dob && (
                                                <Typography variant="body2" sx={{ color: 'red' }}>
                                                    {errors.dob}
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={4} sx={{ marginBottom: 2 }}>
                                            <TextField
                                                name="ssn"
                                                fullWidth
                                                required
                                                id="ssn"
                                                label="SSN"
                                                className={`${styles.inputField} ${errors.ssn ? styles.errorField : ''}`}
                                                onChange={handleInputChange}
                                                error={!!errors.ssn}
                                            />
                                            {errors.ssn && (
                                                <Typography variant="body2" sx={{ color: 'red' }}>
                                                    {errors.ssn}
                                                </Typography>
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sx={{ marginBottom: 2 }}>
                                            <TextField
                                                name="phone_number"
                                                fullWidth
                                                required
                                                id="phone_number"
                                                label="Phone Number"
                                                className={`${styles.inputField} ${errors.phone_number ? styles.errorField : ''}`}
                                                onChange={handleInputChange}
                                                error={!!errors.phone_number}
                                            />
                                            {errors.phone_number && (
                                                <Typography variant="body2" sx={{ color: 'red' }}>
                                                    {errors.phone_number}
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={6} sx={{ marginBottom: 2 }}>
                                            <TextField
                                                name="address"
                                                fullWidth
                                                id="address"
                                                label="Address"
                                                className={`${styles.inputField} ${errors.address ? styles.errorField : ''}`}
                                                onChange={handleInputChange}
                                            />
                                            {errors.address && (
                                                <Typography variant="body2" sx={{ color: 'red' }}>
                                                    {errors.address}
                                                </Typography>
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Box display="flex" justifyContent="flex-end" alignItems="center"> {/* Thay đổi justifyContent thành flex-end */}
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            sx={{
                                                width: "300px",
                                                backgroundColor: "#22b9b7",
                                                color: "#fff",
                                                fontWeight: "bold",
                                                textTransform: "none",
                                                borderRadius: "10px",
                                                "&:hover": {
                                                    backgroundColor: "#218838",
                                                },
                                            }}
                                        >
                                            Create
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Container>
                    </div>
                </React.Fragment>
            </Container>
        </>
    );
};

export default CreateUserPage;