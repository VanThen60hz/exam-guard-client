import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { getListAnswerByStudent } from "../../helpers/api/exam-api";

// Icons
import UndoIcon from "@mui/icons-material/Undo";

// Components
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth/with-auth";
import LinearProgress from "@mui/material/LinearProgress";
import classes from "../../components/exam-main/manage-exam.module.scss";

// Định nghĩa interface cho Student
interface Student {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
}

const ListAnswerByStudent: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const router = useRouter();
  const { examId, studentId } = router.query;
  const [listAnswerByStudent, setListAnswerByStudent] = useState([]);
  const [listAnswerByStudent2, setListAnswerByStudent2] = useState<Student | null>(null);

  //Get List Cheating by Student
  useEffect(() => {
    const fetchListAnswerByStudent = async () => {
      setLoading(true);
      if (status === "authenticated" && session && examId && studentId) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const listAnswerByStudent = await getListAnswerByStudent(
              userId,
              accessToken,
              examId as string,
              studentId as string,
              page,
              limit
            );
            setListAnswerByStudent(listAnswerByStudent.answers);
            setListAnswerByStudent2(listAnswerByStudent.student);
            setTotalPage(listAnswerByStudent.totalPages);
          } catch (error) {
            toast.error("Failed to fetch list answer by student");
          }
        }
      }
      setLoading(false);
    };
    fetchListAnswerByStudent();
  }, [status, session, examId, studentId, page, limit]);

  // Change page
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //Styled
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "#229594",
      color: theme.palette.common.white,
      fontWeight: "bold",
      fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      fontWeight: "400",
      whiteSpace: "normal",
      wordBreak: "break-word",
      color: theme.palette.text.primary,
    },
  }));

  //Styled table row
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: "#e0f2f2",
      transition: "background-color 0.3s ease",
    },
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const handleBackClick = (examId) => {
    router.push({
      pathname: "/exam/list-grade",
      query: { examId: examId },
    });
  };

  const handleBackClick2 = (questionId) => {
    router.push({
      pathname: "/exam/list-answer-by-question",
      query: { questionId: questionId },
    });
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
      <Box sx={{ margin: "130px 50px 50px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2> List Answer By {listAnswerByStudent2?.name}</h2>{" "}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                color: "rgba(0, 0, 0, 0.87)",
                fontSize: "20px",
                fontFamily: "Montserrat",
              }}
            >
              Email: {listAnswerByStudent2?.email}
            </p>
            <Button onClick={() => handleBackClick(examId)}>
              <Tooltip title="Back">
                <UndoIcon
                  sx={{
                    color: "red",
                  }}
                ></UndoIcon>
              </Tooltip>
            </Button>
          </Box>
        </Box>
        {/* <Box
          sx={{
            borderBottom: "1px solid #ccc",
            margin: "5px auto",
            maxWidth: "60%",
          }}
        /> */}
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            margin: "20px auto",
            maxWidth: "50%",
          }}
        >
          {listAnswerByStudent.map((asw, index) => (
            <Box
              key={asw._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                // fontFamily: "Roboto",
              }}
            >
              <Box
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
                  {(page - 1) * limit + index + 1}. {asw.question.questionText}
                </span>

                <Box>
                  {asw.question.options.map((option, i) => {
                    const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
                    const isCorrectAnswer =
                      asw.question.correctAnswer === option; // Kiểm tra câu trả lời đúng
                    const isStudentAnswer = asw.answerText === option; // Kiểm tra câu trả lời của sinh viên

                    return (
                      <Box key={i}>
                        <p
                          style={{
                            marginLeft: 10,
                            color: isCorrectAnswer
                              ? "#1DB0A6"
                              : isStudentAnswer && !asw.isCorrect
                              ? "red"
                              : "#000", // Tô màu cho đáp án
                          }}
                        >
                          {optionLetter}. {option}
                        </p>
                      </Box>
                    );
                  })}
                  <Button
                    sx={{ marginTop: 1 }}
                    className={`${classes.btnGreen} ${classes.btnLarge} ${classes.btnBorderRadius}`}
                    onClick={() => handleBackClick2(asw.question._id)}
                  >
                    View all students{" "}
                  </Button>
                  {/* <p
                    style={{
                      color: "#007e7d",
                      fontSize: "18px",
                    }}
                  >
                    Correct Answer:{" "}
                    {asw.question.correctAnswer
                      ? String.fromCharCode(
                          65 +
                            asw.question.options.indexOf(
                              asw.question.correctAnswer
                            )
                        )
                      : "N/A"}
                  </p>
                  <p
                    style={{
                      color: asw.answerText !== asw.question.correctAnswer ? "red" : "#007e7d",
                      fontSize: "18px",
                    }}
                  >
                    Answer Student:{" "}
                    {asw.answerText
                      ? String.fromCharCode(
                          65 + asw.question.options.indexOf(asw.answerText)
                        )
                      : "N/A"}
                  </p> */}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
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
      </Box>
    </>
  );
};

export default withAuth(ListAnswerByStudent, ["TEACHER"]);
