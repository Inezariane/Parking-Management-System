import { Link } from 'react-router-dom';

interface User {
  username: string;
  role: 'user' | 'admin';
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">Parking System</Link>
        <div>
          {user ? (
            <>
              <span className="text-white mr-4">Welcome, {user.username} ({user.role})</span>
              <button
                onClick={onLogout}
                className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white mr-4">Login</Link>
              <Link to="/register" className="text-white">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;