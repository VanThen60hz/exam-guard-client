import React, { useRef, useState } from "react";
// import { getUsers } from "../helpers/api/user-api"; // Adjust the import based on your API helper
// import { User } from "../models/user-models"; // Adjust the import based on your User model
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import NavBarDashboard from "../../components/dashboard/navbar-dashboard";
import NavBarHome from "../../components/home/navbar-home";
import { LoadingBarRef } from "react-top-loading-bar";

const UsersPage: React.FC = () => {
    const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null); // Move this to the top
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchUsers = async () => {
    //         try {
    //             const response = await getUsers(); // Fetch users from your API
    //             setUsers(response);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchUsers();
    // }, []);

    const users = [
        {
            _id: "1",
            username: "john_doe",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "admin",
            avatar: "https://example.com/john_doe.jpg",
            gender: "male",
            ssn: 123456789,
            phone_number: "123-456-7890",
            createdAt: "2022-01-01T00:00:00.000Z",
            updatedAt: "2022-01-01T00:00:00.000Z",
            accessToken: "access_token_1",
            refreshToken: "refresh_token_1",
            userId: "1",
        },
        {
            _id: "2",
            username: "jane_doe",
            name: "Jane Doe",
            email: "jane.doe@example.com",
            role: "user",
            avatar: "https://example.com/jane_doe.jpg",
            gender: "female",
            ssn: 987654321,
            phone_number: "987-654-3210",
            createdAt: "2022-01-02T00:00:00.000Z",
            updatedAt: "2022-01-02T00:00:00.000Z",
            accessToken: "access_token_2",
            refreshToken: "refresh_token_2",
            userId: "2",
        },
    ];

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <Container>
                <h1>User List</h1>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user._id}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
};

export default UsersPage;
