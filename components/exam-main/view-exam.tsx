import React, { useState, useEffect, useRef } from "react";
import {
  LinearProgress,
  Container,
  Button,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  styled,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Autocomplete,
  InputAdornment,
  IconButton,
  Box,
  Modal,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import UndoIcon from "@mui/icons-material/Undo";

import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import {
  deleteQuestion,
  getExamById,
  listQuestionTeacher,
  searchQuestions,
  updateQuestion,
} from "../../helpers/api/exam-api";

import classes from "../../components/user/home-student.module.scss";
import classes2 from "../../components/exam-main/manage-exam.module.scss";

// Define the type for examData
interface ExamData {
  _id: string;
  title: string;
  endTime: string;
  startTime: string;
  duration: number;
  // Add other properties as needed
}

const ViewExamForm: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [listData, setListData] = useState([]);
  const [examData, setExamData] = useState<ExamData | null>(null);
  let exam = null;

  const [originPage, setOriginPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Router chuyển page
  const router = useRouter();

  const { examId } = router.query;

  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // List tất cả câu hỏi
  const [allQuestion, setAllQuestion] = useState([]);
  const page2 = 1;
  const limit2 = 100000;

  // Load trang
  const [loading, setLoading] = useState(false);

  // Báo lỗi
  const [error, setError] = useState<string | null>(null);

  // Get session data
  const { data: session, status } = useSession();

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false); // Trạng thái modal xác nhận xóa

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [options, setOptions] = useState<string[]>(
    selectedQuestion?.options || ["", "", ""]
  );
  const [updateQuestionData, setUpdateQuestionData] = useState(null);

  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null); // Câu hỏi cần xóa

  const fetchListQuestions = async () => {
    setLoading(true);
    console.log("examID: ", examId);
    if (status === "authenticated" && session) {
      const userId = session.userId;
      const accessToken = session.accessToken;
      if (userId && accessToken) {
        try {
          const listQuestions = await listQuestionTeacher(
            userId,
            accessToken,
            examId as string,
            page,
            limit
          );
          setListData(listQuestions.questions);
          setTotalPage(listQuestions.totalPages);
          setOriginPage(listQuestions.totalPages);
        } catch (error) {
          console.error("Error getting Questions:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    }
    return listData;
  };
  // Lấy danh sách câu hỏi
  useEffect(() => {
    const fetchAllQuestions = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const allQuestions = await listQuestionTeacher(
              userId,
              accessToken,
              examId as string,
              page2,
              limit2
            );
            setAllQuestion(allQuestions.questions);
          } catch (error) {
            console.error("Error getting all Questions:", error);
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
      }
      return allQuestion;
    };

    const fetchExamData = async () => {
      if (status === "authenticated" && session) {
        try {
          exam = await getExamById(
            examId as string,
            session.userId,
            session.accessToken
          );
          setExamData(exam);
          console.log(exam);
        } catch (error) {
          console.error("Error fetching exam data:", error);
          setError("Failed to fetch exam data.");
        }
      } else {
        setError("User is not authenticated.");
      }
    };

    fetchExamData();
    fetchListQuestions();
    fetchAllQuestions();
  }, [status, session, examId, page, limit, limit2]);

  // Tìm kiếm câu hỏi
  const handleSearch = async (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    setSearchInput(value || "");

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current); // Clear the previous timeout
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (value) {
        try {
          const questions = await searchQuestions(
            session.userId,
            session.accessToken,
            examId as string,
            value
          );
          setListData(questions);
          setPage(1);
          setTotalPage(questions.totalPages);
        } catch (error) {
          toast.error("Failed to search questions");
        }
      } else {
        // If search term is empty, reset to the full user list
        // setListData(listData);
        // setTotalPage(originPage);
        fetchListQuestions();
        setPage(1);
      }
    }, 300); // Adjust the delay as needed (300ms in this case)
  };

  // Chuyển trang
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion({ ...question }); // Sao chép dữ liệu để tránh thay đổi trực tiếp
    setOptions(question?.options || ["", "", ""]); // Đảm bảo mảng không rỗng
    setOpenEditModal(true);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index); // Loại bỏ tùy chọn tại vị trí index
    setOptions(newOptions); // Cập nhật trạng thái tạm thời

    // Cập nhật tạm vào dữ liệu câu hỏi nhưng chưa gọi API
    const updatedQuestionData = {
      ...selectedQuestion,
      options: newOptions,
    };
    setUpdateQuestionData(updatedQuestionData);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedQuestion(null);
    setOptions(["", "", ""]);
    setUpdateQuestionData(null);
  };

  const handleSaveChanges = async () => {
    try {
      if (updateQuestionData) {
        // Gọi API để cập nhật câu hỏi
        await updateQuestion(
          examId as string,
          selectedQuestion._id,
          session.userId,
          session.accessToken,
          updateQuestionData
        );
      }
      // Đóng modal và làm mới danh sách câu hỏi
      handleCloseEditModal();
      await fetchListQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleQuestionTextChange = (value: string) => {
    setSelectedQuestion({
      ...selectedQuestion,
      questionText: value,
    });
  };

  const handleAddOption = async () => {
    // Hàm thêm tùy chọn mới
    const newOptions = [...options, ""]; // Thêm một tùy chọn mới
    setOptions(newOptions); // Cập nhật trạng thái
    const updatedQuestionData = {
      ...selectedQuestion,
      options: newOptions,
    };
    setUpdateQuestionData(updatedQuestionData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;

    setOptions(newOptions);
    const updatedData = {
      ...selectedQuestion,
      options: newOptions,
    };
    setSelectedQuestion(updatedData);
    setUpdateQuestionData(updatedData);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setQuestionToDelete(null);
  };

  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteQuestion(
          examId as string,
          questionToDelete,
          session.userId,
          session.accessToken
        );

        toast.success("Question deleted successfully");

        // Tải lại trang để phản ánh các thay đổi
        window.location.reload();
      } catch (error) {
        toast.error("Failed to delete question");
      } finally {
        setOpenDeleteModal(false);
        setQuestionToDelete(null);
      }
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
      <Container>
        <div
          style={{
            marginTop: "110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ fontSize: "32px" }}>View Exam</h1>

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
                        <IconButton>
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

          <Button onClick={() => router.push("/exam/manage-exam")}>
            <Tooltip title="Back">
              <UndoIcon
                sx={{
                  color: "red",
                }}
              ></UndoIcon>
            </Tooltip>
          </Button>
        </div>

        <div
          style={{
            width: "90%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Phần đầu */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "10px 15px",
            }}
          >
            <h2>Title: {examData?.title}</h2>
            <h2>Duration: {examData?.duration} minutes</h2>
            <h2>Exam ID: {examId ? examId.slice(-5) : "id"}</h2>
          </div>

          {/* Gạch ngang ngăn cách */}
          <div
            style={{
              borderBottom: "1px solid #ccc",
              margin: "5px 0",
            }}
          />
          <div>
            {listData.map((question, index) => (
              <div
                key={question._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "-35px",
                  marginBottom: "20px",
                }}
              >
                <div
                  key={question._id} // Thêm key để tránh cảnh báo
                  className={classes.questionItem}
                  style={{
                    color: "#000",
                    gap: "15px",
                    fontSize: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "#000",
                      fontWeight: "600",
                    }}
                  >
                    {(page - 1) * 10 + index + 1}. {question.questionText}
                  </span>

                  <div>
                    {question.options.map((option, i) => (
                      <p
                        key={i}
                        style={{
                          color: "#000",
                          marginBottom: "5px",
                        }}
                      >
                        {String.fromCharCode(65 + i)}. {option}
                      </p>
                    ))}
                    <p
                      style={{
                        marginTop: "10px",
                        color: "#1DB0A6",
                        fontSize: "20px",
                      }}
                    >
                      Correct Answer:{" "}
                      {question.correctAnswer
                        ? String.fromCharCode(
                            65 +
                              question.options.indexOf(question.correctAnswer)
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginRight: "50px",
                  }}
                >
                  <Button
                    onClick={() => handleEditQuestion(question)}
                    sx={{
                      minWidth: "40px",
                      marginLeft: "10px",
                    }}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    onClick={() => handleDeleteQuestion(question._id)}
                    sx={{
                      minWidth: "40px",
                      marginLeft: "10px",
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Nút chuyển trang */}
        </div>
        <div
          className={classes.pagination}
          style={{
            paddingBottom: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pagination
            count={totalPage}
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
        </div>
      </Container>

      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>
          {" "}
          <h3>Edit Question</h3>
        </DialogTitle>
        <DialogContent>
          {/* Add your form fields here to edit the question */}
          <TextField
            margin="normal"
            label="Question Text"
            value={selectedQuestion?.questionText || ""}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            fullWidth
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "center",
            }}
          >
            <span style={{ marginRight: "10px" }}>Answer options: </span>
            <Button
              onClick={handleAddOption}
              className={`${classes2.btnGreen} ${classes2.btnMedium}`}
              variant="outlined"
            >
              + Add option
            </Button>
          </div>
          <div>
            {options.map((option, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 1,
                }}
              >
                <Radio
                  checked={selectedQuestion?.correctAnswer === option}
                  onChange={() => {
                    const newCorrectAnswer = option;
                    const updatedData = {
                      ...selectedQuestion,
                      correctAnswer: newCorrectAnswer,
                    };
                    setSelectedQuestion(updatedData);
                    setUpdateQuestionData(updatedData);
                  }}
                  sx={{
                    color: "green",
                    "&.Mui-checked": {
                      color: "green",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label={`Option ${String.fromCharCode(65 + index)}:`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  margin="normal"
                  sx={{ borderRadius: "8px" }}
                />
                <Button
                  onClick={() => handleRemoveOption(index)}
                  color="error"
                  sx={{ marginLeft: 1 }}
                >
                  <DeleteIcon />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseEditModal}
            className={`${classes2.btnRed} ${classes2.btnSmall}`}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            className={`${classes2.btnBlue} ${classes2.btnSmall}`}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
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
            Do you want to delete this question?
          </DialogTitle>
        </Box>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDeleteModal}
            color="primary"
            autoFocus
            startIcon={<CancelIcon />}
            className={classes2.btnBlue}
            sx={{ minWidth: "120px" }}
          >
            No
          </Button>
          <Button
            onClick={confirmDeleteQuestion}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            className={classes2.btnRed}
            sx={{ minWidth: "120px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewExamForm;
