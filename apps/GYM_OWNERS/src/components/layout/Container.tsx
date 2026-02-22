
interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="max-w-s mx-aut min-h-screen px-4 py-4 relative">
      {children}
    </div>
  );
}
