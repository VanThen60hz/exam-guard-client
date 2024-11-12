import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import NavBarHome from "../../components/home/navbar-home";
import EditExamForm from "../../components/exam-main/edit-exam";

const EditExam = () => {
  const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

  return (
    <div>
      <NavBarHome loadingBarRef={loadingBarRef} />
      <EditExamForm />
    </div>
  );
};

export default EditExam;
