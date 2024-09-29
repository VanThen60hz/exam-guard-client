import React, { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
// import { createUser } from "../../helpers/api/user-api"; // Adjust the import based on your API helper

const CreateUserPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        role: "",
        password: "",
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
        //     const response = await createUser(formData); // Call your API to create a user
        //     if (response.status === 201) {
        //         toast.success("User created successfully!");
        //         // Optionally redirect or reset the form
        //         setFormData({
        //             username: "",
        //             name: "",
        //             email: "",
        //             role: "",
        //             password: "",
        //         });
        //     } else {
        //         throw new Error("Failed to create user");
        //     }
        // } catch (err) {
        //     setError(err.message);
        //     toast.error(err.message || "Error creating user");
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Create User
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField label="Username" name="username" value={formData.username} onChange={handleInputChange} fullWidth required margin="normal" />
                <TextField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} fullWidth required margin="normal" />
                <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} fullWidth required margin="normal" />
                <TextField label="Role" name="role" value={formData.role} onChange={handleInputChange} fullWidth required margin="normal" />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? "Creating..." : "Create User"}
                </Button>
            </form>
        </Container>
    );
};

export default CreateUserPage;
