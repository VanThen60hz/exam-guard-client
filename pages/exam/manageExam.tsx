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
import { LoadingBarRef } from "react-top-loading-bar";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import NavBarHome from "../../components/home/navbar-home";
import {
  getListExam,
  searchExam,
  deleteExam,
  getExamsByStatus,
} from "../../helpers/api/exam-api";
import classes from "./manageExam.module.scss";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import PostAddIcon from "@mui/icons-material/PostAdd";
import LaunchIcon from "@mui/icons-material/Launch";
import EastIcon from "@mui/icons-material/East";
import { Grid } from "@mui/material";

// Components
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/router";

enum EPaginationOfPage {
  EXAMS_PER_PAGE = 6,
}

const ManageExam: React.FC = () => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);
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

  //Get List exams
  useEffect(() => {
    const fetchListUser = async () => {
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;

        if (userId && accessToken) {
          // Kiểm tra xem limit có phải là số hợp lệ không
          if (total !== undefined && total > 0) {
            try {
              const list = await getListExam(userId, accessToken, page, limit);
              setListExam(list);
              setPage(list.totalPages);
              setTotal(list.total);
              setPage(1);
            } catch (error) {
              toast.error("Failed to fetch user profile");
            }
          }
        }
      }
    };

    fetchListUser();
  }, [status, session, page, limit]);

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
          toast.error("Failed to fetch exams: " + error.message);
        }
      }
    };

    fetchExams();
  }, [status, session, filterStatus, page, limit]);

  // Exam search functions
  const handleSearch = async (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    if (value) {
      setFilterStatus("All");
      setActiveButton("All");
      try {
        const exams = await searchExam(
          session.userId,
          session.accessToken,
          value
        );
        setListExam(exams); // Cập nhật danh sách bài kiểm tra
        setPage(1); // Reset to first page when search is performed
        console.log(exams);
      } catch (error) {
        toast.error("Failed to search exams");
      }
    } else {
      // Nếu từ khóa tìm kiếm trống, lấy lại danh sách bài kiểm tra đầy đủ
      const allExams = await getListExam(
        session.userId,
        session.accessToken,
        page,
        limit
      ); // Lấy lại danh sách bài kiểm tra
      setListExam(allExams); // Cập nhật danh sách bài kiểm tra
      setPage(1);
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
          toast.success("Exam deleted successfully!");
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
      pathname: "/exam/editExam",
      query: { examId: exam._id }, // Pass the exam ID as a query parameter
    });
  };

  return (
    <>
      <NavBarHome loadingBarRef={loadingBarRef} />
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
            onInputChange={handleSearch}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="What are you looking for?"
                variant="outlined"
                sx={{
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
                      <IconButton>
                        <SearchIcon sx={{ color: "#229594" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#229594",
                          color: "white",
                          borderRadius: "0 20px 20px 0",
                          padding: "10px 20px",
                          height: "56px",
                          width: "150px",
                          fontWeight: "bold",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",

                          "&:hover": {
                            backgroundColor: "#1a7170",
                          },
                          position: "absolute",
                          right: 0,
                        }}
                      >
                        SEARCH
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Button
          onClick={() => router.push("/exam/createExam")}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "30px",
            padding: "12px 24px",
            backgroundColor: "#e9ffff",
            color: "#229594",
            fontWeight: "bold",
            border: "none",
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            transition:
              "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease", // Smooth transitions
            "&:hover": {
              backgroundColor: "#b2e0e0",
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)",
            },
          }}
          variant="contained"
        >
          <Tooltip title="Add Exam">
            <PostAddIcon />
          </Tooltip>
        </Button>
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
      </Box>
      <Box
        sx={{
          margin: "20px 50px",
        }}
      >
        <Grid container spacing={4}>
          {displayedExams.map((exam, index) => (
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
                    {/* {" "}
                    {(page - 1) * EPaginationOfPage.EXAMS_PER_PAGE + index + 1} */}
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
                  <h4 style={{ color: "#000", marginTop: "10px" }}>
                    {exam.description}
                  </h4>
                  <Box sx={{ gap: "10px", display: "flex", marginTop: "10px" }}>
                    <span>
                      {new Date(exam.startTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}{" "}
                    </span>
                    <EastIcon />
                    <span>
                      {new Date(exam.endTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}{" "}
                    </span>
                  </Box>
                  <span
                    style={{
                      display: "flex",
                      marginTop: "10px",
                    }}
                  >
                    {Math.abs(
                      (new Date(exam.endTime).getTime() -
                        new Date(exam.startTime).getTime()) /
                        60000
                    ).toFixed(0)}{" "}
                    minutes
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
                    className={`${classes.btnBlue} ${classes.btnSmall}`}
                    sx={{ marginRight: 1.5 }}
                  >
                    <LaunchIcon />
                    Open
                  </Button>
                  <Button
                    onClick={() => handleEditClick(exam)}
                    className={`${classes.btnGreen} ${classes.btnSmall}`}
                    sx={{ marginRight: 1.5 }}
                  >
                    <EditIcon />
                    Edit
                  </Button>
                  <Button
                    className={`${classes.btnRed} ${classes.btnSmall}`}
                    onClick={() => handleDeleteClick(exam)}
                  >
                    <DeleteIcon />
                    Delete
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
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

export default ManageExam;
