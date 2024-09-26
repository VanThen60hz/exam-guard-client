<a id="about"> </a>

# Exam Guard Client 🌟

A platform that aims to stop cheating in online exams with the power of AI and ML.

This is the web version of my [ExamGuard App](https://github.com/prathamesh-mutkure/anti-cheat-exam-app) with enhanced features, UI/UX, and performance.

<p  align="center">

<img  src="https://i.ibb.co/Kyp6rKG/logo-text.png"/>

</p>

-   <a href="#!" target="_blank">Demo</a>

-   [About Project](#about)

-   [Features and Interfaces](#features)

    -   [Home](#home)
    -   [Login and Authentication](#auth)
    -   [Dashboard](#dashboard)
    -   [Exam](#exam)
    -   [Face Detection](#face)

-   [Tech Stack](#tech-stack)

    -   [Front-end](#frontend)
    -   [Backend](#backend)
    -   [Mobile App](#mobile)
    -   [Other Tools](#other)

-   [Important Points](#imp-points)
-   [Getting Started Instructions](#instructions)
-   [Test Cases](#test-cases)
-   [Links](#links)
-   [Contact](#contact)

    <a id="features"> </a>

## Features and Interfaces

I'm currently making some final changes to the web app and will soon update this document with the latest demo images of the web app.

1. Home Page <a id="home"> </a>

    - [Landing Page](https://example.com/) which lists all the features of the app

    <img width="1835" alt="Screenshot 2022-11-13 at 4 36 11 PM" src="https://i.ibb.co/mGKZfn1/Screenshot-2024-09-26-230312.png">

    <img width="1835" alt="Screenshot 2022-11-13 at 6 04 36 PM" src="https://i.ibb.co/Q650BNV/Screenshot-2024-09-26-230450.png">

2. Login Page (Authentication) <a id="auth"> </a>

    - Fast and secure authentication
    - JWT tokens used to persist the authentication state

3. Dashboard <a id="dashboard"> </a>

    - Shows bried information about all the exams assigned to the user

    - The user can start an exam only at the correct timeslot

4. Exam Page <a id="exam"> </a>

    - Simple and minimalistic exam page where the user can answer MCQ-based questions

    - The user can view and track their progress>

5. AI-powered face motion detector <a id="face"> </a>

    - I've used Google's Mediapipe library to track the motion of the user's face

    - This app can check if a user is trying to cheat by monitoring the co-ordinates of their face

    - The face detection is performed on-device without sending anything to the backend

    - Thus, Face detection is fast and real-time

## Tech stack

<a id="frontend"> </a>

#### Frontend

-   Next.js (React)

-   TypeScript
-   Redux

<a id="backend"> </a>

#### Backend

-   Nodejs

-   Express

-   MongoDB

    <a id="mobile"> </a>

#### Mobile App

-   Flutter
-   MobX + Provider

<a id="other"> </a>

#### Other Tools

-   Google Mediapipe (Web)
-   Google on-device ML-Kit (Mobile)

<a id="imp-points"> </a>

## Points to remember while testing the app

1. First setup the backend by following the instructions in this [repository](https://github.com/prathamesh-mutkure/anti-cheat-app-backend)

2. The test username and password are given in the login form

3. Allow **permissions** for camera and mic when asked

4. Make sure the `BACKEND_URL` is appended with `/api`

<a id="instructions"> </a>

## Instructions

1. Clone the project

2. Install all the packages

    - `npm install`

3. Create a `.env` file and set the following variables or as shown in the `.env.example` file

    - `BACKEND_URL`

    - `AUTH_SECRET`

4. Run the app

    - `npm run dev`

5. Open `http://localhost:3000` with your browser to see the app

## Test Cases <a  id="test-cases"> </a>

To make sure your changes don't break anything, run `npm run dev` to run unit tests.

<a id="links"> </a>

## Useful Links

<a id="contact"> </a>

## Need help?
