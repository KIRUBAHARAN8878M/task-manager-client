import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice'; 

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white-700 text-dark px-6 py-4 shadow">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <div className="flex items-center space-x-4">
          {user && <span className="text-sm">Hi, {user.username || user.email}</span>}
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-100 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
