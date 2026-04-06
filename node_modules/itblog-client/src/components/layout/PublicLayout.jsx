import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <Outlet />
    </div>
  );
}
