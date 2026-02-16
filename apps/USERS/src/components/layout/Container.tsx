
interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen px-4 py-4">
      {children}
    </div>
  );
}
