import React, { useEffect, useState } from "react";
import io from "socket.io-client";

function CheatingNotification({ teacherId, onCheatingDetected }) {
    // Nhận onCheatingDetected như một prop
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Connect socket with teacherId in query
        const socket = io("https://exam-guard-server.onrender.com", {
            query: { teacherId }, // Send teacherId when connecting
        });

        socket.on("newCheatingDetected", (data) => {
            console.log("Nhận thông báo:", data); // Kiểm tra dữ liệu log
            setNotifications((prevNotifications) => [
                ...prevNotifications,
                data,
            ]);
            onCheatingDetected(data.message); // Gọi hàm từ props khi phát hiện gian lận
        });

        return () => {
            socket.off("newCheatingDetected");
            socket.disconnect(); // Close connection when component unmounts
        };
    }, [teacherId, onCheatingDetected]); // Re-run when teacherId or onCheatingDetected changes

    return (
        <div>
            {/* <h2>Cheating Notifications</h2>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>
                        {notification.message}: {JSON.stringify(notification.data)}
                    </li>
                ))}
            </ul> */}
        </div>
    );
}

export default CheatingNotification;
