import OperacionesLayout from "@/components/operaciones/OperacionesLayout";

export const metadata = {
  title: "Operaciones | Validación por Hoggax",
};

export default function OperacionesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperacionesLayout>{children}</OperacionesLayout>;
}
