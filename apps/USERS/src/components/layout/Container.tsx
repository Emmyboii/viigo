
interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="max-w-s mx-aut bg-gray-50 min-h-screen px-4 py-4">
      {children}
    </div>
  );
}
