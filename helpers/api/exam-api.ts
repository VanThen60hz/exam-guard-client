import { BASE_URL } from "../../constants";

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
        console.log("Get exam successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get exam");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get exam");
    }
};

const getListExam = async (
    id: string,
    accessToken: string,
    page: number,
    limit: number
) => {
    try {
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
        console.log("Get exam list successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get list exam");
        }

        return data.metadata.exams;
    } catch (e) {
        throw new Error(e.message || "Failed to get list exam");
    }
};

const listQuestionStudent = async (
    id: string,
    accessToken: string,
    examId: string,
    page: number,
    limit: number
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/exam/join/${examId}?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );
        console.log("Get question list successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get list question");
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get list question");
    }
};

const searchExam = async (id: string, accessToken: string, query: string) => {
    try {
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
            throw new Error(data.message || "Failed to search exam");
        }

        return data.metadata.exams;
    } catch (e) {
        throw new Error(e.message || "Failed to search exam");
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
        console.log("Delete exam successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to delete exam");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to delete exam");
    }
};

const createExam = async (id: string, accessToken: string, exam: any) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/create`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(exam),
        });
        console.log("Create exam successfully");

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create exam");
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
        console.log("Update exam successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to update exam");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to update exam");
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
        console.log("Create question successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to create question");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to create question");
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
        console.log("Get exam successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get exams by status");
        }

        return data.metadata.exams;
    } catch (e) {
        throw new Error(e.message || "Failed to get exams by status");
    }
};

const getExamById = async (
    examId: string,
    userId: string,
    accessToken: string
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", userId || ""); // Use the user ID as the client ID

        // Gọi API với đường dẫn đúng
        const res = await fetch(`${BASE_URL}/exam/${examId}`, {
            method: "GET",
            headers: myHeaders,
        });
        console.log("Get exam successfully");

        const data = await res.json();

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to get exam");
        }

        return data.metadata; // Trả về dữ liệu bài kiểm tra
    } catch (e) {
        throw new Error(e.message || "Failed to get exam");
    }
};

const listQuestionTeacher = async (
    userId: string,
    accessToken: string,
    examId: string,
    page: number,
    limit: number
) => {
    try {
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
        console.log("Get question list successfully");

        const data = await res.json();

        if (!res.ok || data.err) {
            throw new Error(data.err || "Failed to get questions");
        }

        return data.metadata; // Trả về dữ liệu bài kiểm tra
    } catch (e) {
        throw new Error(e.message || "Failed to get questions");
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
        console.log("Update question successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to create question");
        }
        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to create question");
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
            throw new Error(data.err || "Failed to delete question");
        }

        return data.metadata; // Return any relevant data if needed
    } catch (e) {
        throw new Error(e.message || "Failed to delete question");
    }
};

const searchQuestions = async (
    id: string,
    accessToken: string,
    examId: string,
    query: any
) => {
    try {
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
        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to search questions");
        }

        return data.metadata.questions; // Assuming the response contains a list of questions
    } catch (e) {
        throw new Error(e.message || "Failed to search questions");
    }
};

const joinExam = async (id: string, accessToken: string, examId: string) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id || "");
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/join/${examId}`, {
            method: "GET",
            headers: myHeaders,
        });

        console.log("Response Status:", res.status); // Log the response status
        const data = await res.json();

        // if (!res.ok || data.status !== 200) {
        //     console.error("Error in join");
        // }

        return res.status; // Assuming the response contains a list of questions
    } catch (e) {
        console.error("Failed to join exam:", e);
        throw e;
    }
};

const submitExam = async (
    id: string,
    accessToken: string,
    examId: string,
    answers: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/exam/submit/${examId}`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(answers),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to submit exam");
        }

        return data.metadata;
    } catch (e) {
        console.error("Error in submit exam:", e);
        throw e;
    }
};

const answerQuestion = async (
    id: string,
    accessToken: string,
    questionId: string,
    answer: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(`${BASE_URL}/answer/${questionId}`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(answer),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to answer question");
        }

        return data.metadata;
    } catch (e) {
        console.error("Error in answer question:", e);
        throw e;
    }
};
const getGradeStudent = async (
    id: string,
    accessToken: string,
    examId: string
) => {
    try {
        // Create a Headers object
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(`${BASE_URL}/grade/view-grade/${examId}`, {
            method: "GET",
            headers: myHeaders, // Use the Headers object
        });
        console.log("Get grade student successfully");

        const data = await res.json();

        return data.metadata;
    } catch (e) {
        console.error("Failed to get grade:", e);
        throw e;
    }
};

const getListGrade = async (
    id: string,
    accessToken: string,
    examId: string,
    page: number,
    limit: number
) => {
    try {
        // Create a Headers object
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/grade/list-by-exam/${examId}?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );
        console.log("Get grade list successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get list grade");
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get list grade");
    }
};

const getListAnswerByStudent = async (
    id: string,
    accessToken: string,
    examId: string,
    studentId: string,
    page: number,
    limit: number
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/answer/${examId}/list-by-student/${studentId}?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );
        console.log("Get answer's student list successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(
                data.message || "Failed to get list answer by student"
            );
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get list answer by student");
    }
};

const getListAnswerByQuestion = async (
    id: string,
    accessToken: string,
    questionId: string,
    page: number,
    limit: number
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/answer/list-by-question/${questionId}?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );
        console.log("Get list answer by question successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(
                data.message || "Failed to get list answer by question"
            );
        }

        return data.metadata;
    } catch (e) {
        throw new Error(e.message || "Failed to get list answer by question");
    }
};

const getGradeHistory = async (
    id: string,
    accessToken: string,
    page: number,
    limit: number
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken); // Use the access token directly
        myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

        const res = await fetch(
            `${BASE_URL}/grade/view-completed?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: myHeaders, // Use the Headers object
            }
        );
        console.log("Get grade history successfully");

        const data = await res.json();

        if (!res.ok || data.status !== 200) {
            throw new Error(data.message || "Failed to get grade history");
        }

        return data.metadata;
    } catch (e) {
        console.error("Failed to get grade history:", e);
        throw e;
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
    listQuestionStudent,
    getExamById,
    listQuestionTeacher,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    joinExam,
    submitExam,
    answerQuestion,
    getGradeStudent,
    getListGrade,
    getListAnswerByStudent,
    getListAnswerByQuestion,
    getGradeHistory,
};
