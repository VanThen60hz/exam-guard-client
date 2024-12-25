import { useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import NavBarHome from "../../components/home/navbar-home";
import HistoryCheatingPage from "../../components/exam-main/history-cheating";

const HistoryCheating = () => {
    const loadingBarRef: React.Ref<LoadingBarRef> = useRef(null);

    return (
        <div>
            <NavBarHome loadingBarRef={loadingBarRef} />
            <HistoryCheatingPage />
        </div>
    );
};

export default HistoryCheating;
