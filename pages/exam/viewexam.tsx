import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import {
  getExamById,
  listQuestions,
  updateQuestion,
  deleteQuestion,
  searchQuestions,
} from "../../helpers/api/exam-api";
import { useSession } from "next-auth/react"; // Import useSession to get token
//import styles from './ViewExam.module.scss';
import NavBarHome from "../../components/home/navbar-home";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Radio from "@mui/material/Radio"; // Nhập Radio từ Material-UI
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search"; // Import the Search icon
import InputAdornment from "@mui/material/InputAdornment"; // {{ edit_1 }}
import EPaginationOfPage from "../user/list"; // Adjusted to default import
import Pagination from "@mui/material/Pagination";

interface Exam {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  _id?: string; // Optional if it may not always be present
}

interface Question {
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  _id?: string; // Add this line to include the _id property
  originalIndex?: number; // Add this line to include the originalIndex property
}

const ViewExam: React.FC = () => {
  const { data: session, status } = useSession(); // Lấy dữ liệu phiên làm việc và trạng thái
  const token = session?.accessToken; // Giả sử accessToken được lưu trong phiên làm việc
  const [currentDateTime, setCurrentDateTime] = useState<string>(""); // Trạng thái cho thời gian hiện tại
  const [examData, setExamData] = useState<Exam | null>(null); // Dữ liệu kỳ thi
  const [questions, setQuestions] = useState<Question[]>([]); // Khởi tạo với mảng rỗng
  const [error, setError] = useState<string | null>(null); // Lưu trữ lỗi
  const loadingBarRef = useRef(null); // Tham chiếu đến thanh tải
  const examId = "671f5ac78df4d692c782a559"; // Thay thế bằng ID kỳ thi thực tế
  const [page, setPage] = useState(1); // Bắt đầu từ trang 1
  const USERS_PER_PAGE = 3; // Đảm bảo rằng giá trị này là một số hợp lệ
  const [limit, setLimit] = useState(USERS_PER_PAGE); // Use the defined constant
  const [totalQuestions, setTotalQuestions] = useState(0); // Tổng số câu hỏi
  const [loading, setLoading] = useState<boolean>(false); // Trạng thái tải
  // Trạng thái modal
  const [openEditModal, setOpenEditModal] = useState(false); // Trạng thái modal chỉnh sửa kỳ thi
  const [formData, setFormData] = useState<Exam>({
    // Dữ liệu cho form chỉnh sửa kỳ thi
    id: "",
    title: "",
    startTime: "",
    endTime: "",
  });

  const [openEditQuestionModal, setOpenEditQuestionModal] = useState(false); // Trạng thái modal chỉnh sửa câu hỏi
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  ); // Câu hỏi được chọn

  const [options, setOptions] = useState<string[]>(
    selectedQuestion?.options || ["", "", ""]
  ); // Khởi tạo với 3 tùy chọn rỗng
  

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null); // Chỉ số câu hỏi hiện tại
const [openDeleteModal, setOpenDeleteModal] = useState(false); // Trạng thái modal xác nhận xóa
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null); // Câu hỏi cần xóa

  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  const [searchResults, setSearchResults] = useState<Question[]>([]); // Remove this line

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  const searchQuestionsHandler = async (value: string) => {
    setSearchQuery(value || "");
    if (value) {
      try {
        const results = await searchQuestions(
          session.userId,
          session.accessToken,
          examId,
          value
        );
        setSearchResults(results);
        setPage(1); // Reset page when starting a new search
        return results; // Return the results
      } catch (error) {
        console.error("Error searching questions:", error);
        toast.error("Failed to search questions");
      }
    } else {
      // If search term is empty, reset to the full questions list
      await listQuestionsHandler();
    }
    return []; // Return an empty array if no results
  };

  const listQuestionsHandler = async () => {
    if (status === "authenticated" && session) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        
        try {
          const questionsResponse = await listQuestions(
            examId,
            userId,
            accessToken,
            page,
            limit
          );
          setQuestions(questionsResponse.questions);
          setTotalQuestions(questionsResponse.total);
        } catch (error) {
          console.error("Error fetching questions:", error);
          toast.error("Failed to fetch questions");
        }
      }
    }
  };

  const handleSearch = async (
    event: React.ChangeEvent<{}> | null,
    value: string | null
  ) => {
    setSearchQuery(value || "");
    if (value) {
      const results = await searchQuestionsHandler(value);
      // Ánh xạ kết quả để bao gồm chỉ số gốc
      const indexedResults = results.map((question) => {
        const originalIndex = allQuestions.findIndex(q => q._id === question._id);
        return { ...question, originalIndex };
      });
      setSearchResults(indexedResults);
    } else {
      setSearchResults([]); // Xóa kết quả tìm kiếm nếu không có truy vấn
      await listQuestionsHandler();
    }
  };

  const handleAddOption = async () => {
    // Hàm thêm tùy chọn mới
    const newOptions = [...options, ""]; // Thêm một tùy chọn mới
    setOptions(newOptions); // Cập nhật trạng thái

    // Cập nhật cơ sở dữ liệu
    if (selectedQuestion) {
      const updatedQuestionData = {
        ...selectedQuestion,
        options: newOptions,
      };
      await updateQuestion(
        // Gọi API để cập nhật câu hỏi
        examId,
        selectedQuestion._id,
        session.userId,
        session.accessToken,
        updatedQuestionData
      );
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    // Hàm xử lý thay đổi tùy chọn
    const newOptions = [...options];
    newOptions[index] = value; // Cập nhật giá trị của tùy chọn
    setOptions(newOptions); // Cập nhật trạng thái
  };

  const handleRemoveOption = async (index: number) => {
    const newOptions = options.filter((_, i) => i !== index); // Xóa tùy chọn tại index
    setOptions(newOptions); // Cập nhật trạng thái

    // Cập nhật cơ sở dữ liệu
    if (selectedQuestion) {
      const updatedQuestionData = {
        ...selectedQuestion,
        options: newOptions,
      };
      await updateQuestion(
        examId,
        selectedQuestion._id,
        session.userId,
        session.accessToken,
        updatedQuestionData
      );
    }
  };

  const mapCorrectAnswersToLabels = (
    correctAnswer: string | string[],
    options: string[]
  ) => {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer
        .map((answer) => {
          const index = options.indexOf(answer);
return index !== -1 ? String.fromCharCode(65 + index) : null;
        })
        .filter(Boolean)
        .join(" and ");
    } else {
      return correctAnswer
        .split("|")
        .map((answer) => {
          const index = options.indexOf(answer);
          return index !== -1 ? String.fromCharCode(65 + index) : null;
        })
        .filter(Boolean)
        .join(" and ");
    }
  };

  useEffect(() => {
    const fetchExamData = async () => {
      if (status === "authenticated" && session) {
        try {
          const response = await getExamById(
            examId,
            session.userId,
            session.accessToken
          );
          setExamData(response);

          // Fetch all questions initially
          await listQuestionsHandler();
        } catch (error) {
          console.error("Error fetching exam data:", error);
          setError("Failed to fetch exam data.");
        }
      } else {
        setError("User is not authenticated.");
      }
    };

    fetchExamData();
  }, [examId, token, status]); // Removed page and limit from dependencies to avoid unnecessary re-fetching

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleEditExam = () => {
    if (examData) {
      setFormData({
        id: examData._id,
        title: examData.title,
        startTime: examData.startTime,
        endTime: examData.endTime,
      });
    }
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleUpdateExam = async () => {
    // Logic to update exam
    handleCloseEditModal();
  };

  const handleEditQuestion = (question: Question, index: number) => {
    setSelectedQuestion(question);
    setOptions(question.options); // Initialize options from the selected question
    setOpenEditQuestionModal(true);
    setCurrentQuestionIndex(index); // Lưu chỉ số câu hỏi hiện tại
  };

  const handleCloseEditQuestionModal = () => {
    setOpenEditQuestionModal(false);
    setSelectedQuestion(null);
  };

  const handleQuestionTypeChange = (newType: string) => {
    setOptions(["Option A", "Option B", "Option C", "Option D"]);
    setSelectedQuestion((prev) => ({
      ...prev,
      questionType: "Single Choice",
options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "",
    }));
  };

  const handleUpdateQuestion = async () => {
    if (status !== "authenticated" || !session || !selectedQuestion) {
      setError("User is not authenticated or no question selected.");
      return;
    }

    setLoading(true); // Bắt đầu tải
    setError(null); // Đặt lại trạng thái lỗi

    try {
      // Kiểm tra loại câu hỏi và định dạng đáp án đúng phù hợp
      let formattedCorrectAnswer;
      if (selectedQuestion.questionType === "Single Choice") {
        formattedCorrectAnswer = selectedQuestion.correctAnswer as string;
      }

      // Cập nhật câu hỏi với các tùy chọn và đáp án đúng
      const updatedQuestionData = {
        ...selectedQuestion,
        options: options,
        correctAnswer: formattedCorrectAnswer,
      };

      // Gọi API để cập nhật câu hỏi
      await updateQuestion(
        examId,
        selectedQuestion._id,
        session.userId,
        session.accessToken,
        updatedQuestionData
      );

      toast.success("The question has been successfully updated");

      // Tải lại trang để phản ánh các thay đổi
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating question:", error);
      setError(error.message || "Failed to update question");
      toast.error(error.message || "Failed to update question");
    } finally {
      setLoading(false); // Kết thúc tải
      handleCloseEditQuestionModal();
    }
  };

  const calculateTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const fetchQuestions = async (page: number) => {
    if (status === "authenticated" && session) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        try {
          const questionsResponse = await listQuestions(
            examId,
            userId,
            accessToken,
            page,
            limit
          );
          setQuestions(questionsResponse.questions);
          setTotalQuestions(questionsResponse.total);
        } catch (error) {
          console.error("Error fetching questions:", error);
          toast.error("Failed to fetch questions");
        }
      }
    }
  };

  const handlePageChange = async (newPage: number) => {
    const totalPages = calculateTotalPages(totalQuestions, limit);

    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      if (!searchQuery) {
        await fetchQuestions(newPage); // Đảm bảo gọi hàm fetchQuestions với trang mới
      }
    }
  };

  const totalPages = Math.ceil(totalQuestions / limit);

  const handleExit = () => {
    // Logic to handle exit, e.g., redirecting or closing the exam
    console.log("Exiting the exam");
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
    setOpenDeleteModal(true);
  };

  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        await deleteQuestion(
          examId,
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
const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setQuestionToDelete(null);
  };

  // Hiển thị câu hỏi dựa trên trang hiện tại
  const displayedQuestions = (searchQuery ? searchResults : allQuestions).slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE
  );

  useEffect(() => {
    if (!searchQuery) {
      fetchQuestions(page); // Gọi hàm fetchQuestions với trang hiện tại
    }
  }, [page, searchQuery]); // Theo dõi sự thay đổi của page và searchQuery

  useEffect(() => {
    const fetchAllQuestions = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const response = await listQuestions(
              examId,
              userId,
              accessToken,
              1,
              100000 // Lấy tất cả câu hỏi
            );
            setAllQuestions(response.questions);
            setTotalQuestions(response.total);
          } catch (error) {
            console.error("Lỗi khi lấy tất cả câu hỏi:", error);
            toast.error("Không thể lấy tất cả câu hỏi");
          } finally {
            setLoading(false);
          }
        }
      }
    };
    fetchAllQuestions();
  }, [status, session]);

  return (
    <>
      <NavBarHome loadingBarRef={loadingBarRef} />
      <Container>
        <div
          style={{
            marginTop: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            style={{
              fontWeight: 700,
              color: "#1DB0A6",
              fontFamily: "Lexend, sans-serif",
              marginRight: "10px",
              marginBottom: "20px",
            }}
          >
            View Exam
          </Typography>
          {/* <Stack spacing={2} sx={{ width: 500 }}>
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
          </Stack> */}
          <TextField
            variant="outlined"
            placeholder="Search"
            value={searchQuery}
            onChange={(event) => handleSearch(event, event.target.value)}
            sx={{ 
              marginLeft: 2, 
              width: "600px", 
              borderRadius: "20px", // Add border radius for rounded corners
              boxShadow: 3, // Add shadow effect
            }} // Adjust width as needed
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "20px", // Ensure the outline is also rounded
                },
              },
            }}
          />

          <Box>
            <Button
              variant="contained"
              color="error"
              sx={{
                marginLeft: "10px",
                padding: "10px 30px", // Increase padding for a larger button
                fontSize: "15px",
                borderRadius: "20px",
                 boxShadow: 3// Increase font size
              }}
              onClick={handleExit}
            >
              Exit
            </Button>
          </Box>
        </div>

        <Box
          sx={{
            width: "90%",
            margin: "0 auto",
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            boxShadow: 4, // Add shadow effect here
          }}
        >
          {/* Phần đầu */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              padding: "10px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#000" }}>
              {examData ? "Kỳ thi cuối kỳ 3" : "Tên bài kiểm tra"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#000", fontSize: "1.2rem", fontWeight: "bold" }}
            >
              Time:{" "}
              {examData
                ? Math.round(
                    (new Date(examData.endTime).getTime() -
                      new Date(examData.startTime).getTime()) /
                      60000
                  ) + " minutes"
                : "N/A"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#000", fontSize: "1.2rem", fontWeight: "bold" }}
            >
              Exam ID: {examData ? examData._id.slice(-5) : "ID bài kiểm tra"}
            </Typography>
          </Box>

          {/* Gạch ngang ngăn cách */}
          <Box sx={{ borderBottom: "1px solid #ccc", margin: "10px 0" }} />

          {/* Phần câu hỏi */}
          {/* <Box sx={{ flex: "1 0 85%", overflowY: "hidden", padding: "10px" }}>
            {questions.map((question, index) => (
              <Box
                key={index}
                sx={{
                  marginBottom: 2,
                  borderBottom: "1px solid #ccc",
                  paddingBottom: 2,
                  paddingLeft: 5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ color: "black", fontWeight: "bold" }}
                  >
                    Question {index + 1 + (page - 1) * limit}:{" "}
                    {question.questionText}
                  </Typography>
                  <Box>
                    <Button
                      onClick={() => handleEditQuestion(question, index)}
                      sx={{ minWidth: "40px", marginLeft: "10px" }}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuestion(question._id)}
                      sx={{ minWidth: "40px", marginLeft: "10px" }}
                      color="error"
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </Box>
                {question.options.map((option, i) => (
                  <p key={i} style={{ color: "black" }}>
                    {String.fromCharCode(65 + i)}. {option}
                  </p>
                ))}
                <Typography
                  variant="body2"
                  sx={{ color: "black", fontWeight: "bold" }}
                >
                  True answer:{" "}
                  {question.correctAnswer
                    ? String.fromCharCode(
                        65 + question.options.indexOf(question.correctAnswer)
                      )
                    : "N/A"}
                </Typography>
              </Box>
            ))}
          </Box> */}
          <Box sx={{ flex: "1 0 85%", overflowY: "hidden", padding: "10px" }}>
            {displayedQuestions.length > 0 ? (
              displayedQuestions.map((question, index) => (
                <Box
                  key={index}
                  sx={{
                    marginBottom: 2,
                    borderBottom: "1px solid #ccc",
                    paddingBottom: 2,
                    paddingLeft: 5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: "black", fontWeight: "bold" }}
                    >
                      Question {searchQuery ? question.originalIndex + 1 : index + 1 + (page - 1) * USERS_PER_PAGE}: {question.questionText}
                    </Typography>
                    <Box>
                      <Button
                        onClick={() => handleEditQuestion(question, index)}
                        sx={{ minWidth: "40px", marginLeft: "10px" }}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        onClick={() => handleDeleteQuestion(question._id)}
                        sx={{ minWidth: "40px", marginLeft: "10px" }}
                        color="error"
                      >
                        <DeleteIcon />
                      </Button>
                    </Box>
                  </Box>
                  {question.options.map((option, i) => (
                    <p key={i} style={{ color: "black" }}>
                      {String.fromCharCode(65 + i)}. {option}
                    </p>
                  ))}
                  <Typography
                    variant="body2"
                    sx={{ color: "black", fontWeight: "bold" }}
                  >
                    Correct Answer:{" "}
                    {question.correctAnswer
                      ? String.fromCharCode(
                          65 + question.options.indexOf(question.correctAnswer)
                        )
                      : "N/A"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No questions available.</Typography>
            )}
          </Box>

          {/* Pagination Box */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              sx={{ color: "black" }}
            >
              {"<<"} Previous
            </Button>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === calculateTotalPages(searchQuery ? searchResults.length : totalQuestions, limit)}
              sx={{ color: "black" }}
            >
              Next {">>"}
            </Button>
          </Box>

          {/* Page Number Box in Bottom Right Corner */}
          <Box
            sx={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: "20px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {page} / {totalPages}
          </Box>
        </Box>

        <Modal
          open={openEditModal}
          onClose={handleCloseEditModal}
          aria-labelledby="edit-exam-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 10,
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Edit Exam
            </Typography>
            <TextField
              fullWidth
              label="Exam Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpdateExam}
              sx={{ mt: 2 }}
            >
              Update Exam
            </Button>
          </Box>
        </Modal>

        <Modal
          open={openEditQuestionModal}
          onClose={handleCloseEditQuestionModal}
          aria-labelledby="edit-question-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 900,
              height: 1000,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Edit Question{" "}
              {selectedQuestion
                ? `#${currentQuestionIndex + 1 + (page - 1) * limit}`
                : ""}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ marginRight: 2, color: "black", fontWeight: 800 }}
              >
                Question{" "}
                {selectedQuestion
                  ? `${currentQuestionIndex + 1 + (page - 1) * limit}`
                  : ""}
              </Typography>
              <TextField
                fullWidth
                label=" "
                value={selectedQuestion?.questionText || ""}
                onChange={(e) =>
                  setSelectedQuestion({
                    ...selectedQuestion,
questionText: e.target.value,
                  })
                }
                margin="normal"
                multiline
                rows={4}
                sx={{ flex: 1, borderRadius: "8px" }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Typography variant="body1" sx={{ color: "black" }}>
                Answer options:
              </Typography>
              <Button onClick={handleAddOption} variant="outlined">
                + Add option
              </Button>
            </Box>

            {options.map((option, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <Radio
                  checked={selectedQuestion?.correctAnswer === option}
                  onChange={() => {
                    const newCorrectAnswer = option; // Chọn đáp án đúng
                    setSelectedQuestion({
                      ...selectedQuestion,
                      correctAnswer: newCorrectAnswer,
                    });
                  }}
                  sx={{ color: "green", "&.Mui-checked": { color: "green" } }}
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
              </Box>
            ))}

            {/* Add True Answer Field */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body1" sx={{ color: "black" }}>
                True Answer:
              </Typography>
              <TextField
                fullWidth
                label=""
                value={
                  selectedQuestion?.correctAnswer
                    ? String.fromCharCode(
                        65 + options.indexOf(selectedQuestion.correctAnswer)
                      )
                    : ""
                }
                onChange={(e) => {
                  const answerIndex =
                    e.target.value.toUpperCase().charCodeAt(0) - 65; // Convert A, B, C, D, E to index
                  if (answerIndex >= 0 && answerIndex < options.length) {
                    setSelectedQuestion({
                      ...selectedQuestion,
                      correctAnswer: options[answerIndex],
                    });
}
                }}
                margin="normal"
                sx={{ borderRadius: "8px" }}
              />
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
              <Button
                variant="contained"
                onClick={handleUpdateQuestion}
                sx={{
                  padding: "13px 20px", // Specific padding size
                  fontSize: "13px", // Font size
                  minWidth: "200px", // Minimum width if needed
                  borderRadius: "20px", // Rounded corners
                  backgroundColor: "#229594", // Custom background color
                  color: "white", // Text color
                  "&:hover": {
                    backgroundColor: "#1a7a7a", // Darker shade on hover
                  },
                }}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal for Delete Confirmation */}
        <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)", // Center the modal
              padding: 4,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
              Delete Question
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "black", textAlign: "center" }}
            >
              Do you want to delete this question?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <Button variant="outlined" onClick={handleCloseDeleteModal}>
                No
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDeleteQuestion}
              >
                Yes, Delete!
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </>
  );
};

export default ViewExam;