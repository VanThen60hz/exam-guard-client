import { BASE_URL } from "../../constants";

// const getExam = async (studentId: string, examId: string, token: string) => {
//   try {
//     const res = await fetch(`${BASE_URL}/${studentId}/exam/${examId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await res.json();

//     if (!res.ok || data.err) {
//       throw new Error(data.err || "Failed to get exam from server!");
//     }

//     return data;
//   } catch (e) {
//     throw e;
//   }
// };

const getAssignedExams = async (userId: string, token: string) => {
    // TODO: handle res.json() error when response not in json

    try {
        const res = await fetch(`${BASE_URL}/${userId}/assignedExams/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok || data.err) {
            throw new Error(
                data.err || "Failed to get assigned exams from server!"
            );
        }

        return data.exams;
    } catch (e) {
        throw e;
    }
};

const getExam = async (id: string, accessToken: string, examId: string) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/${examId}`, {
            method: "GET",
            headers: myHeaders,
        });

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get exam!");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get exam!");
    }
};

const getListExam = async (
    id: string,
    accessToken: string,
    page: number,
    limit: number
) => {
    try {
        console.log("User ID:", id);
        console.log("Access Token:", accessToken);

        // Create a Headers object
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/exam/list?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get list!");
        }

        return data.metadata.exams;
    } catch (e) {
        throw new Error(e.message || "Failed to get list exam!");
    }
};

const getListQuestion = async (
    id: string,
    accessToken: string,
    examId: string,
    page: number,
    limit: number
) => {
    try {
        console.log("User ID:", id);
        console.log("Access Token:", accessToken);

        // Create a Headers object
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/question/${examId}/list?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get list!");
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get list question!");
    }
};

const searchExam = async (id: string, accessToken: string, query: string) => {
    try {
        console.log("User ID:", id);
        console.log("Access Token:", accessToken);
        console.log("Search Query:", query);

        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || "");
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/exam/search?query=${encodeURIComponent(query)}`,
            {
                method: "GET",
                headers: myHeaders,
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to search exam!");
        }

        return data.metadata.exams;
    } catch (e) {
        throw new Error(e.message || "Failed to search exam!");
    }
};

const deleteExam = async (
    id: string,
    accessToken: string,
    examId: string,
    examData: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/${examId}`, {
            method: "DELETE",
            headers: myHeaders,
            body: JSON.stringify(examData),
        });

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to delete exam!");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to delete exam!");
    }
};

const createExam = async (id: string, accessToken: string, exam: any) => {
    try {
        console.log("Creating user with ID:", id);
        console.log("Access Token:", accessToken);

        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/create`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(exam),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create exam!");
        }

        return data.metadata;
    } catch (e) {
        console.error("Error in createExam:", e);
        throw e;
    }
};

const updateExam = async (
    id: string,
    accessToken: string,
    examId: string,
    examData: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/${examId}`, {
            method: "PATCH",
            headers: myHeaders,
            body: JSON.stringify(examData),
        });

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to update exam!");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to update exam!");
    }
};

const createQuestion = async (
    id: string,
    accessToken: string,
    examId: string,
    questionData: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id); // Thêm dòng này để sử dụng id làm client ID
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/question/${examId}/create`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(questionData),
        });

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to create question!");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to create question!");
    }
};

const getExamsByStatus = async (
    id: string,
    accessToken: string,
    status: string,
    page: number,
    limit: number
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || "");
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/exam/list?status=${encodeURIComponent(
                status
            )}&page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders,
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get exams by status!");
        }

        return data.metadata.exams;
    } catch (e) {
        throw new Error(e.message || "Failed to get exams by status!");
    }
};
const getExamById = async (
    examId: string,
    userId: string,
    accessToken: string
) => {
    try {
        console.log("Exam ID:", examId);
        console.log("Access Token:", accessToken);

        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", userId || ""); // Use the user ID as the client ID

        // Gọi API với đường dẫn đúng
        const res = await fetch(`${BASE_URL}/exam/${examId}`, {
            method: "GET",
            headers: myHeaders,
        });

        console.log("Response Status:", res.status); // Log trạng thái phản hồi
        const data = await res.json();
        console.log("Response Data:", data); // Log toàn bộ dữ liu phản hồi

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to get exam from server!");
        }

        return data.metadata; // Trả về dữ liệu bài kiểm tra
    } catch (e) {
        throw new Error(e.message || "Failed to get exam from server!");
    }
};

// Di chuyển hàm getQuestionsByExamId vào đây
const listQuestions = async (
    examId: string,
    userId: string,
    accessToken: string,
    page: number,
    limit: number
) => {
    try {
        console.log("Exam ID:", examId);
        console.log("Access Token:", accessToken);

        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", userId || ""); // Use the user ID as the client ID

        // Gọi API với đường dẫn đúng và thêm tham số phân trang
        const res = await fetch(
            `${BASE_URL}/question/${examId}/list?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders,
            }
        );

        console.log("Response Status:", res.status); // Log trạng thái phản hồi
        const data = await res.json();
        console.log("Response Data:", data); // Log toàn bộ dữ liu phản hồi

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to get questions from server!");
        }

        return data.metadata; // Trả về dữ liệu bài kiểm tra
    } catch (e) {
        throw new Error(e.message || "Failed to get questions from server!");
    }
};
const updateQuestion = async (
    examId: string,
    questionId: string,
    userId: string,
    accessToken: string,
    questionData: any // Consider defining a specific interface for questionData
) => {
    try {
        console.log("Access Token:", accessToken);

        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", userId);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/question/${examId}/${questionId}`,
            {
                method: "PATCH",
                headers: myHeaders,
                body: JSON.stringify(questionData),
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to create question!");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to create question!");
    }
};

const deleteQuestion = async (
    examId: string,
    questionId: string,
    userId: string,
    accessToken: string
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", userId);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/question/${examId}/${questionId}`,
            {
                method: "DELETE",
                headers: myHeaders,
            }
        );

        const data = await res.json();

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to delete question!");
        }

        return data.metadata; // Return any relevant data if needed
    } catch (e) {
        throw new Error(e.message || "Failed to delete question!");
    }
};

const searchQuestions = async (
    id: string,
    accessToken: string,
    examId: string,
    query: any
) => {
    try {
        console.log("Exam ID:", examId);
        console.log("Access Token:", accessToken);
        console.log("Search Query:", query);

        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || ""); // Use examId as the client ID
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/question/${examId}/search?query=${encodeURIComponent(
                query
            )}`,
            {
                method: "GET",
                headers: myHeaders,
            }
        );

        console.log("Response Status:", res.status); // Log the response status
        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to search questions!");
        }

        return data.metadata.questions; // Assuming the response contains a list of questions
    } catch (e) {
        throw new Error(e.message || "Failed to search questions!");
    }
};

export {
    getExam,
    getAssignedExams,
    searchExam,
    getListExam,
    deleteExam,
    createExam,
    updateExam,
    createQuestion,
    getExamsByStatus,
    getListQuestion,
    getExamById,
    listQuestions,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
};
