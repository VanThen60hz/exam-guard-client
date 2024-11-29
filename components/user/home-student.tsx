import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Avatar,
    Modal,
    Box,
    Stack,
    Autocomplete,
    InputAdornment,
    IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EastIcon from "@mui/icons-material/East";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { getListExam, joinExam, searchExam } from "../../helpers/api/exam-api";

// SCSS
import classes from "../../components/user/home-student.module.scss";
import classes2 from "../../components/user/profile-user.module.scss";

import withAuth from "../../components/withAuth/with-auth";
import { title } from "process";

const HomeStudentForm: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [listData, setListData] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100000);

    // Router chuyển page
    const router = useRouter();

    // Load trang
    const [loading, setLoading] = useState(false);

    // Báo lỗi
    const [error, setError] = useState<string | null>(null);

    // Get session data
    const { data: session, status } = useSession();

    // console.log("Session:", session);

    useEffect(() => {
        // Cập nhật ngày giờ mỗi giây
        const intervalId = setInterval(() => {
            const now = new Date();

            // Định dạng ngày giờ theo dd/MM/YYYY, hh:mm:ss
            const formattedDate = now.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            const formattedTime = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true, // Thêm tùy chọn hour12 để hiển thị giờ theo 12 giờ và AM/PM
            });

            setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
        }, 1000); // Cập nhật mỗi giây

        // Clear interval khi component bị unmount
        return () => clearInterval(intervalId);
    }, []);

    // Lấy thông tin người dung
    useEffect(() => {
        const fetchListExams = async () => {
            setLoading(true);
            if (status === "authenticated" && session) {
                const userId = session.userId;
                const accessToken = session.accessToken;
                if (userId && accessToken) {
                    try {
                        const listExam = await getListExam(
                            userId,
                            accessToken,
                            page,
                            limit
                        );
                        setListData(listExam);
                        console.log("List exam:", listExam);
                    } catch (error) {
                        console.error("Error getting exam:", error);
                        toast.error("Failed to fetch exam");
                        setError(error.message);
                    } finally {
                        setLoading(false);
                    }
                }
            }
            return listData;
        };
        fetchListExams(); // Call the function to fetch user profile
    }, [status, session]);

    // if (loading) {
    //     return <div>Loading user profile...</div>;
    // }

    const handleSearch = async (
        event: React.ChangeEvent<{}>,
        value: string | null
    ) => {
        if (value) {
            try {
                const exam = await searchExam(
                    session.userId,
                    session.accessToken,
                    value
                );
                setListData(exam);
                setPage(1); // Reset to first page when search is performed
                console.log(exam);
            } catch (error) {
                toast.error("Failed to search users");
            }
        } else {
            // If search term is empty, reset to the full user list
            const exam = await getListExam(
                session.userId,
                session.accessToken,
                page,
                limit
            );
            setListData(exam);
            setPage(1);
        }
    };

    const handleStart = async (exam) => {
        examTitle = exam.title;

        const join = await joinExam(
            session.userId,
            session.accessToken,
            exam._id
        );
        console.log("examid: ", join);
        if (join == 200) {
            router.push({
                pathname: "/user/answer-question",
                query: { examId: exam._id },
            });
        } else if (join == 403) {
            toast.info("You have already completed this exam");
        }
    };
    //Hiển thị ra màn hình
    return (
        <>
            <Container>
                <div
                    style={{
                        marginTop: "155px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Good Luck*/}
                    <div>
                        <h1>GOOD LUCK</h1>
                    </div>

                    {/* Hiển thị ngày giờ hiện tại */}
                    <div className={classes2.dateTime}>
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
                    </div>

                    {/* search */}
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
                                        boxShadow:
                                            "0px 2px 4px rgba(0, 0, 0, 0.1)",
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
                </div>
                <div className={classes.examList}>
                    {listData.map((exam, index) => (
                        <div
                            key={exam._id}
                            className={classes.examItem}
                            style={{
                                marginTop: "50px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                }}
                            >
                                <h2 className={classes.fontStyle}>
                                    {exam.title}
                                </h2>
                                <span className={classes.fontStyle}>
                                    Exam ID: {exam._id.slice(-5)}{" "}
                                    {/* Lấy 5 chữ cái cuối */}
                                </span>
                            </div>
                            <hr />
                            <p
                                className={classes.fontStyle}
                                style={{
                                    marginTop: "10px",
                                    wordBreak: "break-word",
                                }}
                            >
                                {exam.description}
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 30,
                                    marginTop: "20px",
                                }}
                            >
                                <span className={classes.fontStyle}>
                                    {new Date(exam.startTime).toLocaleString(
                                        "en-US",
                                        {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        }
                                    )}{" "}
                                </span>
                                <EastIcon sx={{ fill: "#6E6E6E" }} />
                                <span className={classes.fontStyle}>
                                    {new Date(exam.endTime).toLocaleString(
                                        "en-US",
                                        {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        }
                                    )}{" "}
                                </span>
                            </div>
                            <div>
                                <p
                                    className={classes.fontStyle}
                                    style={{
                                        marginTop: "20px",
                                    }}
                                >
                                    {exam.duration} minutes
                                </p>
                            </div>
                            <Button
                                className={classes.buttonStart}
                                variant="contained"
                                component="label"
                                onClick={() => handleStart(exam)}
                            >
                                Start
                            </Button>
                        </div>
                    ))}
                </div>
            </Container>
        </>
    );
};

export let examTitle: string;
export default withAuth(HomeStudentForm, ["STUDENT"]);
