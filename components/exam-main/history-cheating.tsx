import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Pagination,
    Paper,
    styled,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import UndoIcon from "@mui/icons-material/Undo";

import io from "socket.io-client";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getListNotification } from "../../helpers/api/cheating-api";
import { toast } from "react-toastify";
import withAuth from "../withAuth/with-auth";

const HistoryCheatingPage: React.FC = () => {
    // Nhận onCheatingDetected như một prop
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false); // Thêm state loading
    const [totalPage, setTotalPage] = useState(1);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);
    const router = useRouter();
    const [listNotification, setListNotification] = useState([]);

    useEffect(() => {
        const fetchListCheatingByStudent = async () => {
            setLoading(true);
            if (status === "authenticated" && session) {
                const userId = session.userId;
                const accessToken = session.accessToken;
                if (userId && accessToken) {
                    try {
                        const listHistoryCheating = await getListNotification(
                            userId,
                            accessToken,
                            page,
                            limit
                        );
                        setListNotification(listHistoryCheating);
                        setTotalPage(listHistoryCheating.totalPages);
                    } catch (error) {
                        toast.error("Failed to fetch list cheating by student");
                    }
                }
            }
            setLoading(false);
        };
        fetchListCheatingByStudent();
    }, [status, session, limit]);

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

    const formatDateTime = (dateTime: string) => {
        if (!dateTime) {
            return "Không có dữ liệu"; // Hoặc một giá trị mặc định khác
        }
        // Cắt chuỗi để lấy các phần
        const [datePart, timePart] = dateTime.split("T");
        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":");
        // Chuyển đổi giờ sang định dạng 12 giờ
        const hour12 = parseInt(hour) % 12 || 12; // Chuyển đổi 0 giờ thành 12
        const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
        return `${day}/${month}/${year} ${hour12}:${minute} ${ampm}`;
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackClick = () => {
        router.push({
            pathname: "/exam/manage-exam",
        });
    };
    return (
        <>
            ss
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
                    <h2>List Cheating History</h2>

                    <Button onClick={() => handleBackClick()}>
                        <Tooltip title="Back">
                            <UndoIcon
                                sx={{
                                    color: "red",
                                }}
                            ></UndoIcon>
                        </Tooltip>
                    </Button>
                </Box>
                <div
                    style={{
                        borderBottom: "1px solid #ccc",
                        margin: "5px 0",
                    }}
                />
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
                        sx={{ minWidth: 500, tableLayout: "fixed" }}
                        aria-label="student detail table"
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell width="8%">
                                    Student Name
                                </StyledTableCell>
                                <StyledTableCell width="8%">
                                    Infraction Type
                                </StyledTableCell>
                                <StyledTableCell width="10%">
                                    Exam Title
                                </StyledTableCell>
                                <StyledTableCell width="15%">
                                    Time
                                </StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listNotification?.map((user) => (
                                <StyledTableRow key={user._id}>
                                    <StyledTableCell>
                                        {user.noti_options.studentName}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {user.noti_options.infractionType}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {user.noti_options.examTitle}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {formatDateTime(user.createdAt)}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
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
            </Box>
        </>
    );
};

export default withAuth(HistoryCheatingPage, ["TEACHER"]);
