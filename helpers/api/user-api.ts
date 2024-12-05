import { useSession } from "next-auth/react";
import { BASE_URL } from "../../constants";

const getUser = async (id: string, password: string) => {
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({ usernameOrEmail: id, password }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        console.log("Response Status:", res.status); // Log the response status

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to signin user");
        }

        return data;
    } catch (e) {
        throw new Error(e.message || "Failed to signin user");
    }
};

const getListUser = async (
    id: string,
    accessToken: string,
    page: number,
    limit: number
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || "");

        const res = await fetch(
            `${BASE_URL}/user/list?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders,
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get list user");
        }

        return data.metadata.users;
    } catch (e) {
        throw new Error(e.message || "Failed to get list user");
    }
};

const getUserProfile = async (id: string, accessToken: string) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(`${BASE_URL}/user/profile`, {
            method: "GET",
            headers: myHeaders, // Use the Headers object
        });

        console.log("Get profile user successfully"); // Log the response status

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get user profile");
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get user profile");
    }
};

const updateProfile = async (id: string, accessToken: string, user: any) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || "");
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/user/profile`, {
            method: "PATCH",
            headers: myHeaders,
            body: JSON.stringify(user),
        });
        console.log("Update profile user successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get update profile");
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get user profile");
    }
};

const updateUser = async (
    id: string,
    accessToken: string,
    userId: string,
    userData: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/user/${userId}`, {
            method: "PATCH",
            headers: myHeaders,
            body: JSON.stringify(userData),
        });
        console.log("Update user successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to update user");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to update user");
    }
};

const deleteUser = async (
    id: string,
    accessToken: string,
    userId: string,
    userData: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/user/${userId}`, {
            method: "DELETE",
            headers: myHeaders,
            body: JSON.stringify(userData),
        });
        console.log("Delete user successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to delete user");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to update user");
    }
};

const searchUser = async (id: string, accessToken: string, query: string) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || "");
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/user/search?query=${encodeURIComponent(query)}`,
            {
                method: "GET",
                headers: myHeaders,
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to search user");
        }

        return data.metadata.users; // Assuming the response contains a list of users
    } catch (e) {
        throw new Error(e.message || "Failed to search user");
    }
};

const createUser = async (id: string, accessToken: string, user: any) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        console.log(
            "Request Headers:",
            Object.fromEntries(myHeaders.entries())
        );

        const res = await fetch(`${BASE_URL}/user/create`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(user),
        });

        console.log("Create user successfully");

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create user");
        }

        return data.metadata;
    } catch (e) {
        console.error("Failed to create user:", e);
        throw e;
    }
};

export {
    getUser,
    getUserProfile,
    updateProfile,
    updateUser,
    getListUser,
    deleteUser,
    searchUser,
    createUser,
};
