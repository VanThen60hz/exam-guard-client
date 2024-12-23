import React from "react";
import classes from "./home.module.scss";
import { Button, Container, Stack } from "@mui/material";
import Image from "next/image";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LoginIcon from "@mui/icons-material/Login";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LoadingBarRef } from "react-top-loading-bar";

interface HeroProps {
  loadingBarRef: React.RefObject<LoadingBarRef>;
}

const Hero: React.FC<HeroProps> = ({ loadingBarRef }) => {
  const session = useSession();

  const showLoadingWidget = () => {
    loadingBarRef.current.continuousStart(50);
  };

  return (
    <React.Fragment>
      <section className={classes.heroSection}>
        <Container maxWidth={false}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
          >
            <div className={classes.heroText} style={{ marginTop: "30px" }}>
              <h1>
                Online Exam Cheating Detection Platform using Face Detection
              </h1>
              <h2 style={{ marginTop: "80px", marginLeft:"-100px", color:"#fff" }}>
                ExamGuard is a cutting-edge platform that leverages AI and
                machine learning to ensure the integrity of online exams,
                providing a secure, reliable, and user-friendly experience
                across web and Android devices
              </h2>

              <Stack direction="row" className={classes.buttonGroup}>
                {/* <Link
                  href="#"
                  target="_blank"
                >
                  <Button
                    startIcon={<GitHubIcon />}
                    variant="contained"
                    style={{ backgroundColor: "#007E7D", fontWeight: "bold", width: "200px", height: "50px" }}
                  >
                    MOBILE APP
                  </Button>
                </Link>
                <Link href="/auth/login">
                    <Button
                      startIcon={<LoginIcon />}
                      variant="contained"
                      size="large"
                      style={{ backgroundColor: "#007E7D", fontWeight: "bold",  width: "200px", height: "50px" }}
                      disabled={session.status === "loading"}
                      onClick={showLoadingWidget}
                    >
                      SIGN IN
                    </Button>
                  </Link> */}
                {/* {session.status === "authenticated" ? (
                  <Link href="/dashboard">
                    <Button
                      startIcon={<ArrowOutwardIcon />}
                      variant="contained"
                      size="large"
                      style={{ backgroundColor: "#007E7D", fontWeight: "bold" }}
                      onClick={showLoadingWidget}
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                
                )} */}
              </Stack>
            </div>
          </Stack>
        </Container>
        <div className={classes.illustration}>
          <Image
            src="/images/hero-img.png"
            width="700px"
            height="503px"
            objectFit="contain"
            alt="Hero Image"
          />
        </div>
      </section>
    </React.Fragment>
  );
};

export default Hero;
