import React, { useRef, useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
import NavBarHome from "../../components/home/navbar-home";
import { LoadingBarRef } from "react-top-loading-bar";
// import { updateUser } from "../../helpers/api/user-api"; // Điều chỉnh import dựa trên API helper của bạn

const ProfilePage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        role: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // e.preventDefault();
        // setLoading(true);
        // setError(null);
        // try {
        //     const response = await updateUser(formData); // Gọi API để cập nhật thông tin người dùng
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

    const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <Container>
                <Typography variant="h4" gutterBottom>
                    User Profile
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField label="Username" name="username" value={formData.username} onChange={handleInputChange} fullWidth required margin="normal" />
                    <TextField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} fullWidth required margin="normal" />
                    <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} fullWidth required margin="normal" />
                    <TextField label="Role" name="role" value={formData.role} onChange={handleInputChange} fullWidth required margin="normal" />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                    </Button>
                </form>
            </Container>
        </>
    );
};

export default ProfilePage;
