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
    Box,
    Modal,
} from "@mui/material";

import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { Camera } from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { FaceDetection, Results } from "@mediapipe/face_detection";
import NextImage from "next/image";
import {
    b64toBlob,
    detectCheating,
    extractFaceCoordinates,
    getCheatingStatus,
    printLandmarks,
} from "../../helpers/face-detection/face-detection-helper";

import { useAppDispatch, useAppSelector } from "../../hooks";
import {
    getBrowserDocumentHiddenProp,
    getBrowserVisibilityProp,
} from "../../helpers/app/visibility-event";
//import { examActions } from "../../store/exam-store";

import {
    answerQuestion,
    getGradeStudent,
    listQuestionStudent,
    submitExam,
} from "../../helpers/api/exam-api";
import { detect_cheating } from "../../helpers/api/cheating-api";
import { examTitle } from "./home-student";

import classes from "../../components/user/home-student.module.scss";
import classes2 from "../../components/user/profile-user.module.scss";
import { BASE_URL } from "../../constants";

interface RemainingTime {
    minutes: number;
    seconds: number;
}

interface WarningModalProps {
    title: string;
    description: string;
    open: boolean;
    onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

interface ViewGradeStudentFormProps {
    open: boolean;
    onClose: () => void;
}

const TESTING = false;

const AnswerQuestionForm: React.FC = () => {
    const router = useRouter();
    const { examId } = router.query;

    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [listData, setListData] = useState([]);

    // Lưu các câu trả lời
    const [answers, setAnswers] = useState<
        { questionId: string; answer: string }[]
    >([]);

    // State quản lý trạng thái của dialog và kết quả
    const [openDialog, setOpenDialog] = useState(false);
    const [resultMessage, setResultMessage] = useState("");

    // Router chuyển page

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
    const [timeLeft, setTimeLeft] = useState<RemainingTime | null>(null);
    const [totalSeconds, setTotalSeconds] = useState(0);

    // Camera
    const videoRef = useRef(null);
    const [img_, setImg_] = useState<string>();
    const webcamRef: React.LegacyRef<Webcam> = useRef();
    const faceDetectionRef = useRef<FaceDetection>(null);
    const realtimeDetection = true;

    const frameRefresh = 30;
    let currentFrame = useRef(0);

    const [chetingStatus, setChetingStatus] = useState("");

    //chuyển tab
    const dispatch = useAppDispatch();

    const activeExam = useAppSelector((state) => state.exam.activeExam);

    const [didLeaveExam, setDidLeaveExam] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState<{
        title: string;
        description: string;
    }>();

    // Đếm số lần phát hiện gian lận
    const [cheatingCount, setCheatingCount] = useState<number>(0);

    // Tạo mảng refs cho mỗi câu hỏi
    const questionRefs = useRef([]);

    // Load trang
    const [loading, setLoading] = useState(false);
    const [time, settime] = useState(false);

    // Báo lỗi
    const [error, setError] = useState<string | null>(null);

    // Get session data
    const { data: session, status } = useSession();

    // const gradeDialog = () => {
    //     setOpenDialog(false);
    // };

    // Lấy danh sách câu hỏi
    useEffect(() => {
        if (status === "authenticated" && session) {
            const userId = session.userId;
            const accessToken = session.accessToken;
            const fetchListQuestions = async () => {
                settime(true);

                if (userId && accessToken) {
                    try {
                        const listQuestions = await listQuestionStudent(
                            userId,
                            accessToken,
                            examId as string,
                            page,
                            limit
                        );
                        setListData(listQuestions.questions);
                        setTotalPage(listQuestions.totalPages);
                        setTimeLeft(listQuestions.remainingTime);
                        setTotalSeconds(
                            timeLeft.minutes * 60 + timeLeft.seconds
                        );
                    } catch (error) {
                        console.error("Error getting Questions:", error);
                        setError(error.message);
                    }
                }
                setLoading(false);
                return listData;
            };
            const fetchAllQuestions = async () => {
                setLoading(true);

                if (userId && accessToken) {
                    try {
                        const allQuestions = await listQuestionStudent(
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
                    }
                }
                setLoading(false);
                return allQuestion;
            };

            fetchListQuestions();
            fetchAllQuestions();
        }
    }, [status, session, examId, page, limit]);

    let lookingTime = 0;
    // Hàm để lấy luồng camera
    useEffect(() => {
        const faceDetection: FaceDetection = new FaceDetection({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
            },
        });

        faceDetection.setOptions({
            minDetectionConfidence: 0.5,
            model: "short",
        });

        const onResult = async (result: Results) => {
            // TODO: Fix multiple toasts
            if (result.detections.length < 1) {
                // toast(
                //   "Face not detected, make sure your face is visible on the screen!"
                // );
                return;
            } else if (result.detections.length > 1) {
                // toast(
                //   "Detected more than one person in frame, can be flagged as cheating!"
                // );
                return;
            }

            const faceCoordinates = extractFaceCoordinates(result);

            // printLandmarks(result);

            const [lookingLeft, lookingRight] = detectCheating(
                faceCoordinates,
                false
            );
            if (status === "authenticated" && session) {
                const userId = session.userId;
                const accessToken = session.accessToken;
                const fetchCheatingFace = async () => {
                    settime(true);

                    if (userId && accessToken) {
                        try {
                            const detect = await detect_cheating(
                                // session.userId,
                                // session.accessToken,
                                userId,
                                accessToken,
                                examId as string,
                                {
                                    infractionType: "Face",
                                    description:
                                        "Student looks away from the test screen.",
                                }
                            );
                            console.log("chết mày rồi con");
                        } catch (error) {
                            console.error("Error detect cheating:", error);
                            setError(error.message);
                        }
                        setLoading(false);
                    }
                };

                if (lookingLeft || lookingRight) {
                    lookingTime += 1;
                    console.log("phát hiện: ", lookingTime);
                    if (lookingTime == 5) {
                        fetchCheatingFace();
                    }
                    if (lookingTime > 5) {
                        lookingTime = 0;
                    }
                } else {
                    lookingTime = 0;
                }

                const cheatingStatus = getCheatingStatus(
                    lookingLeft,
                    lookingRight
                );
                setChetingStatus(cheatingStatus);
            }
        };

        faceDetection.onResults(onResult);
        faceDetectionRef.current = faceDetection;

        if (webcamRef.current) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    // Proceed frames only if real time detection is on
                    if (!realtimeDetection) {
                        return;
                    }

                    currentFrame.current += 1;

                    if (currentFrame.current >= frameRefresh) {
                        currentFrame.current = 0;
                        await faceDetection.send({
                            image: webcamRef.current.video,
                        });
                    }
                },
                width: 1280,
                height: 720,
            });

