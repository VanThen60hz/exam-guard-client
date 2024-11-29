import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogActions,
  DialogTitle,
  Box,
} from "@mui/material";
import Image from "next/image";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { updateProfile, getUserProfile } from "../../helpers/api/user-api";

// SCSS
import classes from "../../components/user/profile-user.module.scss";
import classes2 from "../../components/exam-main/manage-exam.module.scss";

import LinearProgress from "@mui/material/LinearProgress";

const UpdateProfileUserForm: React.FC = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  //Upload Avatar
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Thay thế bằng upload_preset từ Cloudinary
    formData.append("folder", "imageUser"); // Thêm vào thư mục cụ thể

    try {
      // Tải ảnh mới lên Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/duv0ugc5x/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error uploading avatar: ${errorText}`);
      }

      const data = await response.json();
      const imgUrl: string = data.secure_url;

      // Cập nhật avatar trong trạng thái
      setEditingUser((prev) => ({
        ...prev,
        avatar: imgUrl, // Cập nhật URL của ảnh đã tải lên
      }));

      toast.success("Avatar uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload avatar.");
    }
  };

  //Fetch dữ liệu user
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;

        setLoading(true);
        if (userId && accessToken) {
          try {
            const profile = await getUserProfile(userId as string, accessToken);
            setEditingUser(profile);
          } catch (error) {
            toast.error("Failed to fetch user profile");
          }
        }
        setLoading(false);
      }
    };

    fetchUserProfile(); // Call the function to fetch user profile
  }, [status, session]);

  // Mở modal khi nhấn nút Cancel
  const handleCancelButton = () => {
    setOpenConfirmDialog(true);
  };
  const handleCloseDialog = (confirm: boolean) => {
    setOpenConfirmDialog(false); // Đóng modal
    if (confirm) {
      router.push("/user/profile-user"); // Chuyển hướng nếu xác nhận
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleEditSave = async () => {
    try {
      await handleSaveEdit(editingUser);
      setEditingUser(null);
      router.push("/user/profile-user");
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleSaveEdit = async (userToUpdate) => {
    if (status === "authenticated" && session) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        try {
          const updatedUserData = await updateProfile(
            userId,
            accessToken,
            userToUpdate
          );
          // Update the editingExam state with the updated data
          setEditingUser(updatedUserData); 
          toast.success("User updated successfully");
        } catch (error) {
          toast.error("Failed to update user");
        }
      }
    }
  };

  // Hiển thị ra màn hình
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
          margin: "80px 50px 0 ",
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
        {/* Form submit */}
        <Box
          component="form"
          // onSubmit={handleSubmit}
          className={classes.updateProfileContainer}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            className={classes.updateProfileHeader}
          >
            Change Information
          </Typography>

          <Box>
            <Box
              sx={{
                margin: "80px 20px 10px ",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Name
                  </Typography>
                  <TextField
                    className={classes.textField}
                    name="name"
                    value={editingUser?.name || ""}
                    onChange={handleEditChange}
                  />
                </Box>
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Email
                  </Typography>
                  <TextField
                    className={classes.textField}
                    name="email"
                    value={editingUser?.email || ""}
                    onChange={handleEditChange}
                  />
                </Box>
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Address
                  </Typography>
                  <TextField
                    className={classes.textField}
                    name="address"
                    value={editingUser?.address || ""}
                    onChange={handleEditChange}
                  />
                </Box>
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Phone Number
                  </Typography>
                  <TextField
                    className={classes.textField}
                    name="phone_number"
                    value={editingUser?.phone_number || ""}
                    onChange={handleEditChange}
                  />
                </Box>
                <Box sx={{ marginBottom: 1, marginRight: "25px" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, width: "140px" }}
                  >
                    Choose Gender
                  </Typography>
                  <FormControl>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      name="gender"
                      value={editingUser?.gender || ""}
                      onChange={handleEditChange}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "15px",
                        }}
                      >
                        <FormControlLabel
                          value="FEMALE"
                          control={<Radio />}
                          label="Female"
                        />
                        <FormControlLabel
                          value="MALE"
                          control={<Radio />}
                          label="Male"
                        />
                      </Box>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
              <Box sx={{ marginLeft: "80px" }}>
                <Box sx={{ marginLeft: "25px" }}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarUpload}
                  />
                  <label htmlFor="avatar-upload">
                    <Avatar
                      alt="User Avatar"
                      src={editingUser?.avatar || ""}
                      sx={{
                        width: "150px",
                        height: "150px",
                        border: "1px solid #000",
                        marginLeft: "50px",
                      }}
                    />
                    <Button
                      className={classes.buttonUploadAvatar}
                      sx={{
                        width: "200px",
                        padding: "10px",
                        margin: "10px 0 0 0",
                      }}
                      component="span"
                      onChange={handleEditChange}
                    >
                      <p
                        style={{
                          fontFamily: "Lexend",
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#229594",
                          lineHeight: "normal",
                        }}
                      >
                        Upload New Avatar
                      </p>
                      <Image
                        src="/images/Vector.png"
                        width="20px"
                        height="20px"
                        objectFit="contain"
                        alt="Hero Image"
                      />
                    </Button>
                  </label>
                </Box>
              </Box>
            </Box>
            {/* Nút Cancel và Update */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "20px",
                marginTop: "-30px",
              }}
            >
              <Button
                className={classes2.btnRed}
                fullWidth
                variant="contained"
                sx={{}}
                onClick={handleCancelButton}
              >
                Cancel
              </Button>
              <Button
                className={classes2.btnBlue}
                onClick={handleEditSave}
                fullWidth
                variant="contained"
                sx={{ marginLeft: "20px" }}
              >
                Update
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Modal xác nhận Cancel*/}
      <Dialog
        open={openConfirmDialog}
        onClose={() => handleCloseDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            minWidth: "400px",
            padding: "20px",
            borderRadius: "20px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              textAlign: "center",
              fontSize: "21px",
              fontWeight: "bold",
            }}
          >
            Do you want to exit?
          </DialogTitle>
        </Box>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={() => handleCloseDialog(false)}
            color="primary"
            autoFocus
            className={classes2.btnRed}
            sx={{ minWidth: "120px" }}
          >
            No
          </Button>
          <Button
            onClick={() => handleCloseDialog(true)}
            variant="contained"
            color="error"
            className={classes2.btnBlue}
            sx={{ minWidth: "120px" }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateProfileUserForm;
