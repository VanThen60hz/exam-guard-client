import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import {
  getListCheatingStatistic,
  getListCheatingByStudent,
} from "../../helpers/api/cheating-api";

// Icons
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UndoIcon from "@mui/icons-material/Undo";

// Components
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth/with-auth";
import LinearProgress from "@mui/material/LinearProgress";

import classes from "../../components/exam-main/manage-exam.module.scss";

const ListCheatingForm: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [listCheating, setListCheating] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const router = useRouter();
  const { examId } = router.query;
  const [studentId, setStudentId] = useState(null); // Declare studentId state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false); // Thêm state cho dialog
  const [selectedStudentId, setSelectedStudentId] = useState(null); // Thêm state cho studentId đã chọn

  //Get List Cheating Statistic
  useEffect(() => {
    const fetchListCheating = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const list = await getListCheatingStatistic(
              userId,
              accessToken,
              examId as string,
              page,
              limit
            );
            setListCheating(list.statistics);
            setTotalPage(list.totalPages);
          } catch (error) {
            toast.error("Failed to fetch list cheating");
          }
        }
      }
      setLoading(false);
    };

    fetchListCheating();
  }, [status, session, examId, page, limit]);

  const [listCheatingByStudent, setListCheatingByStudent] = useState([]);

  //Get List Cheating by Student
  useEffect(() => {
    const fetchListCheatingByStudent = async () => {
      if (selectedStudentId) {
        setLoading(true);
        if (status === "authenticated" && session) {
          const userId = session.userId;
          const accessToken = session.accessToken;
          if (userId && accessToken) {
            try {
              const listCheatingByStudent = await getListCheatingByStudent(
                userId,
                accessToken,
                examId as string,
                selectedStudentId,
                1,
                10000
              );
              setListCheatingByStudent(listCheatingByStudent.cheatingHistories);
            } catch (error) {
              toast.error("Failed to fetch list cheating");
            }
          }
        }
        setLoading(false);
      }
    };
    fetchListCheatingByStudent();
  }, [selectedStudentId, status, session, examId]);

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

  // Add this function to handle detail clicks
  const handleDetailClick = (examId, studentId) => {
    router.push({
      pathname: "/exam/list-cheating-by-student",
      query: { examId: examId, studentId: studentId },
    });
  };

  const handleBackClick = () => {
    router.push({
      pathname: "/exam/manage-exam",
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
          <h2>Title: {listCheating?.[0]?.exam?.title}</h2>
          <h2 style={{ marginLeft: "1100px" }}>
            ID: {listCheating?.[0]?.exam?._id.slice(-5)}
          </h2>
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
        <p
          style={{
            color: "rgba(0, 0, 0, 0.87)",
            fontSize: "20px",
            fontFamily: "Montserrat",
          }}
        >
          Description: {listCheating?.[0]?.exam?.description}
        </p>

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
            sx={{ minWidth: 700, tableLayout: "fixed" }}
            aria-label="customized table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell width="5%">Avatar</StyledTableCell>
                <StyledTableCell width="5%">ID</StyledTableCell>
                <StyledTableCell width="15%">Full name</StyledTableCell>
                <StyledTableCell width="15%">Email</StyledTableCell>
                <StyledTableCell width="11%">Face Detection</StyledTableCell>
                <StyledTableCell width="11%">Tab Switch</StyledTableCell>
                <StyledTableCell width="11%">Total Violations</StyledTableCell>
                <StyledTableCell width="5%">Detail</StyledTableCell>
                <StyledTableCell width="5%" align="center">
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listCheating?.map((user, index) => (
                <StyledTableRow key={user._id}>
                  <StyledTableCell>
                    <Avatar
                      src={user.avatar}
                      alt="User Avatar"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    {user.student._id.slice(-5)}
                  </StyledTableCell>
                  <StyledTableCell>{user.student.name}</StyledTableCell>
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
                        {user.student.email}{" "}
                      </span>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>{user.faceDetectionCount}</StyledTableCell>
                  <StyledTableCell>{user.tabSwitchCount}</StyledTableCell>
                  <StyledTableCell>{user.totalViolations}</StyledTableCell>
                  <StyledTableCell>
                    {" "}
                    <Button
                      onClick={() =>
                        handleDetailClick(user.exam._id, user.student._id)
                      }
                      sx={{ marginLeft: "-5px" }}
                    >
                      <Tooltip title="Detail">
                        <VisibilityIcon
                          sx={{
                            color: "#88976c",
                          }}
                        ></VisibilityIcon>
                      </Tooltip>
                    </Button>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      // onClick={() => handleDeleteClick(user)}
                      sx={{ marginLeft: "-5px" }}
                    >
                      <Tooltip title="Block">
                        <BlockIcon
                          sx={{
                            color: "red",
                          }}
                        />
                      </Tooltip>
                    </Button>
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

export default withAuth(ListCheatingForm, ["TEACHER"]);
