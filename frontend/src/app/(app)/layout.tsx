import '@/app/globals.css';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Fixed sidebar */}
      <div className="w-56 border-r border-slate-100 bg-white flex flex-col flex-shrink-0 shadow-sm">
        <Sidebar />
      </div>
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
