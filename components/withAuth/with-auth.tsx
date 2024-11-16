import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const withAuth = (WrappedComponent, allowedRoles) => {
  const AuthenticatedComponent = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Kiểm tra session và vai trò người dùng
    useEffect(() => {
      if (status === "loading") return; // Chờ cho session được tải

      const userRole = session?.user?.role;

      // Kiểm tra vai trò người dùng
      if (!session || !allowedRoles.includes(userRole)) {
        router.replace("/"); // Chuyển hướng đến trang đăng nhập nếu không có quyền
      }
    }, [session, status]);

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
