// import { getUsers } from "../helpers/api/user-api"; // Adjust the import based on your API helper
// import { User } from "../models/user-models"; // Adjust the import based on your User model
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
import { LoadingBarRef } from "react-top-loading-bar";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import NavBarHome from "../../components/home/navbar-home";
import {
  getListUser,
  updateUser,
  deleteUser,
  searchUser,
} from "../../helpers/api/user-api";
import classes from "./list.module.scss";
import profileUserClasses from "./profileUser.module.scss";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

// Components
import Autocomplete from "@mui/material/Autocomplete";

enum EPaginationOfPage {
  USERS_PER_PAGE = 8,
}

const UsersPage: React.FC = () => {
  // State declarations
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [gender, setGender] = useState<null | HTMLElement>(null);
  const [role, setRole] = useState<null | HTMLElement>(null);
  const [listUser, setlistUser] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(2);
  const [limit, setLimit] = useState(15); // Giới hạn số người dùng hiển thị
  const [totalPages, setTotalPages] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { data: session, status } = useSession();

  // Refs
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  const genderRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  //Upload Avatar
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Thay thế bằng upload_preset từ Cloudinary
    formData.append("folder", "imageUser"); // Thêm vào thư mục cụ thể

    try {
      // Tải ảnh mới lên Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/duv0ugc5x/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error uploading avatar: ${errorText}`);
      }

      const data = await response.json();
      const imgUrl: string = data.secure_url;

      // Cập nhật avatar trong trạng thái editingUser
      setEditingUser((prev) => ({
        ...prev,
        avatar: imgUrl, // Cập nhật URL của ảnh đã tải lên
      }));

      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload avatar.");
    }
  };

  //Null click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genderRef.current &&
        !genderRef.current.contains(event.target as Node)
      ) {
        setGender(null);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRole(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //Get List users
  useEffect(() => {
    const fetchListUser = async () => {
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;

        if (userId && accessToken) {
          // Kiểm tra xem limit có phải là số hợp lệ không
          if (limit !== undefined && limit > 0) {
            try {
              const list = await getListUser(userId, accessToken, page, limit);
              setlistUser(list);
              setFilteredUsers(list);
              setPage(list.totalPages);
              setLimit(list.total);
              setPage(1)
            } catch (error) {
              toast.error("Failed to fetch user profile");
            }
          }
        }
      }
    };

    fetchListUser();
  }, [status, session, page, limit]);

  useEffect(() => {
    let filtered = listUser;

    // Apply gender filter
    if (selectedGender) {
      filtered = filtered.filter(
        (user) => user.gender.toUpperCase() === selectedGender.toUpperCase()
      );
    }

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(
        (user) => user.role.toUpperCase() === selectedRole.toUpperCase()
      );
    }

    setFilteredUsers(filtered);
    setTotalPages(
      Math.ceil(filtered.length / EPaginationOfPage.USERS_PER_PAGE) 
    );
    setPage(1);
  }, [selectedGender, selectedRole, listUser]);

  useEffect(() => {});

  // Event handlers for filters
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setGender(event.currentTarget);
  };

  const handleClose = () => {
    setGender(null);
  };

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender || null);
    handleClose();
  };

  const handleClickRole = (event: React.MouseEvent<HTMLButtonElement>) => {
    setRole(event.currentTarget);
  };

  const handleCloseRole = () => {
    setRole(null);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role || null);
    handleCloseRole();
  };

  // User editing functions
  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleEditSave = async () => {
    try {
      await handleSaveEdit(editingUser);
      setEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  //Edit user function
  const handleSaveEdit = async (updatedUser) => {
    if (status === "authenticated" && session) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        try {
          const updatedUserData = await updateUser(
            userId,
            accessToken,
            updatedUser._id,
            updatedUser
          );
          setlistUser(
            listUser.map((user) =>
              user._id === updatedUserData._id ? updatedUserData : user
            )
          );
          setEditingUser(null);
          toast.success("User updated successfully!");
        } catch (error) {
          toast.error("Failed to update user");
        }
      }
    }
  };

  // User deletion functions
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (status === "authenticated" && session && userToDelete) {
      const userId = session.userId;
      const accessToken = session.accessToken;

      if (userId && accessToken) {
        try {
          // Assume you have a deleteUser function imported from your API
          await deleteUser(userId, accessToken, userToDelete._id, userToDelete);
          setlistUser(listUser.filter((user) => user._id !== userToDelete._id));
          toast.success("User deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete user");
        }
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // User search functions
  const handleSearch = async (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    if (value) {
      try {
        const users = await searchUser(
          session.userId,
          session.accessToken,
          value
        );
        setFilteredUsers(users);
        setTotalPages(
          Math.ceil(users.length / EPaginationOfPage.USERS_PER_PAGE)
        );
        setPage(1); // Reset to first page when search is performed
        console.log(users);
      } catch (error) {
        toast.error("Failed to search users");
      }
    } else {
      // If search term is empty, reset to the full user list
      setFilteredUsers(listUser);
      setTotalPages(
        Math.ceil(listUser.length / EPaginationOfPage.USERS_PER_PAGE)
      );
      setPage(1);
    }
  };

  // Change page
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value); // Giữ nguyên trang hiện tại
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
      fontSize: 12,
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

  //Filter button style
  const filterButtonStyle = {
    color: "#229594", // Changed to match the theme color
    padding: "8px 12px",
    width: "100%",
    justifyContent: "space-between",
    textTransform: "none",
    fontWeight: "bold",
    border: "1px solid #229594", // Changed to match the theme color
    borderRadius: "4px",
    backgroundColor: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#e0f2f2", // Light teal color on hover
    },
  };

  const filterBoxStyle = {
    width: 150,
    position: "relative",
    marginRight: "16px",
  };

  const menuItemStyle = {
    fontWeight: "600",
    fontSize: 14,
    color: "#229594", // Changed to match the theme color
    "&:hover": {
      backgroundColor: "#e0f2f2", // Light teal color on hover
    },
  };

  //Status toggle
  interface StatusToggleProps {
    initialStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    onChange?: (status: "ACTIVE" | "INACTIVE" | "SUSPENDED") => void;
  }

  const StatusToggle: React.FC<StatusToggleProps> = ({
    initialStatus,
    onChange,
  }) => {
    const [status, setStatus] = useState(initialStatus);

    const handleClick = () => {
      let newStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      switch (status) {
        case "INACTIVE":
          newStatus = "ACTIVE";
          break;
        case "ACTIVE":
          newStatus = "SUSPENDED";
          break;
        case "SUSPENDED":
          newStatus = "INACTIVE";
          break;
        default:
          newStatus = "INACTIVE";
      }
      setStatus(newStatus);
      if (onChange) {
        onChange(newStatus);
      }
    };

    const getColor = () => {
      switch (status) {
        case "ACTIVE":
          return "#4CAF50";
        case "INACTIVE":
          return "#9E9E9E";
        case "SUSPENDED":
          return "#F44336";
      }
    };

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          onClick={handleClick}
          sx={{
            width: "40px", // Giảm kích thước từ 60px xuống 40px
            height: "20px", // Giảm kích thước từ 30px xuống 20px
            backgroundColor: getColor(),
            borderRadius: "10px", // Điều chỉnh border radius
            position: "relative",
            cursor: "pointer",
            transition: "background-color 0.3s",
            "&::after": {
              content: '""',
              position: "absolute",
              width: "16px", // Giảm kích thước từ 26px xuống 16px
              height: "16px", // Gi���m kích thước từ 26px xuống 16px
              borderRadius: "8px", // Điều chỉnh border radius
              backgroundColor: "white",
              top: "2px",
              left:
                status === "ACTIVE"
                  ? "22px"
                  : status === "SUSPENDED"
                  ? "2px"
                  : "12px", // Điều chỉnh vị trí
              transition: "left 0.3s",
            },
          }}
        />
        <Typography
          sx={{
            marginLeft: "8px", // Giảm khoảng cách
            color: getColor(),
            fontWeight: "bold",
            fontSize: "14px", // Giảm kích thước chữ
          }}
        >
          {status}
        </Typography>
      </Box>
    );
  };

  //Displayed users 
  const displayedUsers = filteredUsers.slice(
    (page - 1) * EPaginationOfPage.USERS_PER_PAGE,
    page * EPaginationOfPage.USERS_PER_PAGE
  );


  return (
    <>
      <NavBarHome loadingBarRef={loadingBarRef} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "108px 50px 0 ",
        }}
      >
        <Box sx={{ display: "flex" }}>
          {/* Gender filter */}
          <Box sx={filterBoxStyle} ref={genderRef}>
            <Button
              id="gender-filter-button"
              aria-controls={gender ? "gender-filter-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={gender ? "true" : undefined}
              onClick={handleClick}
              variant="outlined" // Changed to outlined
              sx={filterButtonStyle}
            >
              <span>{selectedGender || "GENDER"}</span>
              <ExpandMoreIcon />
            </Button>
            {gender && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 9999,
                  bgcolor: "background.paper",
                  boxShadow: 3,
                  borderRadius: "4px",
                  width: "100%",
                  mt: "4px",
                  border: "1px solid #229594", // Changed to match the theme color
                }}
              >
                <MenuItem
                  sx={menuItemStyle}
                  onClick={() => handleGenderSelect("MALE")}
                >
                  MALE
                </MenuItem>
                <MenuItem
                  sx={menuItemStyle}
                  onClick={() => handleGenderSelect("FEMALE")}
                >
                  FEMALE
                </MenuItem>
                <MenuItem
                  sx={menuItemStyle}
                  onClick={() => handleGenderSelect("")}
                >
                  CLEAR FILTER
                </MenuItem>
              </Box>
            )}
          </Box>

          {/* Role filter */}
          <Box sx={filterBoxStyle} ref={roleRef}>
            <Button
              id="role-filter-button"
              aria-controls={role ? "role-filter-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={role ? "true" : undefined}
              onClick={handleClickRole}
              variant="outlined" // Changed to outlined
              sx={filterButtonStyle}
            >
              <span>{selectedRole || "ROLE"}</span>
              <ExpandMoreIcon />
            </Button>
            {role && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 9999,
                  bgcolor: "background.paper",
                  boxShadow: 3,
                  borderRadius: "4px",
                  width: "100%",
                  mt: "4px",
                  border: "1px solid #229594", // Changed to match the theme color
                }}
              >
                <MenuItem
                  sx={menuItemStyle}
                  onClick={() => handleRoleSelect("STUDENT")}
                >
                  STUDENT
                </MenuItem>
                <MenuItem
                  sx={menuItemStyle}
                  onClick={() => handleRoleSelect("TEACHER")}
                >
                  TEACHER
                </MenuItem>
                <MenuItem
                  sx={menuItemStyle}
                  onClick={() => handleRoleSelect("")}
                >
                  CLEAR FILTER
                </MenuItem>
              </Box>
            )}
          </Box>
        </Box>
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
                  borderRadius: "20px",
                  backgroundColor: "#e9ffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover": {
                    backgroundColor: "#e1fdfd",
                  },
                  position: "relative",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                InputProps={{
                  ...params.InputProps,
                  type: "text",
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton>
                        <SearchIcon sx={{ color: "#229594" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#229594",
                          color: "white",
                          borderRadius: "0 20px 20px 0",
                          padding: "10px 20px",
                          height: "56px",
                          width: "150px",
                          fontWeight: "bold",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",

                          "&:hover": {
                            backgroundColor: "#1a7170",
                          },
                          position: "absolute",
                          right: 0,
                        }}
                      >
                        SEARCH
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Button
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "30px",
            padding: "12px 24px",
            backgroundColor: "#e9ffff",
            color: "#229594",
            fontWeight: "bold",
            border: "none",
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            transition:
              "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease", // Smooth transitions
            "&:hover": {
              backgroundColor: "#b2e0e0",
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)",
            },
          }}
          variant="contained"
        >
          <Tooltip title="Add user">
            <PersonAddAlt1Icon />
          </Tooltip>
        </Button>
      </Box>
      <Box sx={{ margin: "30px 50px 50px" }}>
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
                <StyledTableCell width="7%">Avatar</StyledTableCell>
                <StyledTableCell width="3%">ID</StyledTableCell>
                <StyledTableCell width="11%">Name</StyledTableCell>
                <StyledTableCell width="6%">Gender</StyledTableCell>
                <StyledTableCell width="7%">Role</StyledTableCell>
                <StyledTableCell width="7%">Phone</StyledTableCell>
                <StyledTableCell width="15%">Email</StyledTableCell>
                <StyledTableCell width="15%">Address</StyledTableCell>
                <StyledTableCell width="11%">Status</StyledTableCell>
                <StyledTableCell width="5%" align="center">
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedUsers.map((user, index) => (
                <StyledTableRow key={user._id}>
                  <StyledTableCell>
                    <Avatar
                      src={user.avatar}
                      alt="User Avatar"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }} // Use sx for styling
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    {(page - 1) * EPaginationOfPage.USERS_PER_PAGE + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>{user.name}</StyledTableCell>
                  <StyledTableCell>{user.gender}</StyledTableCell>
                  <StyledTableCell>{user.role}</StyledTableCell>
                  <StyledTableCell>{user.phone_number}</StyledTableCell>
                  <StyledTableCell>
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
                        {user.email}
                      </span>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>{user.address}</StyledTableCell>
                  <StyledTableCell>
                    <StatusToggle
                      initialStatus={
                        user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED"
                      }
                      onChange={(newStatus) => {
                        if (editingUser && editingUser._id === user._id) {
                          setEditingUser({
                            ...editingUser,
                            status: newStatus,
                          });
                        } else {
                          handleSaveEdit({
                            ...user,
                            status: newStatus,
                          });
                        }
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
          count={totalPages}
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
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            minWidth: "400px",
            padding: "20px",
            borderRadius: "20px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <WarningIcon
            sx={{
              fontSize: 50,
              color: "warning.dark",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              textAlign: "center",
              fontSize: "21px",
              fontWeight: "bold",
            }}
          >
            Do you want to delete this member?
          </DialogTitle>
        </Box>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteClose}
            color="primary"
            autoFocus
            startIcon={<CancelIcon />}
            className={classes.btnBlue}
            sx={{ minWidth: "120px" }}
          >
            No
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            className={classes.btnRed}
            sx={{ minWidth: "120px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            padding: "10px",
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          EDIT USER
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={editingUser?.name || ""}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="phone_number"
            label="Phone"
            type="text"
            fullWidth
            value={editingUser?.phone_number || ""}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={editingUser?.email || ""}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            value={editingUser?.address || ""}
            onChange={handleEditChange}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <FormControl
                component="fieldset"
                margin="dense"
                sx={{ margin: "10px" }}
              >
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  aria-label="gender"
                  name="gender"
                  value={editingUser?.gender || ""}
                  onChange={handleEditChange}
                >
                  <FormControlLabel
                    value="MALE"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="FEMALE"
                    control={<Radio />}
                    label="Female"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset" margin="dense">
                <FormLabel component="legend">Role</FormLabel>
                <RadioGroup
                  aria-label="role"
                  name="role"
                  value={editingUser?.role || ""}
                  onChange={handleEditChange}
                >
                  <FormControlLabel
                    value="TEACHER"
                    control={<Radio />}
                    label="Teacher"
                  />
                  <FormControlLabel
                    value="STUDENT"
                    control={<Radio />}
                    label="Student"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box>
              <Avatar
                src={editingUser?.avatar || ""} // Use src instead of value
                alt="User Avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  border: "1px solid #000",
                  margin: "10px 30px -10px",
                }}
              />
              <Button
                className={profileUserClasses.buttonUploadAvatar}
                sx={{
                  width: "170px !important",
                  height: "30px !important",
                  marginRight: "40px",
                }}
                variant="contained"
                component="label"
                onChange={handleEditChange}
              >
                <p
                  style={{
                    paddingTop: "4px",
                    fontFamily: "Lexend",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#229594",
                  }}
                >
                  Upload New Avatar
                </p>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload} // Gọi hàm handleAvatarUpload
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditClose}
            className={classes.btnRed}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            className={classes.btnBlue}
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersPage;
