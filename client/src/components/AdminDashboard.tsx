import { useState, useEffect } from 'react';
import { registerParkingEntry, registerParkingExit, getCurrentParkedUsers, getAllPayments } from '../api';

interface Parking {
  id: string;
  user_id: string;
  car_number: string;
  slot_number: number;
  entry_time: string;
  exit_time: string | null;
}

interface ParkingWithUser extends Parking {
  User: {
    username: string;
    plate_number: string | null;
  };
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
  User: {
    username: string;
  };
}

interface AdminDashboardProps {
  token: string | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [carNumberEntry, setCarNumberEntry] = useState('');
  const [carNumberExit, setCarNumberExit] = useState('');
  const [parkedUsers, setParkedUsers] = useState<ParkingWithUser[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No authentication token provided');
      return;
    }
    const fetchData = async () => {
      try {
        const [parked, payments] = await Promise.all([
          getCurrentParkedUsers(token),
          getAllPayments(token),
        ]);
        setParkedUsers(parked);
        setAllPayments(payments);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, [token]);

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('No authentication token provided');
      return;
    }
    try {
      const data = await registerParkingEntry(token, carNumberEntry);
      // Note: User data isn't returned by /api/parking/entry, so we use a placeholder
      setParkedUsers([...parkedUsers, { ...data, User: { username: 'Unknown', plate_number: carNumberEntry } }]);
      setCarNumberEntry('');
      alert(`Parking entry registered! Slot: ${data.slot_number}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register entry');
    }
  };

  const handleExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('No authentication token provided');
      return;
    }
    try {
      const data = await registerParkingExit(token, carNumberExit);
      setParkedUsers(parkedUsers.filter((p) => p.car_number !== carNumberExit));
      setAllPayments([...allPayments, {
        id: data.id, // Use parking ID as a temporary ID
        user_id: data.user_id,
        parking_id: data.id,
        amount: data.amount,
        status: 'pending',
        payment_time: null,
        Parking: { car_number: data.car_number, slot_number: data.slot_number },
        User: { username: 'Unknown' },
      }]);
      setCarNumberExit('');
      alert(`Parking exit registered! Amount: ${data.amount} RWF`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register exit');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Register Parking Entry</h3>
        <form onSubmit={handleEntry} className="flex gap-2">
          <input
            type="text"
            value={carNumberEntry}
            onChange={(e) => setCarNumberEntry(e.target.value)}
            placeholder="Car Number"
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Register Entry
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Register Parking Exit</h3>
        <form onSubmit={handleExit} className="flex gap-2">
          <input
            type="text"
            value={carNumberExit}
            onChange={(e) => setCarNumberExit(e.target.value)}
            placeholder="Car Number"
            className="border p-2 rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Register Exit
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Currently Parked Users</h3>
        {parkedUsers.length === 0 ? (
          <p>No users currently parked</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Username</th>
                <th className="border p-2">Plate Number</th>
                <th className="border p-2">Car Number</th>
                <th className="border p-2">Slot</th>
                <th className="border p-2">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {parkedUsers.map((record) => (
                <tr key={record.id}>
                  <td className="border p-2">{record.User.username}</td>
                  <td className="border p-2">{record.User.plate_number}</td>
                  <td className="border p-2">{record.car_number}</td>
                  <td className="border p-2">{record.slot_number}</td>
                  <td className="border p-2">{new Date(record.entry_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">All Payments</h3>
        {allPayments.length === 0 ? (
          <p>No payments recorded</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Username</th>
                <th className="border p-2">Car Number</th>
                <th className="border p-2">Slot</th>
                <th className="border p-2">Amount (RWF)</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Payment Time</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border p-2">{payment.User.username}</td>
                  <td className="border p-2">{payment.Parking.car_number}</td>
                  <td className="border p-2">{payment.Parking.slot_number}</td>
                  <td className="border p-2">{payment.amount}</td>
                  <td className="border p-2">{payment.status}</td>
                  <td className="border p-2">
                    {payment.payment_time ? new Date(payment.payment_time).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;