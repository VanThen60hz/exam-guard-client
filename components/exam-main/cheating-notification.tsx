import { useEffect } from "react";
import io from "socket.io-client";

function CheatingNotification({ teacherId, onCheatingDetected }) {
  useEffect(() => {
    // Connect socket with teacherId in query
    const socket = io("https://exam-guard-server.onrender.com", {
      query: { teacherId }, // Send teacherId when connecting
    });

    socket.on("newCheatingDetected", (data) => {
      onCheatingDetected(data.message); // Call the function from props when cheating is detected
    });

    return () => {
      socket.off("newCheatingDetected");
      socket.disconnect(); // Close connection when component unmounts
    };
  }, [teacherId, onCheatingDetected]);

  return null; // Re-run when teacherId or onCheatingDetected changes
}

export default CheatingNotification;
