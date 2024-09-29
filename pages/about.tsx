import React from "react";
import Head from "next/head";

const AboutPage: React.FC = () => {
    return (
        <div>
            <Head>
                <title>About Us</title>
                <meta name="description" content="Learn more about us." />
            </Head>
            <h1>About Us</h1>
            <p>This is the about page of our application.</p>
        </div>
    );
};

export default AboutPage;
