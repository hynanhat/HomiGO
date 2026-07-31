

const AdminDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Trang Quản Trị HomiGO</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
          <h2 className="font-bold">Quản lý tin đăng</h2>
          <p className="text-sm text-gray-500 mt-2">Duyệt/từ chối tin đăng</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
          <h2 className="font-bold">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500 mt-2">Khóa/mở khóa tài khoản</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500">
          <h2 className="font-bold">Quản lý danh mục</h2>
          <p className="text-sm text-gray-500 mt-2">Thêm, sửa, xóa danh mục</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-500">
          <h2 className="font-bold">Quản lý dự án & địa điểm</h2>
          <p className="text-sm text-gray-500 mt-2">Thiết lập dữ liệu master</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
