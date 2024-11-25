import React, { JSXElementConstructor, ReactElement, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useScrollTrigger,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import classes from "./navbar-home.module.scss";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { WidthFull } from "@mui/icons-material";
import { getUserProfile } from "../../helpers/api/user-api";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

interface NavBarHomeProps {
  window?: () => Window;
  loadingBarRef: React.RefObject<LoadingBarRef>;
}

interface NavButtonProps {
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface ElevationScrollProps {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
  window?: () => Window;
}

const ElevationScroll: React.FC<ElevationScrollProps> = ({
  children,
  window,
}) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    color: trigger ? "default" : "transparent",
    // sx: {
    //   paddingTop: trigger ? "1rem" : "1rem",
    //   paddingBottom: trigger ? "1rem" : "1rem",
    // },
  });
};

const NavButton: React.FC<NavButtonProps> = ({ text, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      color="primary"
      sx={{
        borderRadius: "2rem",
        marginLeft: "1rem",
        border: "0.5px solid #fff",
        color: "#fff",
        ":hover": {
          border: "transparent",
          color: "#229594",
          opacity: "0.8",
          backgroundColor: "#fff",
          fontWeight: "bold",
          transition: "all 0.9s ease-in-out",
        },
      }}
    >
      {text}
    </Button>
  );
};

const drawerWidth = 240;

const NavBarHome: React.FC<NavBarHomeProps> = (props) => {
  const { window, loadingBarRef } = props;
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  //   const { data: session, status } = useSession();
  //   const userId = session.userId;

  const [total, setTotal] = useState(Infinity);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === "authenticated" && session) {
        const userId = session.userId;
        const accessToken = session.accessToken;

        if (userId && accessToken) {
          // Kiểm tra xem limit có phải là số hợp lệ không
          if (total !== undefined && total > 0) {
            try {
              const user = await getUserProfile(userId as string, accessToken);
              setUser(user);
            } catch (error) {
              toast.error("Failed to fetch user profile");
            }
          }
        }
      }
    };

    fetchUser();
  }, [status, session]);

  const handleEditClick = (user) => {
    router.push({
      pathname: "/user/profile-user",
      query: { userId: user._id }, // Pass the exam ID as a query parameter
    });
  };

  const handleBackButton = () => {
    if (user && user.role === "TEACHER") {
      router.push("/exam/manage-exam");
    } else if (user && user.role === "ADMIN") {
      router.push("/user/list-user");
    } else if (user && user.role === "STUDENT") {
      router.push("/user/home-student");
    }
  };

  const showLoadingWidget = () => {
    loadingBarRef.current.continuousStart(50);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart(50);
    }
    await signOut({ callbackUrl: "/" });
    if (loadingBarRef.current) {
      loadingBarRef.current.complete();
    }
    router.push("/");
  };

  const gotoPage = async (url: string) => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart(50);
    }
    router.push(url);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        ExamGuard App
      </Typography>
      <Divider />
      <List>
        {["Home"].map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <React.Fragment>
      <CssBaseline />

      <ElevationScroll>
        <AppBar
          sx={{
            paddingTop: "1rem",
            paddingBottom: "1rem",
            backgroundColor: "#229594",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <MenuIcon />
              </IconButton>

              <Link href="/">
                <Image
                  src="/images/logo.png"
                  height="62px"
                  width="144px"
                  alt="Logo"
                  className={classes.navLogo}
                  objectFit="contain"
                />
              </Link>

              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, ml: 2 }}
              >
                {/* ExamGuard App */}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Link href="/">
                  <NavButton text="Introduction" />
                </Link>

                {status === "authenticated" && (
                  <NavButton text="Dashboard" onClick={handleBackButton} />
                )}

                {status === "unauthenticated" && (
                  <NavButton
                    text="Sign in"
                    onClick={() => gotoPage("/auth/login")}
                  />
                )}

                {status === "authenticated" && (
                  <NavButton text="Logout" onClick={handleLogout} />
                )}

                <Box
                  onClick={() => handleEditClick(user)}
                  sx={{ marginLeft: "15px", cursor: "pointer" }}
                >
                  {status === "authenticated" && user ? ( // Kiểm tra trạng thái xác thực và user không null
                    <Avatar
                      src={user.avatar}
                      alt="User Avatar"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                  ) : null}
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>

      {/* <Toolbar /> */}

      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </React.Fragment>
  );
};

export default NavBarHome;