            camera.start();
        }

        return () => {
            faceDetection.close();
        };
    }, [webcamRef, realtimeDetection]);

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
            return warningMessage; // Một s trình duyệt yêu cầu trả về giá trị
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // Tab change
    useEffect(() => {
        const hiddenProp = getBrowserDocumentHiddenProp();
        const visibilityChangeEventName = getBrowserVisibilityProp();

        const handleVisibilityChange = async () => {
            if (document[hiddenProp]) {
                if (status === "authenticated" && session) {
                    setDidLeaveExam(true);

                    const userId = session.userId;
                    const accessToken = session.accessToken;
                    try {
                        // const userId = session.userId;
                        // const accessToken = session.accessToken;
                        const detect = await detect_cheating(
                            userId,
                            accessToken,
                            examId as string,
                            {
                                infractionType: "Switch Tab",
                                description:
                                    "Student switches tabs away from the test screen",
                            }
                        );
                    } catch (error) {
                        console.error("Error detect cheating:", error);
                        setError(error.message);
                    }
                } else {
                    showModal(
                        "WARNING!",
                        "Leaving exam multiple times may be flagged as cheating!"
                    );
                }
            }
        };

        document.addEventListener(
            visibilityChangeEventName,
            handleVisibilityChange,
            false
        );

        return () => {
            document.removeEventListener(
                visibilityChangeEventName,
                handleVisibilityChange
            );
        };
    }, []);

    const showModal = (title: string, description: string) => {
        setIsModalVisible(true);
        setModalData({
            title,
            description,
        });
    };

    const hideModel = () => {
        if (!didLeaveExam) {
            return;
        }

        setIsModalVisible(false);
        setModalData({
            title: "",
            description: "",
        });
    };

    // Thời gian làm bài
    //Thêm state cho thời gian còn lại

    useEffect(() => {
        // Cập nhật thời gian còn lại mỗi giây
        const intervalId = setInterval(() => {
            setTotalSeconds((prev) => {
                if (prev > 0) {
                    return prev - 1;
                } else {
                    clearInterval(intervalId);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (timeLeft) {
            setTotalSeconds(timeLeft.minutes * 60 + timeLeft.seconds);
        }
    }, [timeLeft]);

    // Tính toán thời gian còn lại theo định dạng phút và giây
    const formatTimeLeft = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    // Danh sách màu sắc
    const colors = [
        "#80EE98",
        "#46DFB1",
        "#09D1C7",
        "#15919B",
        "#0C6478",
        "#213A58",
    ];

    // Tính toán màu sắc của thanh dựa trên thời gian còn lại
    const getProgressColor = () => {
        const percentage =
            totalSeconds / (timeLeft?.minutes * 60 + timeLeft?.seconds);
        const colorIndex = Math.floor((1 - percentage) * (colors.length - 1)); // Tính chỉ số màu
        return colors[Math.max(0, Math.min(colorIndex, colors.length - 1))]; // Đảm bảo chỉ số nằm trong khoảng
    };

    // Chuyển trang
    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Chọn câu trả lời và lưu lại vào answer
    const handleChooseAnswer = async (
        e: React.ChangeEvent<HTMLInputElement>,
        questionId: string
    ) => {
        const { value } = e.target;

        setAnswers((prevAnswers) => {
            const existingAnswerIndex = prevAnswers.findIndex(
                (answer) => answer.questionId === questionId
            );

            if (existingAnswerIndex !== -1) {
                // Nếu đã có câu trả lời, cập nhật câu trả lời mới
                const updatedAnswers = [...prevAnswers];
                updatedAnswers[existingAnswerIndex].answer = value;
                return updatedAnswers;
            } else {
                // Nếu chưa có câu trả lời, thêm câu trả lời mới vào mảng
                return [
                    ...prevAnswers,
                    { questionId: questionId, answer: value },
                ];
            }
        });
        try {
            await answerQuestion(
                session.userId,
                session.accessToken,
                questionId,
                {
                    answerText: value as string,
                }
            );
            console.log("Đã chọn: ", value as string);
        } catch (error) {
            console.error("Error answer:", error);
            setError(error.message);
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
                questionElement.getBoundingClientRect().top +
                window.scrollY -
                100;

            // Cuộn đến vị trí đã tính toán
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
            });
        }
    };

    // Nút nộp bài
    const handleSubmit = async () => {
        console.log("Danh sách câu trả lời của người dùng:", answers);
        const correctCount = answers.filter((ans) => {
            const question = allQuestion.find((q) => q._id === ans.questionId);
            return question && ans.answer === question.correctAnswer;
        }).length;
        console.log("Số câu đúng:", correctCount);

        // Kiểm tra xem có câu hỏi nào chưa trả lời không
        const unansweredQuestions = allQuestion.filter(
            (question) =>
                !answers.find((ans) => ans.questionId === question._id)
        );

        if (unansweredQuestions.length > 0) {
            openResultDialog(
                `Bạn vẫn còn câu hỏi chưa trả lời.
                Vui lòng kiểm tra lại!`
            );
        } else {
            openResultDialog(
                `Congratulations on completing the test. 
                Would you like to view your score?`
            );
            const userId = session.userId;
            const accessToken = session.accessToken;

            try {
                await submitExam(userId, accessToken, examId as string, {
                    answers: [],
                });
            } catch (error) {
                console.error("Error submit:", error);
                setError(error.message);
            }
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

    const style = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
    };

    const [openGradeDialog, setOpenGradeDialog] = useState(false);

    const handleViewGrade = () => {
        const fetchGrade = async () => {
            if (session) {
                const fetchedGrade = await getGradeStudent(
                    session.userId,
                    session.accessToken,
                    examId as string
                );
                setGrade(fetchedGrade.score);
            }
        };
        fetchGrade();
        setOpenGradeDialog(true);
    };

    const [grade, setGrade] = useState<number | null>(null);

    // Fetch grade when component mounts or session changes
    // useEffect(() => {
    //     const fetchGrade = async () => {
    //         if (session) {
    //             const fetchedGrade = await getGradeStudent(
    //                 session.userId,
    //                 session.accessToken,
    //                 examId as string
    //             );
    //             setGrade(fetchedGrade.score);
    //         }
    //     };
    //     fetchGrade();
    // }, [session, examId]);

    //Hiển thị ra màn hình
    return (
        <>
            <Container className={classes.container}>
                {/* Thanh đếm ngược thời gian */}
                <div
                    style={{
                        position: "relative",
                        height: "20px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "5px",
                        overflow: "hidden",
                        marginTop: "120px",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            height: "100%",
                            width: `${
                                (totalSeconds /
                                    (timeLeft?.minutes * 60 +
                                        timeLeft?.seconds)) *
                                100
                            }%`,
                            backgroundColor: getProgressColor(),
                            transition:
                                "width 1s linear, background-color 1.5s ease",
                        }}
                    />
                    {/* Hiển thị thời gian còn lại bên trong thanh */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            textAlign: "center",
                            color: "#fff",
                            fontWeight: "bold",
                        }}
                    >
                        {formatTimeLeft(totalSeconds)}
                    </div>
                </div>

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
                            <span>{examTitle ? examTitle : ""}</span>
                            <span>
                                Exam ID: {examId ? examId.slice(-5) : ""}
                            </span>
                        </div>

                        <div
                            className={`${classes.content} ${classes.fontStyle}`}
                        >
                            {listData.map((question, index) => (
                                // thẻ chứa câu hỏi
                                <div
                                    ref={(el) =>
                                        (questionRefs.current[index] = el)
                                    } // Gán ref cho từng câu hỏi
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

                                    <div
                                        className={`${classes.answer} ${classes.fontStyle}`}
                                    >
                                        <FormControl>
                                            <RadioGroup
                                                aria-labelledby="demo-radio-buttons-group-label"
                                                name="answer"
                                                value={
                                                    answers.find(
                                                        (answer) =>
                                                            answer.questionId ===
                                                            question._id
                                                    )?.answer || ""
                                                } // Thiết lập giá trị đã chọn
                                                onChange={
                                                    (e) =>
                                                        handleChooseAnswer(
                                                            e,
                                                            question._id
                                                        )
                                                    // handleChooseAnswer(
                                                    //     e,
                                                    //     question.correctAnswer,
                                                    //     question._id
                                                    // )
                                                }
                                            >
                                                {question.options.length ===
                                                1 ? (
                                                    <CustomFormControlLabel
                                                        key={
                                                            question.options[0]
                                                        }
                                                        value={
                                                            question.options[0]
                                                        }
                                                        control={<Radio />}
                                                        label={`A: ${question.options[0]}`}
                                                    />
                                                ) : question.options.length ===
                                                  2 ? (
                                                    <>
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[0]
                                                            }
                                                            value={
                                                                question
                                                                    .options[0]
                                                            }
                                                            control={<Radio />}
                                                            label={`A: ${question.options[0]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[1]
                                                            }
                                                            value={
                                                                question
                                                                    .options[1]
                                                            }
                                                            control={<Radio />}
                                                            label={`B: ${question.options[1]}`}
                                                        />
                                                    </>
                                                ) : question.options.length ===
                                                  3 ? (
                                                    <>
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[0]
                                                            }
                                                            value={
                                                                question
                                                                    .options[0]
                                                            }
                                                            control={<Radio />}
                                                            label={`A: ${question.options[0]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[1]
                                                            }
                                                            value={
                                                                question
                                                                    .options[1]
                                                            }
                                                            control={<Radio />}
                                                            label={`B: ${question.options[1]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[2]
                                                            }
                                                            value={
                                                                question
                                                                    .options[2]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[2]}`}
                                                        />
                                                    </>
                                                ) : question.options.length ===
                                                  4 ? (
                                                    <>
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[0]
                                                            }
                                                            value={
                                                                question
                                                                    .options[0]
                                                            }
                                                            control={<Radio />}
                                                            label={`A: ${question.options[0]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[1]
                                                            }
                                                            value={
                                                                question
                                                                    .options[1]
                                                            }
                                                            control={<Radio />}
                                                            label={`B: ${question.options[1]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[2]
                                                            }
                                                            value={
                                                                question
                                                                    .options[2]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[2]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[3]
                                                            }
                                                            value={
                                                                question
                                                                    .options[3]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[3]}`}
                                                        />
                                                    </>
                                                ) : question.options.length ===
                                                  5 ? (
                                                    <>
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[0]
                                                            }
                                                            value={
                                                                question
                                                                    .options[0]
                                                            }
                                                            control={<Radio />}
                                                            label={`A: ${question.options[0]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[1]
                                                            }
                                                            value={
                                                                question
                                                                    .options[1]
                                                            }
                                                            control={<Radio />}
                                                            label={`B: ${question.options[1]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[2]
                                                            }
                                                            value={
                                                                question
                                                                    .options[2]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[2]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[3]
                                                            }
                                                            value={
                                                                question
                                                                    .options[3]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[3]}`}
                                                        />
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[4]
                                                            }
                                                            value={
                                                                question
                                                                    .options[4]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[4]}`}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[0]
                                                            }
                                                            value={
                                                                question
                                                                    .options[0]
                                                            }
                                                            control={<Radio />}
                                                            label={`A: ${question.options[0]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[1]
                                                            }
                                                            value={
                                                                question
                                                                    .options[1]
                                                            }
                                                            control={<Radio />}
                                                            label={`B: ${question.options[1]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[2]
                                                            }
                                                            value={
                                                                question
                                                                    .options[2]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[2]}`}
                                                        />

                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[3]
                                                            }
                                                            value={
                                                                question
                                                                    .options[3]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[3]}`}
                                                        />
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[4]
                                                            }
                                                            value={
                                                                question
                                                                    .options[4]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[4]}`}
                                                        />
                                                        <CustomFormControlLabel
                                                            key={
                                                                question
                                                                    .options[5]
                                                            }
                                                            value={
                                                                question
                                                                    .options[5]
                                                            }
                                                            control={<Radio />}
                                                            label={`C: ${question.options[5]}`}
                                                        />
                                                    </>
                                                )}
                                            </RadioGroup>
                                        </FormControl>

                                        {/* Thẻ xóa câu trả lời */}
                                        <p
                                            className={
                                                classes.resetChooseAnswer
                                            }
                                            onClick={() =>
                                                handleResetChooseAnswer(
                                                    question._id
                                                )
                                            }
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
                                        "& .MuiPaginationItem-page.Mui-selected":
                                            {
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
                                                (answer) =>
                                                    answer.questionId ===
                                                    question._id
                                            )
                                                ? "#1DB0A6"
                                                : "#c63232",
                                        }}
                                        onClick={() =>
                                            handleClickNumOfAnswer(index)
                                        }
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
                        <div
                            style={{
                                // display: "flex",
                                // flexDirection: "column",
                                // alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <div
                                style={{
                                    margin: "10px 10px",
                                }}
                            >
                                <p
                                    className={classes.fontStyle}
                                    style={{
                                        maxWidth: "250px",
                                        color: "#000",
                                        fontSize: "12px",
                                    }}
                                >
                                    Cheating status:
                                </p>
                                <p
                                    className={classes.fontStyle}
                                    style={{ fontSize: "12px" }}
                                >
                                    {chetingStatus}
                                </p>
                            </div>

                            {true && (
                                <Webcam
                                    className={classes.camera}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                />
                            )}

                            <br />

                            {/* <Button onClick={onResultClick}>Get Result</Button> */}

                            {img_ && <NextImage src={img_} alt="Profile" />}
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

                {!TESTING && (
                    <Modal
                        open={isModalVisible}
                        onClose={hideModel}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography
                                id="modal-modal-title"
                                variant="h6"
                                component="h2"
                            >
                                {modalData?.title}
                            </Typography>
                            <Typography
                                id="modal-modal-description"
                                sx={{ mt: 2, color: "#874141" }}
                            >
                                {modalData?.description}
                            </Typography>
                        </Box>
                    </Modal>
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
                                !answers.find(
                                    (ans) => ans.questionId === question._id
                                )
                        ).length > 0 ? (
                            <Button onClick={closeDialog} color="primary">
                                Continue
                            </Button>
                        ) : (
                            <Box sx={{ display: "flex" }}>
                                <Button
                                    onClick={handleViewGrade}
                                    color="primary"
                                >
                                    View score
                                </Button>
                                <Button
                                    onClick={() =>
                                        router.push("/user/home-student")
                                    }
                                    color="primary"
                                >
                                    Close
                                </Button>
                            </Box>
                        )}
                    </DialogActions>
                </Dialog>

                <Dialog open={openGradeDialog} onClose={closeDialog}>
                    <DialogTitle>Your Grade </DialogTitle>
                    <DialogContent>
                        <p
                            style={{
                                color: "#000",
                            }}
                        >
                            Score: {grade !== null ? grade : "Loading..."}
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => router.push("/user/home-student")}
                            color="primary"
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default AnswerQuestionForm;
