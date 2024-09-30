import { Avatar, Card, CardContent, CardMedia, Container, Grid } from "@mui/material";
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
        title: "Blocks App Exit",
        content: "The user cannot exit the app or change tab during exam",
        padding: "0px",
    },
    {
        icon: "ai-face-detection.png",
        title: "AI Face Detection",
        content: "Advance AI and ML to detect cheating by tracking student’s facial movements",
    },
    {
        icon: "cross-platform.png",
        title: "Cross Platform",
        content: "This platform is availabe on Web, Android and iOS",
        padding: "12px",
        color: "darkmagenta",
    },
    {
        icon: "block-screen-capture.png",
        title: "Blocks Screen Capture",
        content: "The mobile version of the app blocks any form of screen capture",
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
                <Grid container rowSpacing={5} columnSpacing={5} justifyContent="center">
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
                                        <Image src={`/images/icon/${feature.icon}`} height="108px" width="200px" objectFit="contain" alt="icon" />
                                    </CardMedia>

                                    <CardContent>
                                        <h3 style={{ color: "#fff", fontSize: "1.25rem" }}>{feature.title}</h3>
                                        <p style={{ color: "#fff", fontSize: "1.125rem", fontWeight: "500" }}>{feature.content}</p>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>

            <Image
                src="/images/decor/decor-01.png"
                alt=""
                width={50} // Specify width
                height={50} // Specify height
            />
            <Image
                src="/images/decor/decor-02.png"
                alt=""
                width={50} // Specify width
                height={50} // Specify height
            />
            <Image
                src="/images/decor/decor-03.png"
                alt=""
                width={50} // Specify width
                height={50} // Specify height
            />
            <Image
                src="/images/decor/decor-04.png"
                alt=""
                width={50} // Specify width
                height={50} // Specify height
            />
        </section>
    );
};

export default Features;
