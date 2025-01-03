import React, { useState, useEffect, useRef } from "react";
import {
  LinearProgress,
  Container,
  Button,
  TextField,
  Radio,
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
  Tooltip,
  Typography,
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
  updateExam,
  getExam,
} from "../../helpers/api/exam-api";
import withAuth from "../../components/withAuth/with-auth";
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

type Errors = {
  title?: string;
  description?: string;
  duration?: string;
};

const EditExamForm: React.FC = () => {
  const [listData, setListData] = useState([]);
  const [examData, setExamData] = useState<ExamData | null>(null);
  let exam = null;
  const [originPage, setOriginPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { examId } = router.query;
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // List tất cả câu hỏi
  const [allQuestion, setAllQuestion] = useState([]);
  const page2 = 1;
  const limit2 = 100000;

  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false); // Trạng thái modal xác nhận xóa
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [updateTitle, setUpdateTitle] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>(
    selectedQuestion?.options || ["", "", ""]
  );
  const [updateQuestionData, setUpdateQuestionData] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null); // Câu hỏi cần xóa
  const [listExam, setListExam] = useState([]);
  const [editingExam, setEditingExam] = useState(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setLoading(true);
    const fetchExamData = async () => {
      if (examId && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        const examData = await getExam(userId, accessToken, examId as string);
        setEditingExam(examData);
      }
      setLoading(false);
    };

    fetchExamData();
  }, [examId, session]);

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingExam((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleEditSave = async () => {
    const newErrors: Errors = {}; // Khởi tạo newErrors
    if (!editingExam?.title) {
      newErrors.title = "Title is required";
    }
    if (!editingExam?.description) {
      newErrors.description = "Description is required";
    }
    if (!editingExam?.duration) {
      newErrors.duration = "Duration is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return; // Dừng lại nếu có lỗi
    }
    try {
      await handleSaveEdit(editingExam);
      setEditingExam(null);
      router.push("/exam/manage-exam");
    } catch (error) {
      toast.error("Failed to update exam");
    }
  };

  const handleSaveEdit = async (examToUpdate) => {
    if (status === "authenticated" && session) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        try {
          const updatedExamData = await updateExam(
            userId,
            accessToken,
            examToUpdate._id,
            examToUpdate
          );
          setListExam(
            listExam.map((exam) =>
              exam._id === updatedExamData._id ? updatedExamData : exam
            )
          );
          setEditingExam(null);
          toast.success("Exam updated successfully");
        } catch (error) {
          toast.error("Failed to update exam");
        }
      }
    }
  };

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
          toast.error("Failed to get all questions");
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
            toast.error("Failed to get all questions:");
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
          const exam = await getExamById(
            examId as string,
            session.userId,
            session.accessToken
          );
          setExamData(exam);
          console.log(exam);
        } catch (error) {
          toast.error("Failed to fetch exam data.");
        }
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
    setUpdateTitle(question?.questionText);
    setCorrectAnswer(question?.correctAnswer);
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
    setUpdateTitle(null);
    setCorrectAnswer(null);
    setOptions(["", "", ""]);
    setUpdateQuestionData(null);
  };

  const handleSaveChanges = async () => {
    try {
      // if (updateQuestionData) {
      //     // Gọi API để cập nhật câu hỏi
      //     await updateQuestion(
      //         examId as string,
      //         selectedQuestion._id,
      //         session.userId,
      //         session.accessToken,
      //         updateQuestionData
      //     );
      // }
      if (updateTitle) {
        await updateQuestion(
          examId as string,
          selectedQuestion._id,
          session.userId,
          session.accessToken,
          {
            questionText: updateTitle,
            options: options,
            correctAnswer: correctAnswer,
          }
        );
      }
      // Đóng modal và làm mới danh sách câu hỏi
      handleCloseEditModal();
      await fetchListQuestions();
    } catch (error) {
      console.error("Failed to save question:", error);
    }
  };

  const handleQuestionTextChange = (value: string) => {
    // setSelectedQuestion({
    //     ...selectedQuestion,
    //     questionText: value,
    // });
    setUpdateTitle(value);
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
            justifyContent: "flex-end",
            marginBottom: "30px",
          }}
        >
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

          <Button
            sx={{ marginLeft: "250px" }}
            onClick={() => router.push("/exam/manage-exam")}
          >
            <Tooltip title="Back">
              <UndoIcon
                sx={{
                  color: "red",
                }}
              ></UndoIcon>
            </Tooltip>
          </Button>
        </div>

        <Container
          component="main"
          sx={{
            width: "95%",
            margin: "0 auto",
            paddingBottom: "10px",
          }}
        >
          <Box
            sx={{
              border: "2px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              marginTop: "20px",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 700,
                marginBottom: "10px",
                fontSize: 29,
              }}
            >
              EDIT EXAM
            </Typography>
            <Box component="form" noValidate>
              <Box>
                <Box sx={{ marginBottom: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Title <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    name="title"
                    type="text"
                    fullWidth
                    value={editingExam?.title || ""}
                    onChange={handleEditChange}
                    className={classes.textFieldCustom}
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
                    id="description"
                    multiline
                    rows={3}
                    variant="outlined"
                    value={editingExam?.description || ""}
                    onChange={handleEditChange}
                    className={classes.textFieldCustom}
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
                  marginBottom: 3,
                }}
                className={classes.textFieldCustom}
              >
                <Box sx={{ minWidth: 330, marginRight: "20px" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Start Time <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    name="startTime"
                    fullWidth
                    required
                    id="startTime"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true, // Đảm bảo nhãn không bị che khuất
                    }}
                    value={
                      editingExam?.startTime
                        ? new Date(editingExam.startTime)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={handleEditChange}
                    inputProps={{
                      min: new Date(
                        new Date().setMinutes(
                          new Date().getMinutes() -
                            new Date().getTimezoneOffset()
                        )
                      )
                        .toISOString()
                        .slice(0, 16), // Ràng buộc không chọn ngày đã qua
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 330, marginRight: "20px" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    End Time <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    name="endTime"
                    fullWidth
                    required
                    id="endTime"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true, // Đảm bảo nhãn không bị che khuất
                    }}
                    value={
                      editingExam?.endTime
                        ? new Date(editingExam.endTime)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={handleEditChange}
                    inputProps={{
                      min: new Date(
                        new Date().setMinutes(
                          new Date().getMinutes() -
                            new Date().getTimezoneOffset()
                        )
                      )
                        .toISOString()
                        .slice(0, 16), // Ràng buộc không chọn ngày đã qua
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 300, width: "100%" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Duration <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    name="duration"
                    type="number"
                    fullWidth
                    value={editingExam?.duration || ""}
                    onChange={handleEditChange}
                    className={classes.textFieldCustom}
                    InputProps={{
                      endAdornment: (
                        <Typography variant="subtitle1" sx={{ marginLeft: 1 }}>
                          min
                        </Typography>
                      ),
                    }}
                  />
                  {errors.duration && (
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errors.duration}
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
                  onClick={handleEditSave}
                  variant="contained"
                  className={`${classes2.btnBlue} ${classes2.btnMedium}`}
                >
                  Update
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>

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
                    {(page - 1) * limit + index + 1}. {question.questionText}
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
          <h3>EDIT QUESTION</h3>
        </DialogTitle>
        <DialogContent>
          {/* Add your form fields here to edit the question */}
          <TextField
            margin="normal"
            label="Question Text"
            value={updateTitle || ""}
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
              className={`${classes2.btnGreen} ${classes2.btnMedium} ${classes2.btnBorderRadius}`}
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
                    setCorrectAnswer(newCorrectAnswer);
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

export default withAuth(EditExamForm, ["TEACHER"]);
