export interface User {
    _id: string; // Sử dụng _id từ API
    username: string; // Tên người dùng
    name: string; // Tên đầy đủ
    email: string; // Địa chỉ email
    role: string; // Vai trò của người dùng
    avatar?: string; // Hình đại diện (có thể không có)
    gender?: string; // Giới tính (có thể không có)
    ssn?: number; // Số an sinh xã hội (có thể không có)
    phone_number?: string; // Số điện thoại (có thể không có)
    createdAt: string; // Ngày tạo
    updatedAt: string; // Ngày cập nhật
    accessToken: string; // Access token
    refreshToken: string; // Refresh token
    userId: string; // Add userId property
}
