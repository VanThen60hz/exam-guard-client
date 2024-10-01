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
            throw new Error(data.message || "Failed to signin user!");
        }

        return data;
    } catch (e) {
        throw new Error(e.message || "Failed to signin user!");
    }
};

const getUserProfile = async (id: string, accessToken: string) => {
    try {
        console.log("User ID:", id);
        console.log("Access Token:", accessToken);

        // Create a Headers object
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(`${BASE_URL}/user/profile/${id}`, {
            method: "GET",
            headers: myHeaders, // Use the Headers object
        });

        console.log("Response Status:", res.status); // Log the response status

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get user profile!");
        }

        return data;
    } catch (e) {
        throw new Error(e.message || "Failed to get user profile!");
    }
};

export { getUser, getUserProfile };
