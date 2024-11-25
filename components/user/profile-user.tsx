import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  Modal,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { getUserProfile } from "../../helpers/api/user-api";

// SCSS
import classes from "../../components/user/profile-user.module.scss";
import classes2 from "../../components/exam-main/manage-exam.module.scss";

import LinearProgress from "@mui/material/LinearProgress";

// Định nghĩa kiểu dữ liệu cho user
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  gender: string;
  address: string;
  phone_number: string;
  avatarUrl: string;
}

const ProfileUserForm: React.FC = () => {
  const [formData, setFormData] = useState<User>({
    id: "",
    name: "",
    email: "",
    role: "",
    gender: "",
    address: "",
    phone_number: "",
    avatarUrl: "",
  });

  // Router chuyển page
  const router = useRouter();

  // Load trang
  const [loading, setLoading] = useState(false);

  // Báo lỗi
  const [error, setError] = useState<string | null>(null);

  // Get session data
  const { data: session, status } = useSession();
  const { userId } = router.query;

  // Lấy thông tin người dung
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;

        if (userId && accessToken) {
          setLoading(true);
          try {
            const profile = await getUserProfile(userId, accessToken);

            setFormData({
              id: profile._id || "",
              name: profile.name || "",
              email: profile.email || "",
              role: profile.role || "",
              gender: profile.gender,
              address: profile.address || "",
              phone_number: profile.phone_number || "",
              avatarUrl: profile.avatar || "/images/default-avatar.png",
            });
          } catch (error) {
            console.error("Error getting user profile:", error);
            toast.error("Failed to fetch user profile");
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    fetchUserProfile(); // Call the function to fetch user profile
  }, [status, session]);

  // Nút bấm cập nhật thông tin
  const handleUpdateButton = (profile) => {
    router.push({
      pathname: "/user/update-profile",
      query: { userId: profile.id },
    });
  };

  const handleBackButton = () => {
    if (formData.role === "TEACHER") {
      router.push("/exam/manage-exam");
    } else if (formData.role === "ADMIN") {
      router.push("/user/list-user");
    } else if (formData.role === "STUDENT") {
      router.push("/user/home-student");
    }
  };

  //Hiển thị ra màn hình
  return (
    <>
      {loading && (
        <Box
          sx={{
            width: "100%",
            padding: "0 50px",
            position: "fixed",
            top: 100,
            left: 0,
            zIndex: 100,
          }}
        >
          <LinearProgress color="primary" />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "108px 50px 0 ",
        }}
      ></Box>
      <Container
        sx={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Cửa sổ thông tin người dùng */}
        <div className={classes.profileContainer}>
          <div className={classes.profileHeader}>
            <p>Information Account</p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div className={classes.profileContent}>
              <div className={classes.profileItem}>
                <p>Full name: </p>
                <p>{formData.name}</p>
              </div>
              <div className={classes.profileItem}>
                <p>Gender: </p>
                <p>{formData.gender}</p>
              </div>
              <div className={classes.profileItem}>
                <p>Role: </p>
                <p>{formData.role}</p>
              </div>
              <div className={classes.profileItem}>
                <p>Email: </p>
                <p>{formData.email}</p>
              </div>
              <div className={classes.profileItem}>
                <p>Address: </p>
                <p>{formData.address}</p>
              </div>
              <div className={classes.profileItem}>
                <p>Phone number: </p>
                <p>{formData.phone_number}</p>
              </div>
            </div>
            <div className={classes.profileAvatar}>
              <Avatar
                style={{
                  width: "230px",
                  height: "230px",
                  border: "1px solid #000",
                }}
                src={formData.avatarUrl}
              />
            </div>
          </div>

          {/* Nút thay đổi thông tin người dùng */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: "40px",
            }}
          >
            <Button
              className={classes2.btnRed}
              fullWidth
              variant="contained"
              style={{
                margin: "30px",
                width: "95px",
                display: "flex",
                justifyContent: "flex-end",
                marginRight: "-10px",
              }}
              onClick={handleBackButton}
            >
              Back
            </Button>

            <Button
              className={classes2.btnBlue}
              fullWidth
              variant="contained"
              style={{
                margin: "30px",
                width: "182px",
                display: "flex",
                justifyContent: "flex-end",
                marginRight: "-10px",
              }}
              onClick={() => handleUpdateButton(formData)}
            >
              Update Profile
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
};
export default ProfileUserForm;
