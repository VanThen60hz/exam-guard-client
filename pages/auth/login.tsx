import Head from "next/head";
import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import LoginForm from "../../components/auth/login-form";

const LoginPage = () => {
    const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

    return (
        <div>
            <Head>
                <title>ExamGuard App Login</title>
            </Head>

            <LoadingBar color="#1665C0" ref={loadingBarRef} />
        
            <LoginForm loadingBarRef={loadingBarRef} />
        </div>
    );
};

export default LoginPage;

