import React from "react";
import classes from "./footer.module.scss";
import { Button, Container, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";


interface FooterProps {}

const footerInfos = [
  {
    img: "map.png",
    label: "WHERE WE ARE",
    desc01: "Da Nang, Viet Nam",
    desc02: "123/4/5 Street",
  },
  {
    img: "contact.png",
    label: "CONTACT WITH US",
    desc01: "abcd@gmail.com",
    desc02: "(+84)939183233",
  },
  {
    img: "social.png",
    label: "SOCIAL LINK",
    desc01: "facebook.com",
    desc02: "instagram.com",
  },
];

const Footer: React.FC<FooterProps> = () => {
  return (
    <div className={classes.footer}>
      <footer>
        <Container maxWidth="xl" className={classes.items}>
          <Grid container justifyContent="space-evenly" rowSpacing={5}>
            {footerInfos.map((info, i) => {
              return (
                <Grid
                  item
                  key={i}
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                >
                  <Image
                    src={`/images/${info.img}`}
                    width="50px"
                    height="50px"
                    objectFit="contain"
                    alt={info.label}
                    style={{ display: "block", margin: "0 " }}
                  />
                  <div style={{ marginTop: "30px" }}>
                    <Typography
                      variant="h6"
                      color={"#fff"}
                      style={{ marginBottom: "10px" }}
                    >
                      {info.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      textAlign={"center"}
                      style={{ marginBottom: "10px" }}
                    >
                      {info.desc01}
                    </Typography>
                    <Typography
                      variant="body1"
                      textAlign={"center"}
                      style={{ marginBottom: "10px" }}
                    >
                      {info.desc02}
                    </Typography>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </Container>

        <div className={classes.copyright}>
          <p>
            Developed by{" "}
            <a href="https://prathamesh.co" target="_blank" rel="noreferrer">
              Guardian Team
            </a>{" "}
            &#169; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
