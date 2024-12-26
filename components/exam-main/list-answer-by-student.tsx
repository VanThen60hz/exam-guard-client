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
import Image from "next/image";
import { getListAnswerByStudent } from "../../helpers/api/exam-api";

// Icons
import UndoIcon from "@mui/icons-material/Undo";

// Components
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth/with-auth";
import LinearProgress from "@mui/material/LinearProgress";
import classes from "../../components/exam-main/manage-exam.module.scss";
import { log } from "console";

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
  const [listAnswerByStudent2, setListAnswerByStudent2] =
    useState<Student | null>(null);

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
            console.log("alo", listAnswerByStudent);
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
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            margin: "20px auto",
            maxWidth: "50%",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {listAnswerByStudent.length > 0 ? (
            listAnswerByStudent.map((asw, index) => (
              <Box
                key={asw._id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "#000",
                      fontWeight: "600",
                      fontSize: "19px",
                    }}
                  >
                    {(page - 1) * limit + index + 1}.{" "}
                    {asw.question.questionText}
                  </span>
                </Box>
                <Box
                  sx={{
                    fontSize: "19px",
                  }}
                >
                  {asw.question.options.map((option, i) => {
                    const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
                    const isCorrectAnswer =
                      asw.question.correctAnswer === option;
                    const isStudentAnswer = asw.answerText === option;

                    return (
                      <Box key={i} sx={{ marginLeft: "10px" }}>
                        <p
                          style={{
                            color: isCorrectAnswer
                              ? "#1DB0A6"
                              : isStudentAnswer && !asw.isCorrect
                              ? "red"
                              : "#000",
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
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: "center", marginTop: 2 }}>
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
