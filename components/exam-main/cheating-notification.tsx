import { useEffect } from "react";
import io from "socket.io-client";

function CheatingNotification({ teacherId, onCheatingDetected }) {
  useEffect(() => {
    const socket = io("https://exam-guard-server.onrender.com", {
      query: { teacherId },
    });

    socket.on("newCheatingDetected", (data) => {
      onCheatingDetected(data.message);
    });

    return () => {
      socket.off("newCheatingDetected");
      socket.disconnect();
    };
  }, [teacherId, onCheatingDetected]);

  return null;
}

export default CheatingNotification;
