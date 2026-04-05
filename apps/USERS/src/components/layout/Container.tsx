
interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="max-w-[1300px] mx-auto min-h-screen px-4 py-4">
      {children}
    </div>
  );
}
