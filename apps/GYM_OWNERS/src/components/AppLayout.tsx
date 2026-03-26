import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 mk:ml-[270px]">
        {children}
      </div>

      {/* Mobile Footer */}
      <Footer />
    </div>
  );
}