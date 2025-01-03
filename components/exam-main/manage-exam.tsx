import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  getListExam,
  searchExam,
  deleteExam,
  getExamsByStatus,
} from "../../helpers/api/exam-api";
import CheatingNotification from "./cheating-notification";
import classes from "../../components/exam-main/manage-exam.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import PostAddIcon from "@mui/icons-material/PostAdd";
import EastIcon from "@mui/icons-material/East";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Grid } from "@mui/material";
import GradingIcon from "@mui/icons-material/Grading";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";
import Image from "next/image";
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import withAuth from "../../components/withAuth/with-auth";

enum EPaginationOfPage {
  EXAMS_PER_PAGE = 6,
}

const ManageExamForm: React.FC = () => {
  const { data: session, status } = useSession();
  const EXAMS_PER_PAGE = EPaginationOfPage.EXAMS_PER_PAGE;
  const [listExam, setListExam] = useState([]);
  const [examDelete, setExamDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(0);
  const [total, setTotal] = useState(Infinity);
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeButton, setActiveButton] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const teacherId = session?.userId;
  const [countNoti, setCountNoti] = useState<number>(0);

  //Get List exams
  useEffect(() => {
    const fetchListExam = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;

        if (userId && accessToken) {
          // Kiểm tra xem limit có phải là số hợp lệ không
          if (total !== undefined && total > 0) {
            try {
              const list = await getListExam(userId, accessToken, page, limit);
              setListExam(list);
              setTotal(list.total);
              setPage(1);
            } catch (error) {
              toast.error("Failed to fetch list exam");
            }
          }
        }
      }
      setLoading(false);
    };

    fetchListExam();
  }, [status, session, page, limit, total]);

  // Get exams by status
  useEffect(() => {
    const fetchExams = async () => {
      if (status === "authenticated" && session) {
        try {
          let examsData;
          if (filterStatus === "All") {
            examsData = await getListExam(
              session.userId,
              session.accessToken,
              page,
              limit
            );
          } else {
            examsData = await getExamsByStatus(
              session.userId,
              session.accessToken,
              filterStatus,
              page,
              limit
            );
          }
          setListExam(examsData);
        } catch (error) {
          toast.error("Failed to fetch exams");
        }
      }
    };

    fetchExams();
  }, [status, session, filterStatus, page, limit]);

  // Exam search functions
  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    setSearchValue(value || "");

    if (!value) {
      resetData(); // Gọi hàm resetData để lấy lại danh sách bài kiểm tra đầy đủ
    }
  };

  const resetData = async () => {
    if (status === "authenticated" && session) {
      try {
        const allExams = await getListExam(
          session.userId,
          session.accessToken,
          page,
          limit
        );
        setListExam(allExams);
        setPage(1);
      } catch (error) {
        toast.error("Failed to fetch all exams");
      }
    }
  };

  const handleSearch = async () => {
    if (searchValue) {
      setFilterStatus("All");
      setActiveButton("All");
      if (status === "authenticated" && session) {
        try {
          const exams = await searchExam(
            session.userId,
            session.accessToken,
            searchValue
          );
          setListExam(exams);
          setPage(1);
        } catch (error) {
          toast.error("Failed to search exams");
        }
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<{}>) => {
    if (event.key === "Enter") {
      handleSearch(); // Gọi hàm tìm kiếm khi nhấn Enter
    }
  };

  useEffect(() => {
    setPage(Math.ceil(listExam.length / EPaginationOfPage.EXAMS_PER_PAGE));
    setPage(1);
  }, [listExam.length]);

  //Pagination
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  //Hiển thị 4 bảng trên mỗi trang
  const displayedExams = listExam.slice(
    (page - 1) * EPaginationOfPage.EXAMS_PER_PAGE,
    page * EPaginationOfPage.EXAMS_PER_PAGE
  );

  // Exam deletion functions
  const handleDeleteClick = (exam) => {
    setExamDelete(exam);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setExamDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (status === "authenticated" && session && examDelete) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        try {
          // Assume you have a deleteUser function imported from your API
          await deleteExam(userId, accessToken, examDelete._id, examDelete);
          setListExam(listExam.filter((exam) => exam._id !== examDelete._id));
          toast.success("Exam deleted successfully");
        } catch (error) {
          toast.error("Failed to delete exam");
        }
      }
    }
    setDeleteDialogOpen(false);
    setExamDelete(null);
  };

  const handleEditClick = (exam) => {
    router.push({
      pathname: "/exam/create-question",
      query: { examId: exam._id },
    });
  };

  const handleEditClick2 = (exam) => {
    router.push({
      pathname: "/exam/edit-exam",
      query: { examId: exam._id },
    });
  };

  const handleEditClick3 = (exam) => {
    router.push({
      pathname: "/exam/list-cheating",
      query: { examId: exam._id },
    });
  };

  const handleEditClick4 = (exam) => {
    router.push({
      pathname: "/exam/list-grade",
      query: { examId: exam._id },
    });
  };

  const formatDateTime = (dateTime: string) => {
    // Cắt chuỗi để lấy các phần
    const [datePart, timePart] = dateTime.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    const hour12 = parseInt(hour) % 12 || 12;
    const ampm = parseInt(hour) >= 12 ? "PM" : "AM";

    return `${day}/${month}/${year} ${hour12}:${minute} ${ampm}`;
  };

  const handleCheatingDetected = (message) => {
    const mes = message;
    setCountNoti(countNoti + 1);
  };

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
      >
        <Box>
          <h1 style={{ fontSize: "32px" }}>Manage Exam</h1>
        </Box>
        <Stack spacing={2} sx={{ width: 500 }}>
          <Autocomplete
            freeSolo
            disablePortal
            id="search-autocomplete"
            options={[]}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyPress}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="What are you looking for?"
                variant="outlined"
                sx={{
                  border: "0.5px solid #229594",
                  borderRadius: "20px",
                  backgroundColor: "#e9ffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover": {
                    backgroundColor: "#e1fdfd",
                  },
                  position: "relative",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                InputProps={{
                  ...params.InputProps,
                  type: "text",
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={handleSearch}>
                        <SearchIcon
                          sx={{
                            color: "#229594",
                          }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Box
          sx={{
            display: "flex",
            gap: "30px",
          }}
        >
          <Box
            sx={{
              position: "relative",
            }}
          >
            <Button
              onClick={() => router.push("/exam/history-cheating")}
              className={`${classes.btnCircle}`}
              variant="contained"
            >
              <Tooltip title="Notification">
                <NotificationsIcon />
              </Tooltip>
              <CheatingNotification
                teacherId={teacherId}
                onCheatingDetected={handleCheatingDetected}
              />
            </Button>
            {/* Chấm đỏ thông báo */}
            <Box
              sx={{
                display: countNoti == 0 ? "none" : "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                width: "15px",
                height: "15px",
                backgroundColor: "red",
                borderRadius: "50%",
                top: "15px",
                right: "15px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {countNoti}
              </p>
            </Box>
          </Box>
          <Button 
            onClick={() => router.push("/exam/create-exam")}
            className={`${classes.btnCircle}`}
            variant="contained"
          >
            <Tooltip title="Add Exam">
              <PostAddIcon />
            </Tooltip>
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2, margin: "20px 50px " }}>
        <Button
          className={`${classes.btnBlue} ${classes.btnSmall} ${
            activeButton === "All" ? classes.btnActive : ""
          }`}
          onClick={() => {
            setFilterStatus("All");
            setActiveButton("All");
          }}
          variant="contained"
        >
          All
        </Button>
        <Button
          className={`${classes.btnBlue} ${classes.btnSpecial} ${
            activeButton === "Scheduled" ? classes.btnActive : ""
          }`}
          onClick={() => {
            setFilterStatus("Scheduled");
            setActiveButton("Scheduled");
          }}
          variant="contained"
        >
          Scheduled
        </Button>
        <Button
          className={`${classes.btnBlue} ${classes.btnSpecial} ${
            activeButton === "In Progress" ? classes.btnActive : ""
          }`}
          onClick={() => {
            setFilterStatus("In Progress");
            setActiveButton("In Progress");
          }}
          variant="contained"
        >
          In Progress
        </Button>
        <Button
          className={`${classes.btnBlue} ${classes.btnSpecial} ${
            activeButton === "Completed" ? classes.btnActive : ""
          }`}
          onClick={() => {
            setFilterStatus("Completed");
            setActiveButton("Completed");
          }}
          variant="contained"
        >
          Completed
        </Button>
      </Box>
      <Box
        sx={{
          margin: "20px 50px",
        }}
      >
        <Grid container spacing={4}>
          {displayedExams.length > 0 ? (
            displayedExams?.map((exam, index) => (
              <Grid item xs={12} sm={6} key={exam._id}>
                {" "}
                {/* Chia thành 2 cột */}
                <Box
                  component={Paper}
                  sx={{
                    padding: 2,
                    borderRadius: 4,
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h2 style={{ fontSize: "20px" }}>{exam.title}</h2>
                    <h2 style={{ fontSize: "20px" }}>
                      Exam ID: {exam._id.slice(-5)}
                    </h2>
                  </Box>
                  <hr
                    style={{
                      border: "none",
                      height: "2px",
                      backgroundColor: "#000",
                      margin: "5px 0",
                      width: "100%",
                    }}
                  />
                  <Box
                    sx={{
                      marginTop: "10px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      gap: "10px",
                    }}
                  >
                    <h4
                      style={{
                        color: "#000",
                        marginTop: "10px",
                      }}
                    >
                      {exam.description}
                    </h4>
                    <Box
                      sx={{
                        gap: "10px",
                        display: "flex",
                        marginTop: "10px",
                      }}
                    >
                      <span>{formatDateTime(exam.startTime)} </span>
                      <EastIcon />
                      <span>{formatDateTime(exam.endTime)} </span>
                    </Box>
                    <span
                      style={{
                        display: "flex",
                        marginTop: "10px",
                      }}
                    >
                      Duration: {exam.duration} minutes
                    </span>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 2,
                    }}
                  >
                    <Button
                      onClick={() => handleEditClick4(exam)}
                      className={`${classes.btnColor1}`}
                      sx={{ marginRight: 1.5 }}
                    >
                      <GradingIcon />
                      View grade
                    </Button>
                    <Button
                      onClick={() => handleEditClick3(exam)}
                      className={`${classes.btnColor2}`}
                      sx={{ marginRight: 1.5 }}
                    >
                      <VisibilityIcon />
                      Cheating
                    </Button>
                    <Button
                      onClick={() => handleEditClick(exam)}
                      className={`${classes.btnColor3}`}
                      sx={{ marginRight: 1.5 }}
                    >
                      <AddIcon />
                      Create Question
                    </Button>
                    <Button
                      onClick={() => handleEditClick2(exam)}
                      className={`${classes.btnColor4} ${classes.btnSmall}`}
                      sx={{ marginRight: 1.5 }}
                    >
                      <EditIcon />
                      Edit
                    </Button>
                    <Button
                      className={`${classes.btnColor5} ${classes.btnSmall}`}
                      onClick={() => handleDeleteClick(exam)}
                    >
                      <DeleteIcon />
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : (
            <Box sx={{ textAlign: "center", marginTop: 2, width:"100%" }}>
              <Image
                src="/images/icon/empty-box.png"
                alt="No data"
                width={300}
                height={300}
              />
              <p style={{ color: "#000", fontSize: "18px" }}>
                Empty data, please check back later!
              </p>
            </Box>
          )}
        </Grid>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
        <Pagination
          count={Math.ceil(listExam.length / EXAMS_PER_PAGE)}
          page={page}
          onChange={handlePageChange}
          sx={{
            marginBottom: "40px",
            "& .MuiPaginationItem-root": {
              color: "#229594",
            },
            "& .MuiPaginationItem-page.Mui-selected": {
              backgroundColor: "#229594",
              color: "white",
              "&:hover": {
                backgroundColor: "#1a7170",
              },
            },
            "& .MuiPaginationItem-page:hover": {
              backgroundColor: "#e0f2f2",
            },
          }}
          variant="outlined"
          shape="rounded"
        />
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
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
          <WarningIcon
            sx={{
              fontSize: 50,
              color: "warning.dark",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              textAlign: "center",
              fontSize: "21px",
              fontWeight: "bold",
            }}
          >
            Do you want to delete this exam?
          </DialogTitle>
        </Box>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteClose}
            color="primary"
            autoFocus
            startIcon={<CancelIcon />}
            className={classes.btnBlue}
            sx={{ minWidth: "120px" }}
          >
            No
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            className={classes.btnRed}
            sx={{ minWidth: "120px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withAuth(ManageExamForm, ["TEACHER"]);
