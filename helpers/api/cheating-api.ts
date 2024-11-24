import { BASE_URL } from "../../constants";

const detect_cheating = async (
    id: string,
    accessToken: string,
    examId: string,
    detect: any
) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", accessToken);
        myHeaders.append("x-client-id", id);
        myHeaders.append("Content-Type", "application/json");

        const res = await fetch(
            `${BASE_URL}/cheating/detect-cheating/${examId}`,
            {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(detect),
            }
        );
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to cheating!");
        }

        return data.metadata;
    } catch (e) {
        console.error("Error in createExam:", e);
        throw e;
    }
};

export { detect_cheating };
