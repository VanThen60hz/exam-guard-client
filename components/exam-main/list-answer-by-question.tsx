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
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { getListAnswerByQuestion } from "../../helpers/api/exam-api";
import UndoIcon from "@mui/icons-material/Undo";
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth/with-auth";
import LinearProgress from "@mui/material/LinearProgress";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import NavBarHome from "../../components/home/navbar-home";

const ListAnswerByQuestion: React.FC = () => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const router = useRouter();
  const { questionId } = router.query;
  const [listAnswerByQuestion, setListAnswerByQuestion] = useState([]);

  //Get List Cheating by Student
  useEffect(() => {
    const fetchListAnswerByQuestion = async () => {
      setLoading(true);
      if (status === "authenticated" && session && questionId) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const listAnswerByQuestion = await getListAnswerByQuestion(
              userId,
              accessToken,
              questionId as string,
              page,
              limit
            );
            setListAnswerByQuestion(listAnswerByQuestion.answers);
            setTotalPage(listAnswerByQuestion.totalPages);
          } catch (error) {
            toast.error("Failed to fetch list answer by question");
          }
        }
      }
      setLoading(false);
    };
    fetchListAnswerByQuestion();
  }, [status, session, questionId, page, limit]);

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

  const handleBackClick = () => {
    router.back(); // Quay lại trang trước đó
  };

  return (
    <>
      <NavBarHome loadingBarRef={loadingBarRef} />
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
            justifyContent: "flex-end",
            marginBottom: 2,
          }}
        >
          <Button onClick={() => handleBackClick()}>
            <Tooltip title="Back">
              <UndoIcon
                sx={{
                  color: "red",
                }}
              />
            </Tooltip>
          </Button>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px", // Thêm bo góc nhẹ
            overflow: "hidden",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <Table
            sx={{ minWidth: 700, tableLayout: "fixed" }}
            aria-label="customized table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell width="3%">Avatar</StyledTableCell>
                <StyledTableCell width="3%">ID</StyledTableCell>
                <StyledTableCell width="7%">Full name</StyledTableCell>
                <StyledTableCell width="10%">Email</StyledTableCell>
                <StyledTableCell width="24%">Answer</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listAnswerByQuestion?.map((asw, index) => (
                <StyledTableRow key={asw._id}>
                  <StyledTableCell>
                    <Avatar
                      src={asw.student.avatar}
                      alt="User Avatar"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{asw.student._id.slice(-5)}</StyledTableCell>
                  <StyledTableCell>{asw.student.name}</StyledTableCell>
                  <StyledTableCell>
                    {" "}
                    <Box>
                      <span
                        style={{
                          color: "green",
                          backgroundColor: "#e0fceb",
                          borderRadius: "20px",
                          padding: "4px 8px",
                          display: "inline-block",
                          wordBreak: "break-word",
                        }}
                      >
                        {asw.student.email}{" "}
                      </span>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box>
                      <Box
                        key={asw._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "#000",
                          gap: "15px",
                          fontSize: "20px",
                        }}
                      >
                        <Box>
                          <span
                            style={{
                              color: "#000",
                              fontWeight: "600",
                            }}
                          >
                            {asw.question.questionText}
                          </span>
                          <Box >
                            {asw.question.options.map((option, i) => {
                              const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
                              const isCorrectAnswer =
                                asw.question.correctAnswer === option; // Kiểm tra câu trả lời đúng
                              const isStudentAnswer = asw.answerText === option; // Kiểm tra câu trả lời của sinh viên

                              return (
                                <Box key={i}>
                                  <p
                                    style={{
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
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default withAuth(ListAnswerByQuestion, ["TEACHER"]);
