import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    MenuItem,
    Radio,
    TextField,
    Typography,
    InputLabel,
    Select,
} from "@mui/material";

import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import NavBarHome from "../../components/home/navbar-home";
import {
    updateExam,
    getExam,
    createQuestion,
} from "../../helpers/api/exam-api";
import classes from "../../components/exam-main/manage-exam.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";

// Components
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import withAuth from "../../components/withAuth/with-auth";

type Errors = {
    questionText?: string;
    questionScore?: string;
};

const EditExamForm: React.FC = () => {
    const { data: session, status } = useSession();
    const [listExam, setListExam] = useState([]);
    const router = useRouter();
    const { examId } = router.query;
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("Single Choice");
    const [questionScore, setQuestionScore] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [options, setOptions] = useState<string[]>([""]);
    const [isAnswerSelected, setIsAnswerSelected] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [editingExam, setEditingExam] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchExamData = async () => {
            if (examId && session) {
                const userId = session.userId;
                const accessToken = session.accessToken;
                const examData = await getExam(
                    userId,
                    accessToken,
                    examId as string
                );
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
        try {
            await handleSaveEdit(editingExam);
            setEditingExam(null);
            router.push("/exam/manage-exam");
        } catch (error) {
            toast.error("Failed to update user");
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
                            exam._id === updatedExamData._id
                                ? updatedExamData
                                : exam
                        )
                    );
                    setEditingExam(null);
                    toast.success("User updated successfully!");
                } catch (error) {
                    toast.error("Failed to update user");
                }
            }
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]); // Add a new empty option
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Errors = {};
        if (!questionText) newErrors.questionText = "Question text is required";
        if (!questionScore)
            newErrors.questionScore = "Question score is required";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        if (!correctAnswer) {
            setIsAnswerSelected(false);
            toast.error("Please select a correct answer");
            return;
        }

        // Calculate total score of existing questions
        const newQuestionScore = parseFloat(questionScore);

        const questionData = {
            questionText,
            questionType,
            questionScore: newQuestionScore, // Ensure this is a number
            correctAnswer,
            options,
        };
        try {
            const createdQuestion = await createQuestion(
                session.userId,
                session.accessToken,
                examId as string,
                questionData
            );
            // Update the list of questions with the newly created question
            setListExam((prevList) => [...prevList, createdQuestion]);
            toast.success("Question created successfully!");
            // Reset form after submission
            setQuestionText("");
            setQuestionType("Single Choice");
            setQuestionScore("");
            setCorrectAnswer("");
            setOptions([""]);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | { name?: string; value: unknown }
        >
    ) => {
        const { name, value } = e.target; // Lấy tên và giá trị từ sự kiện

        // Xóa lỗi cho trường hiện tại
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
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
            <Container sx={{ marginTop: "150px" }}>
                <Container
                    component="main"
                    sx={{
                        width: "70%",
                        margin: "0 auto",
                        paddingBottom: "10px",
                    }}
                >
                    <Box
                        sx={{
                            border: "2px solid #ccc",
                            borderRadius: "10px",
                            padding: "15px",
                            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
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
                                        Title{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="title"
                                        type="text"
                                        fullWidth
                                        value={editingExam?.title || ""}
                                        onChange={handleEditChange}
                                        className={classes.textFieldCustom}
                                    />
                                </Box>
                                <Box sx={{ marginBottom: 2, width: "100%" }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                        }}
                                    >
                                        Description{" "}
                                        <span style={{ color: "red" }}>*</span>
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
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "",
                                    alignItems: "center",
                                    marginBottom: 3,
                                }}
                                className={classes.textFieldCustom}
                            >
                                {/* <Box sx={{ minWidth: 140 }}>
                  <FormControl fullWidth>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Status <span style={{ color: "red" }}>*</span>
                    </Typography>{" "}
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={editingExam?.status || ""}
                      onChange={handleEditChange}
                    >
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Box> */}
                                <Box sx={{ width: 210, margin: "0 10px" }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Start Time{" "}
                                        <span style={{ color: "red" }}>*</span>
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
                                        value={editingExam?.startTime || ""}
                                        onChange={handleEditChange}
                                    />
                                </Box>
                                <Box
                                    sx={{ minWidth: 210, marginRight: "10px" }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        End Time{" "}
                                        <span style={{ color: "red" }}>*</span>
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
                                        value={editingExam?.endTime || ""}
                                        onChange={handleEditChange}
                                    />
                                </Box>
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                        }}
                                    >
                                        Duration{" "}
                                        <span style={{ color: "red" }}>*</span>
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
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ marginLeft: 1 }}
                                                >
                                                    min
                                                </Typography>
                                            ),
                                        }}
                                    />
                                </Box>

                                {/* <Box
                  sx={{
                    width: "230px",
                  }}
                >
                  <TextField
                    variant="outlined"
                    disabled
                    className={classes.textFieldCustom}
                    value={
                      startTime && endTime
                        ? `${Math.abs(
                            (new Date(endTime).getTime() -
                              new Date(startTime).getTime()) /
                              60000
                          ).toFixed(0)} min`
                        : "0 min"
                    }
                    InputProps={{
                      sx: {
                        backgroundColor: "#a4eeed",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </Box> */}
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    onClick={() =>
                                        router.push("/exam/manage-exam")
                                    }
                                    variant="contained"
                                    className={`${classes.btnRed} ${classes.btnMedium}`}
                                    sx={{ marginRight: 2 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleEditSave}
                                    variant="contained"
                                    className={`${classes.btnBlue} ${classes.btnMedium}`}
                                >
                                    Update
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
                <Container
                    component="main"
                    sx={{
                        width: "70%",
                        margin: "0 auto",
                        paddingBottom: "30px",
                    }}
                >
                    <Box
                        sx={{
                            border: "2px solid #ccc",
                            borderRadius: "10px",
                            padding: "20px 15px 5px 15px",
                            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
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
                            CREATE QUESTION
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Box sx={{ marginBottom: 1 }} lang="en">
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Question Text{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    name="questionText"
                                    type="text"
                                    fullWidth
                                    value={questionText}
                                    onChange={(e) => {
                                        setQuestionText(e.target.value);
                                        handleInputChange(e);
                                    }}
                                    className={classes.textFieldCustom}
                                />
                                {errors.questionText && (
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "red" }}
                                    >
                                        {errors.questionText}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ marginBottom: 1 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Question Score{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    name="questionScore"
                                    type="number"
                                    fullWidth
                                    value={questionScore}
                                    onChange={(e) => {
                                        setQuestionScore(e.target.value);
                                        handleInputChange(e);
                                    }}
                                    className={classes.textFieldCustom}
                                />
                                {errors.questionScore && (
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "red" }}
                                    >
                                        {errors.questionScore}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ marginBottom: 1 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Correct Answer
                                </Typography>
                                <TextField
                                    type="text"
                                    required
                                    fullWidth
                                    disabled
                                    sx={{ marginBottom: 2, width: "100%" }}
                                    InputProps={{
                                        sx: {
                                            fontWeight: "bold",
                                            color: "black",
                                        }, // Đặt chữ đậm
                                    }}
                                    value={correctAnswer}
                                    onChange={(e) =>
                                        setCorrectAnswer(e.target.value)
                                    }
                                    className={classes.textFieldCustomGreen}
                                />
                            </Box>
                            {options.map((option, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: 1,
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                checked={
                                                    correctAnswer === option
                                                }
                                                onChange={() => {
                                                    setCorrectAnswer(option);
                                                    setIsAnswerSelected(true);
                                                }}
                                            />
                                        }
                                        label={
                                            <TextField
                                                value={option}
                                                onChange={(e) =>
                                                    handleOptionChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                variant="outlined"
                                                size="small"
                                                sx={{ marginLeft: 1 }}
                                                className={
                                                    classes.textFieldCustom
                                                }
                                            />
                                        }
                                    />
                                    <Button
                                        className={`${classes.btnRed} ${classes.btnSmallest}`}
                                        // variant="outlined"
                                        onClick={() => {
                                            const newOptions = options.filter(
                                                (_, i) => i !== index
                                            );
                                            setOptions(newOptions);
                                        }}
                                        sx={{ marginLeft: 1 }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </Box>
                            ))}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: " space-between",
                                }}
                            >
                                <Button
                                    className={`${classes.btnBlue} ${classes.btnMedium}`}
                                    onClick={addOption}
                                    sx={{ marginBottom: 2 }}
                                >
                                    ADD OPTION
                                </Button>
                                <Button
                                    className={`${classes.btnGreen} ${classes.btnLarge}`}
                                    type="submit"
                                    variant="contained"
                                >
                                    CREATE QUESTION
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Container>
        </>
    );
};

export default withAuth(EditExamForm, ["TEACHER"]);
