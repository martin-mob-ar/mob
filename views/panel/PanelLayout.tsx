import Header from "@/components/Header";

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Header hideSearch />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default PanelLayout;
