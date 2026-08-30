import { Outlet } from 'react-router-dom';
import { Assistant } from './Assistant';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Main Viewport Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Floating AI Sahayak Assistant Widget */}
      <Assistant />
    </div>
  );
}
