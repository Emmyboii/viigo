
interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen px-5 py-4 relative max-w-[1900px] mx-auto">
      {children}
    </div>
  );
}
