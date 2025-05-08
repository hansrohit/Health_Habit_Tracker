import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "./state/slice/authSlice";
import { useNavigate } from "react-router-dom";

const useAuthCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          dispatch(logout());
          navigate("/login");
        }
      } catch (error) {
        console.error("Invalid token", error);
        dispatch(logout());
        navigate("/login");
      }
    }
  }, [userToken, dispatch, navigate]);
};

export default useAuthCheck;
