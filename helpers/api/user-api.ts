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

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to signin user!");
        }

        return data;
    } catch (e) {
        throw new Error(e.message || "Failed to signin user!");
    }
};

const submitExam = async (
    studentId: string,
    examId: string,
    answers: string[],
    token: string
) => {
    try {
        const res = await fetch(`${BASE_URL}/submitExam/${studentId}`, {
            method: "POST",
            body: JSON.stringify({ examId, answers }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to submit exam!");
        }

        return data;
    } catch (e) {
        throw e;
    }
};

export { getUser, submitExam };

const getUserProfile = async (token: string) => {
    try {
        const res = await fetch(`${BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to get user profile!");
        }

        return data;
    } catch (e) {
        throw e;
    }
};

export { getUserProfile };
