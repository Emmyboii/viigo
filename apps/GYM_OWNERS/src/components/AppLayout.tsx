import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-[270px] mk:ml-[220px]">
        {children}
      </div>

      {/* Mobile Footer */}
      <Footer />
    </div>
  );
}