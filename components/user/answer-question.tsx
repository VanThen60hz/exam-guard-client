import React, { useState, useEffect, useRef } from "react";
import {
  LinearProgress,
  Container,
  Button,
  Typography,
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
} from "@mui/material";

import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { getListQuestion } from "../../helpers/api/exam-api";
import { examTime, examID, examTitle } from "./home-student";

import classes from "../../components/user/home-student.module.scss";
import classes2 from "../../components/user/profile-user.module.scss";

const AnswerQuestionForm: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [listData, setListData] = useState([]);

  // Lưu các câu trả lời
  const [answers, setAnswers] = useState<
    { questionId: number; answer: string }[]
  >([]);

  // State quản lý trạng thái của dialog và kết quả
  const [openDialog, setOpenDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  // Router chuyển page
  const router = useRouter();

  // Hàm mở dialog với thông báo kết quả
  const openResultDialog = (message) => {
    setResultMessage(message);
    setOpenDialog(true);
  };

  // Hàm đóng dialog
  const closeDialog = () => {
    setOpenDialog(false);
  };

  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // List tất cả câu hỏi
  const [allQuestion, setAllQuestion] = useState([]);
  const page2 = 1;
  const limit2 = 100000;

  // totalTime là tổng thời gian làm bài, tính bằng giây
  const totalTime = examTime * 60;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const progress = (timeLeft / totalTime) * 100;

  // Camera
  const videoRef = useRef(null);

  // Tạo mảng refs cho mỗi câu hỏi
  const questionRefs = useRef([]);

  // Load trang
  const [loading, setLoading] = useState(false);

  // Báo lỗi
  const [error, setError] = useState<string | null>(null);

  // Get session data
  const { data: session, status } = useSession();

  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

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
        second: "2-digit",
        hour12: true,
      });

      setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
    }, 1000); // Cập nhật mỗi giây

    return () => clearInterval(intervalId);
  }, []);

  // Lấy danh sách câu hỏi
  useEffect(() => {
    const fetchListQuestions = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const listQuestions = await getListQuestion(
              userId,
              accessToken,
              examID,
              page,
              limit
            );
            setListData(listQuestions.questions);
            setTotalPage(listQuestions.totalPages);
            console.log("List Questions:", listQuestions);
          } catch (error) {
            console.error("Error getting Questions:", error);
            toast.error("Failed to fetch Questions");
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
      }
      return listData;
    };
    const fetchAllQuestions = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const allQuestions = await getListQuestion(
              userId,
              accessToken,
              examID,
              page2,
              limit2
            );
            setAllQuestion(allQuestions.questions);
            console.log("all question: ", allQuestions);
          } catch (error) {
            console.error("Error getting all Questions:", error);
            toast.error("Failed to fetch all Questions");
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
      }
      return allQuestion;
    };
    fetchListQuestions();
    fetchAllQuestions();
  }, [status, session, page, limit, limit2]);

  // Hàm để lấy luồng camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Không thể truy cập vào camera:", error);
      }
    };

    startCamera();

    // Tắt camera khi component bị hủy
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let stream = videoRef.current.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Cảnh báo khi muốn reset và thoát trang
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const warningMessage =
        "Bạn có chắc chắn muốn rời khỏi trang này? Dữ liệu có thể bị mất.";
      event.preventDefault();
      event.returnValue = warningMessage; // Cảnh báo cho trình duyệt
      return warningMessage; // Một số trình duyệt yêu cầu trả về giá trị
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Thời gian làm bài
  useEffect(() => {
    // Hàm cập nhật thanh tiến trình mỗi giây
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0; // Hết giờ
        }
        return prevTime - 1; // Giảm dần thời gian còn lại
      });
    }, 1000);

    if (timeLeft == 0) {
      handleSubmit();
    }

    return () => clearInterval(intervalId);
  }, [totalTime]);

  // Chuyển trang
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Chọn câu trả lời và lưu lại vào answer
  const handleChooseAnswer = (
    e: React.ChangeEvent<HTMLInputElement>,
    question: any
  ) => {
    const { value } = e.target;

    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (answer) => answer.questionId === question._id
      );

      if (existingAnswerIndex !== -1) {
        // Nếu đã có câu trả lời, cập nhật câu trả lời mới
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex].answer = value;
        return updatedAnswers;
      } else {
        // Nếu chưa có câu trả lời, thêm câu trả lời mới vào mảng
        return [...prevAnswers, { questionId: question._id, answer: value }];
      }
    });
    //tính toán câu trả lời đúng
    if (value === question.correctAnswer) {
      setCorrectAnswersCount((prevCount) => prevCount + 1);
      console.log("đúng");
    } else {
      setCorrectAnswersCount((prevCount) =>
        prevCount > 0 ? prevCount - 1 : 0
      );
      console.log("sai");
    }
  };

  // Nút làm xóa câu trả lời
  const handleResetChooseAnswer = (questionId) => {
    const updatedAnswers = answers.filter(
      (answer) => answer.questionId !== questionId
    );
    setAnswers(updatedAnswers);
  };

  // Nút chọn câu hỏi
  const handleClickNumOfAnswer = (index) => {
    const questionElement = questionRefs.current[index];
    if (questionElement) {
      // Lấy vị trí từ trên cùng của phần tử đến đầu trang, sau đó trừ đi 100px
      const offsetTop =
        questionElement.getBoundingClientRect().top + window.scrollY - 100;

      // Cuộn đến vị trí đã tính toán
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Nút nộp bài
  const handleSubmit = () => {
    console.log("Danh sách câu trả lời của người dùng:", answers);
    const correctCount = answers.filter((ans) => {
      const question = allQuestion.find((q) => q._id === ans.questionId);
      return question && ans.answer === question.correctAnswer;
    }).length;
    console.log("Số câu đúng:", correctCount);

    // Kiểm tra xem có câu hỏi nào chưa trả lời không
    const unansweredQuestions = allQuestion.filter(
      (question) => !answers.find((ans) => ans.questionId === question._id)
    );

    console.log(correctAnswersCount);

    if (unansweredQuestions.length > 0) {
      openResultDialog(
        "Bạn vẫn còn câu hỏi chưa trả lời. <br />Vui lòng kiểm tra lại!"
      );
    } else {
      // Tính số câu trả lời đúng
      const correctCount = answers.filter((ans) => {
        const question = allQuestion.find((q) => q._id === ans.questionId);
        return question && ans.answer === question.correctAnswer;
      }).length;

      openResultDialog(`Số câu đúng: ${correctCount}/${allQuestion.length}`);
    }
  };

  const CustomFormControlLabel = styled(FormControlLabel)({
    "& .MuiFormControlLabel-label": {
      fontFamily: "Lexend",
      fontSize: "20px",
      fontWeight: "400",
      color: "#333",
    },
  });

  //Hiển thị ra màn hình
  return (
    <>
      <Container className={classes.container}>
        <div className={classes.countdownTimer}>
          <p style={{ padding: "5px" }} className={classes.fontStyle}>
            Thời gian còn lại: {Math.floor(timeLeft / 60)} phút
          </p>
          <LinearProgress
            variant="determinate"
            value={progress}
            style={{ width: "100%", height: 10, marginTop: 10 }}
          />
        </div>
        {/* Hiển thị ngày giờ hiện tại
                    <div
                        className={`${classes2.dateTime}`}
                        style={{
                            marginTop: "120px",
                        }}
                    >
                        <Typography
                            style={{
                                fontFamily: "Lexend",
                                fontSize: "20px",
                                fontWeight: 400,
                                color: "#fff",
                            }}
                        >
                            {currentDateTime}
                        </Typography>
                    </div> */}

        <div
          style={{
            display: "flex",
          }}
        >
          {/* Không gian làm bài */}
          <div className={classes.questionBox}>
            <div
              className={`${classes.header} ${classes.fontStyle}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#000",
                fontSize: "25px",
              }}
            >
              <span>{examTitle}</span>
              <span>Exam ID: {examID.slice(-5)} </span>
            </div>

            <div className={`${classes.content} ${classes.fontStyle}`}>
              {listData.map((question, index) => (
                // thẻ chứa câu hỏi
                <div
                  ref={(el) => (questionRefs.current[index] = el)} // Gán ref cho từng câu hỏi
                  key={question._id} // Thêm key để tránh cảnh báo
                  className={classes.questionItem}
                  style={{
                    color: "#000",
                    fontSize: "23px",
                  }}
                >
                  <span style={{ color: "#ca5455" }}>
                    Question {(page - 1) * 10 + index + 1} :
                  </span>
                  <span>{question.questionText} </span>

                  <div className={`${classes.answer} ${classes.fontStyle}`}>
                    <FormControl>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="answer"
                        value={
                          answers.find(
                            (answer) => answer.questionId === question._id
                          )?.answer || ""
                        } // Thiết lập giá trị đã chọn
                        onChange={(e) => handleChooseAnswer(e, question)}
                      >
                        {question.options.length === 1 ? (
                          <CustomFormControlLabel
                            key={question.options[0]}
                            value={question.options[0]}
                            control={<Radio />}
                            label={`A: ${question.options[0]}`}
                          />
                        ) : question.options.length === 2 ? (
                          <>
                            <CustomFormControlLabel
                              key={question.options[0]}
                              value={question.options[0]}
                              control={<Radio />}
                              label={`A: ${question.options[0]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[1]}
                              value={question.options[1]}
                              control={<Radio />}
                              label={`B: ${question.options[1]}`}
                            />
                          </>
                        ) : question.options.length === 3 ? (
                          <>
                            <CustomFormControlLabel
                              key={question.options[0]}
                              value={question.options[0]}
                              control={<Radio />}
                              label={`A: ${question.options[0]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[1]}
                              value={question.options[1]}
                              control={<Radio />}
                              label={`B: ${question.options[1]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[2]}
                              value={question.options[2]}
                              control={<Radio />}
                              label={`C: ${question.options[2]}`}
                            />
                          </>
                        ) : question.options.length === 4 ? (
                          <>
                            <CustomFormControlLabel
                              key={question.options[0]}
                              value={question.options[0]}
                              control={<Radio />}
                              label={`A: ${question.options[0]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[1]}
                              value={question.options[1]}
                              control={<Radio />}
                              label={`B: ${question.options[1]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[2]}
                              value={question.options[2]}
                              control={<Radio />}
                              label={`C: ${question.options[2]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[3]}
                              value={question.options[3]}
                              control={<Radio />}
                              label={`C: ${question.options[3]}`}
                            />
                          </>
                        ) : question.options.length === 5 ? (
                          <>
                            <CustomFormControlLabel
                              key={question.options[0]}
                              value={question.options[0]}
                              control={<Radio />}
                              label={`A: ${question.options[0]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[1]}
                              value={question.options[1]}
                              control={<Radio />}
                              label={`B: ${question.options[1]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[2]}
                              value={question.options[2]}
                              control={<Radio />}
                              label={`C: ${question.options[2]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[3]}
                              value={question.options[3]}
                              control={<Radio />}
                              label={`C: ${question.options[3]}`}
                            />
                            <CustomFormControlLabel
                              key={question.options[4]}
                              value={question.options[4]}
                              control={<Radio />}
                              label={`C: ${question.options[4]}`}
                            />
                          </>
                        ) : (
                          <>
                            <CustomFormControlLabel
                              key={question.options[0]}
                              value={question.options[0]}
                              control={<Radio />}
                              label={`A: ${question.options[0]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[1]}
                              value={question.options[1]}
                              control={<Radio />}
                              label={`B: ${question.options[1]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[2]}
                              value={question.options[2]}
                              control={<Radio />}
                              label={`C: ${question.options[2]}`}
                            />

                            <CustomFormControlLabel
                              key={question.options[3]}
                              value={question.options[3]}
                              control={<Radio />}
                              label={`C: ${question.options[3]}`}
                            />
                            <CustomFormControlLabel
                              key={question.options[4]}
                              value={question.options[4]}
                              control={<Radio />}
                              label={`C: ${question.options[4]}`}
                            />
                            <CustomFormControlLabel
                              key={question.options[5]}
                              value={question.options[5]}
                              control={<Radio />}
                              label={`C: ${question.options[5]}`}
                            />
                          </>
                        )}
                      </RadioGroup>
                    </FormControl>

                    {/* Thẻ xóa câu trả lời */}
                    <p
                      className={classes.resetChooseAnswer}
                      onClick={() => handleResetChooseAnswer(question._id)}
                    >
                      Reset choose this answer
                    </p>
                  </div>
                </div>
              ))}

              {/* Nút chuyển trang */}
              <div className={classes.pagination}>
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
            </div>
          </div>
          {/* Không gian đánh số thứ tự câu hỏi và camera */}
          <div className={classes.rightBox}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div className={classes.numOfQuestion}>
                {listData.map((question, index) => (
                  // Các nút thứ tự câu hỏi
                  <Button
                    key={index}
                    className={classes.numOfQuestionItem}
                    // fullWidth
                    // variant="contained"
                    style={{
                      backgroundColor: answers.find(
                        (answer) => answer.questionId === question._id
                      )
                        ? "#1DB0A6"
                        : "#c63232",
                    }}
                    onClick={() => handleClickNumOfAnswer(index)}
                  >
                    {(page - 1) * 10 + index + 1}
                  </Button>
                ))}
              </div>
              <div>
                <p
                  style={{
                    color: "#1DB0A6",
                    fontSize: "20px",
                    fontWeight: 400,
                  }}
                >
                  Answered
                </p>
                <p
                  style={{
                    marginTop: "10px",
                    color: "#c63232",
                    fontSize: "20px",
                    fontWeight: 400,
                  }}
                >
                  Not answered
                </p>
              </div>
            </div>
            {/* Thẻ camera */}
            <div>
              <video
                className={classes.camera}
                autoPlay
                playsInline
                muted
                ref={videoRef}
              />
            </div>
          </div>
        </div>

        {/* Thẻ giãn dòng */}
        <div
          style={{
            height: "50px",
          }}
        ></div>

        {/* Nút nộp bài */}
        {page === totalPage && ( // Hiển thị nút submit chỉ khi đang ở trang cuối
          <Button
            className={classes2.button}
            fullWidth
            variant="contained"
            style={{
              margin: "0 40.5% 19px",
              padding: "5px 0",
            }}
            onClick={handleSubmit}
          >
            submit
          </Button>
        )}

        {/* Dialog hiển thị kết quả */}
        <Dialog open={openDialog} onClose={closeDialog}>
          <DialogTitle>Exam Result </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                color: "#000",
                fontSize: "16px",
                fontWeight: 400,
              }}
              dangerouslySetInnerHTML={{ __html: resultMessage }}
              style={{ whiteSpace: "pre-line" }}
            />
          </DialogContent>
          <DialogActions>
            {allQuestion.filter(
              (question) =>
                !answers.find((ans) => ans.questionId === question._id)
            ).length > 0 ? (
              <Button onClick={closeDialog} color="primary">
                Continue
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/user/homeStudent")}
                color="primary"
              >
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AnswerQuestionForm;
