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

    const res = await fetch(`${BASE_URL}/cheating/detect-cheating/${examId}`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(detect),
    });
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

const getListCheatingStatistic = async (
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
      `${BASE_URL}/cheating/list-cheating-statistics/${examId}?page=${page}&limit=${limit}`,
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
    throw new Error(e.message || "Failed to get list cheating!");
  }
};

const getListCheatingByStudent = async (
  id: string,
  accessToken: string,
  examId: string,
  studentId: string,
  page,
  limit
) => {
  try {
    console.log("User ID:", id);
    console.log("Access Token:", accessToken);

    // Create a Headers object
    const myHeaders = new Headers();
    myHeaders.append("Authorization", accessToken); // Use the access token directly
    myHeaders.append("x-client-id", id || ""); // Use the user ID as the client ID

    const res = await fetch(
      `${BASE_URL}/cheating/list-cheating-histories-by-student/${examId}/${studentId}?page=${page}&limit=${limit}`,
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
    throw new Error(e.message || "Failed to get list cheating!");
  }
};

export { detect_cheating, getListCheatingStatistic, getListCheatingByStudent };
