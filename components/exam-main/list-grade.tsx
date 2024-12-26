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
import Image from "next/image";
import { getListGrade } from "../../helpers/api/exam-api";

// Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import UndoIcon from "@mui/icons-material/Undo";

// Components
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth/with-auth";
import LinearProgress from "@mui/material/LinearProgress";

const ListGradeForm: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [listGrade, setListGrade] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const router = useRouter();
  const { examId } = router.query;

  //Get List Grade
  useEffect(() => {
    const fetchListGrade = async () => {
      setLoading(true);
      if (status === "authenticated" && session && examId) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const list = await getListGrade(
              userId,
              accessToken,
              examId as string,
              page,
              limit
            );
            setListGrade(list.grades);
            setTotalPage(list.totalPages);
          } catch (error) {
            toast.error("Failed to fetch list grade");
          }
        }
      }
      setLoading(false);
    };
    fetchListGrade();
  }, [status, session, examId, page, limit]);

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
      pathname: "/exam/list-answer-by-student",
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
          <h2>Title: {listGrade?.[0]?.exam?.title}</h2>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{}}>ID: {listGrade?.[0]?.exam?._id.slice(-5)}</h2>
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
        </Box>
        <p
          style={{
            color: "rgba(0, 0, 0, 0.87)",
            fontSize: "20px",
            fontFamily: "Montserrat",
          }}
        >
          Description: {listGrade?.[0]?.exam?.description}
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
          <Box>
            {listGrade.length > 0 ? (
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
                    <StyledTableCell width="11%">Score</StyledTableCell>
                    <StyledTableCell width="5%">Detail</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listGrade?.map((user, index) => (
                    <StyledTableRow key={user._id}>
                      <StyledTableCell>
                        <Avatar
                          src={user.student.avatar}
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
                      <StyledTableCell>
                        <p style={{ fontWeight: "bold", color: "#000" }}>
                          {user.score}
                        </p>
                      </StyledTableCell>
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
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
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

export default withAuth(ListGradeForm, ["TEACHER"]);
