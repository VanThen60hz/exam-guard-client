import React, { useEffect, useRef, useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
import NavBarHome from "../../components/home/navbar-home";
import { LoadingBarRef } from "react-top-loading-bar";
import { getUserProfile } from "../../helpers/api/user-api";
import { useSession } from "next-auth/react";
// import { updateUser } from "../../helpers/api/user-api"; // Điều chỉnh import dựa trên API helper của bạn

const ProfilePage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        role: "",
    });

    const { data: session, status } = useSession(); // Get session data

    console.log("Session:", session);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (status === "authenticated") {
                const userId = session.userId; // Access userId from session
                const accessToken = session.accessToken; // Access accessToken from session

                if (userId && accessToken) {
                    try {
                        const profile = await getUserProfile(userId, accessToken); // Call getUserProfile with userId and accessToken
                        console.log("User Profile:", JSON.stringify(profile));
                        setFormData(profile); // Assuming profile contains the necessary fields
                    } catch (error) {
                        console.error("Error getting user profile:", error);
                    }
                }
            }
        };

        fetchUserProfile(); // Call the function to fetch user profile
    }, [status, session]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic here
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
                    <Button type="submit" variant="contained" color="primary">
                        Update Profile
                    </Button>
                </form>
            </Container>
        </>
    );
};

export default ProfilePage;
