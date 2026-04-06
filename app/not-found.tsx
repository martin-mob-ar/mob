import type { Metadata } from "next";
import NotFound from "@/views/NotFound";

export const metadata: Metadata = {
  title: "Pagina no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return <NotFound />;
}
