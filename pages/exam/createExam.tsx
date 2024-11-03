import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/router";
import { createExam } from "../../helpers/api/exam-api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { SelectChangeEvent } from "@mui/material/Select";
import NavBarHome from "../../components/home/navbar-home";
import classes from "./manageExam.module.scss";

interface FormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
}

type Errors = {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
};

const CreateExam: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    status: "Scheduled",
  });
  const { data: session, status } = useSession();
  const [errors, setErrors] = useState<Errors>({});
  const dateInputRef = useRef<HTMLInputElement>(null);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Thêm useEffect để log session khi nó thay đổi
  useEffect(() => {
    console.log("Session:", session);
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target; // Lấy tên và giá trị từ sự kiện

    // Cập nhật trạng thái formData với giá trị mới
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Xóa lỗi cho trường hiện tại
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Errors = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.startTime) newErrors.startTime = "Start Time is required";
    if (!formData.endTime) newErrors.endTime = "End Time is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Tiếp tục xử lý submit nếu không có lỗi
    if (Object.keys(newErrors).length === 0) {
      try {
        if (!session || !session.accessToken) {
          throw new Error("User is not authenticated");
        }
        const userData = {
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status,
        };
        const response = await createExam(
          session.userId,
          session.accessToken,
          userData
        );
        toast.success("Exam created successfully!");
      } catch (err: any) {
        toast.error(err.message || "Error creating user");
      } finally {
        setLoading(false);
      }
    }
    router.push("/exam/manageExam");
  };

  return (
    <>
      <NavBarHome loadingBarRef={loadingBarRef} />
      <Container sx={{ marginTop: "150px" }}>
        <Container
          component="main"
          sx={{
            width: "70%",
            margin: "0 auto",
            paddingBottom: "20px",
            marginTop: "150px",
          }}
        >
          <Box
            sx={{
              border: "2px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
              marginTop: "20px",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ fontWeight: 700 }}
            >
              CREATE EXAM
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 3 }}
            >
              <Box>
                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Title <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    name="title"
                    type="text"
                    required
                    fullWidth
                    id="title"
                    label=""
                    className={classes.textFieldCustom}
                    onChange={handleInputChange}
                  />
                  {errors.title && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.title}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ marginBottom: 2, width: "100%" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Description <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    name="description"
                    type="text"
                    label=""
                    id="description"
                    className={classes.textFieldCustom}
                    multiline
                    rows={3}
                    variant="outlined"
                    onChange={handleInputChange}
                  />
                  {errors.description && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  marginBottom: 2,
                }}
                className={classes.textFieldCustom}
              >
                <Box sx={{ width: 210 }}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="In Progress">In progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: 250, margin: "0 10px" }}>
                  <TextField
                    name="startTime"
                    fullWidth
                    required
                    id="startTime"
                    label="Start Time"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true, // Đảm bảo nhãn không bị che khuất
                    }}
                    inputRef={dateInputRef}
                    onChange={handleInputChange}
                  />
                  {errors.startTime && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.startTime}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ width: 250 }}>
                  <TextField
                    name="endTime"
                    fullWidth
                    required
                    id="endTime"
                    label="End Time"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true, // Đảm bảo nhãn không bị che khuất
                    }}
                    inputRef={dateInputRef}
                    onChange={handleInputChange}
                  />
                  {errors.endTime && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.endTime}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Button
                  onClick={() => router.push("/exam/manageExam")}
                  variant="contained"
                  className={`${classes.btnRed} ${classes.btnMedium}`}
                  sx={{ marginRight: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className={`${classes.btnBlue} ${classes.btnMedium}`}
                >
                  Create
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Container>
    </>
  );
};

export default CreateExam;
