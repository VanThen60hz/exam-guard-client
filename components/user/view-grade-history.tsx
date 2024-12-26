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
import { getGradeHistory } from "../../helpers/api/exam-api";

// Icons
import UndoIcon from "@mui/icons-material/Undo";

// Components
import { useRouter } from "next/router";
import withAuth from "../../components/withAuth/with-auth";
import LinearProgress from "@mui/material/LinearProgress";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import NavBarHome from "../../components/home/navbar-home";

const ViewGradeHistoryForm: React.FC = () => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const router = useRouter();
  const [listGradeHistory, setListGradeHistory] = useState([]);

  //Get List Cheating by Student
  useEffect(() => {
    const fetchGradeHistory = async () => {
      setLoading(true);
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;
        if (userId && accessToken) {
          try {
            const listGradeHistory = await getGradeHistory(
              userId,
              accessToken,
              page,
              limit
            );
            setListGradeHistory(listGradeHistory.grades);
            setTotalPage(listGradeHistory.totalPages);
          } catch (error) {
            toast.error("Failed to fetch grade");
          }
        }
      }
      setLoading(false);
    };
    fetchGradeHistory();
  }, [status, session, page, limit]);

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
          <Box>
            {listGradeHistory.length > 0 ? (
              <Table
                sx={{ minWidth: 700, tableLayout: "fixed" }}
                aria-label="customized table"
              >
                <TableHead>
                  <TableRow>
                    <StyledTableCell width="5%">ID</StyledTableCell>
                    <StyledTableCell width="13%">Title</StyledTableCell>
                    <StyledTableCell width="20%">Description</StyledTableCell>
                    <StyledTableCell width="6%">Score</StyledTableCell>
                    <StyledTableCell width="10%">Time Submit</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listGradeHistory?.map((grade, index) => (
                    <StyledTableRow key={grade._id}>
                      <StyledTableCell>
                        {grade.exam?._id.slice(-5)}
                      </StyledTableCell>
                      <StyledTableCell>{grade.exam?.title}</StyledTableCell>
                      <StyledTableCell>
                        {grade.exam?.description}
                      </StyledTableCell>
                      <StyledTableCell>
                        <p style={{ fontWeight: "bold", color: "#000" }}>
                          {grade?.score}
                        </p>
                      </StyledTableCell>
                      <StyledTableCell>
                        {formatDateTime(grade?.createdAt)}
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

export default withAuth(ViewGradeHistoryForm, ["STUDENT"]);
