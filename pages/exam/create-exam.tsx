import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import NavBarHome from "../../components/home/navbar-home";
import CreateExamFrom from "../../components/exam-main/create-exam";

const CreateExam = () => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  return (
    <div>
      <NavBarHome loadingBarRef={loadingBarRef} />
      <CreateExamFrom />
    </div>
  );
};

export default CreateExam;
