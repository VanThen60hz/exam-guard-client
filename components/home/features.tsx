import {
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
} from "@mui/material";
import React from "react";
import classes from "./home.module.scss";
import Image from "next/image";

interface FeaturesProps {}

const featureList = [
  {
    icon: "vid-protoc.png",
    color: "#DD7F6B",
    title: "Video Proctoring",
    content: "Support for live video proctoring (future support)",
  },
  {
    icon: "block-app-exit.png",
    title: "Detect screen switch",
    content: "Detect user leaves exam page",
    padding: "0px",
  },
  {
    icon: "ai-face-detection.png",
    title: "AI Face Detection",
    content:
      "Advance AI and ML to detect cheating by tracking student’s facial movements",
  },
  {
    icon: "cross-platform.png",
    title: "Cross Platform",
    content: "This platform is availabe on Web and Android",
    padding: "12px",
    color: "darkmagenta",
  },
  {
    icon: "friendly.png",
    title: "User friendly",
    content:
      "Optimized interface with clear buttons, instructions and intuitive layout",
    padding: "12px",
    color: "lightblue",
  },

  {
    icon: "assement-and-auditing.png",
    title: "Assesment and Auditing",
    content: "Support for instant assessment and auditing",
    padding: "0px",
  },
];

const Features: React.FC<FeaturesProps> = () => {
  return (
    <section className={classes.featureSection}>
      <Container maxWidth="xl">
        <Grid
          container
          rowSpacing={5}
          columnSpacing={5}
          justifyContent="center"
        >
          {featureList.map((feature, i) => {
            return (
              <Grid item key={i}>
                <Card
                  sx={{
                    maxWidth: "350px",
                    backgroundColor: "#007E7D",
                    borderRadius: "0.85rem",
                    boxShadow: "0 5px 25px rgb(0 0 0 / 8%)",
                    padding: "1.5rem",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <CardMedia>
                    <Image
                      src={`/images/icon/${feature.icon}`}
                      height="108px"
                      width="200px"
                      objectFit="contain"
                      alt="icon"
                    />
                  </CardMedia>

                  <CardContent>
                    <h3 style={{ color: "#fff", fontSize: "1.25rem" }}>
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        color: "#fff",
                        fontSize: "1.125rem",
                        fontWeight: "500",
                      }}
                    >
                      {feature.content}
                    </p>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </section>
  );
};

export default Features;
