import { useState, useEffect } from 'react';
import { getPendingPayments, makePayment } from '../api';

interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  plate_number: string | null;
}

interface Payment {
  id: string;
  user_id: string;
  parking_id: string;
  amount: number;
  status: 'pending' | 'completed';
  payment_time: string | null;
  Parking: {
    car_number: string;
    slot_number: number;
  };
}

interface UserDashboardProps {
  token: string | null;
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ token, user }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No authentication token provided');
      return;
    }
    const fetchPayments = async () => {
      try {
        const data = await getPendingPayments(token);
        setPayments(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch payments');
      }
    };
    fetchPayments();
  }, [token]);

  const handlePayment = async (payment_id: string) => {
    if (!token) {
      setError('No authentication token provided');
      return;
    }
    try {
      await makePayment(token, payment_id);
      setPayments(payments.filter((p) => p.id !== payment_id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Dashboard - {user.username}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <h3 className="text-xl font-semibold mb-2">Pending Payments</h3>
      {payments.length === 0 ? (
        <p>No pending payments</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Car Number</th>
              <th className="border p-2">Slot</th>
              <th className="border p-2">Amount (RWF)</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="border p-2">{payment.Parking.car_number}</td>
                <td className="border p-2">{payment.Parking.slot_number}</td>
                <td className="border p-2">{payment.amount}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handlePayment(payment.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Pay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserDashboard;