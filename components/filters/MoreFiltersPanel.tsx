import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface MoreFiltersPanelProps {
  open: boolean;
  onClose: () => void;
}

const MoreFiltersPanel = ({ open, onClose }: MoreFiltersPanelProps) => {
  const [priceType, setPriceType] = useState<"total" | "alquiler">("total");

  if (!open) return null;

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="py-4 border-b border-border">
      <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );

  const OptionGroup = ({ options, type = "checkbox" }: { options: string[]; type?: "checkbox" | "radio" }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:border-primary/30 cursor-pointer text-sm transition-colors"
        >
          <Checkbox className="h-4 w-4" />
          {option}
        </label>
      ))}
    </div>
  );

  const NumberOptions = ({ options }: { options: string[] }) => (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 text-sm font-medium transition-colors"
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display text-lg font-bold">Más filtros</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Tipo de operación */}
            <FilterSection title="Tipo de operación">
              <OptionGroup options={["Alquilar", "Comprar"]} />
            </FilterSection>

            {/* Valor */}
            <FilterSection title="Valor">
              <div className="space-y-4">
                <div className="flex rounded-full border border-border p-1 w-fit">
                  <button
                    onClick={() => setPriceType("total")}
                    className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors ${
                      priceType === "total"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    Valor total
                  </button>
                  <button
                    onClick={() => setPriceType("alquiler")}
                    className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors ${
                      priceType === "alquiler"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    Alquiler
                  </button>
                </div>
                <div className="flex gap-3">
                  <Input placeholder="Mínimo ($)" className="rounded-xl" />
                  <Input placeholder="Máximo ($)" className="rounded-xl" />
                </div>
              </div>
            </FilterSection>

            {/* Tipos de inmueble */}
            <FilterSection title="Tipos de inmueble">
              <OptionGroup options={["Departamento", "Casa", "Casa en condominio", "Monoambiente / Studio"]} />
            </FilterSection>

            {/* Ambientes */}
            <FilterSection title="Ambientes">
              <NumberOptions options={["1+", "2+", "3+", "4+"]} />
            </FilterSection>

            {/* Cocheras */}
            <FilterSection title="Cocheras">
              <NumberOptions options={["Indistinto", "1+", "2+", "3+"]} />
            </FilterSection>

            {/* Baños */}
            <FilterSection title="Baños">
              <NumberOptions options={["1+", "2+", "3+", "4+"]} />
            </FilterSection>

            {/* Superficie */}
            <FilterSection title="Superficie">
              <div className="flex gap-3">
                <Input placeholder="Mínima (m²)" className="rounded-xl" />
                <Input placeholder="Máxima (m²)" className="rounded-xl" />
              </div>
            </FilterSection>

            {/* Amoblado */}
            <FilterSection title="Amoblado">
              <NumberOptions options={["Indistinto", "Sí", "No"]} />
            </FilterSection>

            {/* Acepta mascotas */}
            <FilterSection title="Acepta mascotas">
              <NumberOptions options={["Indistinto", "Sí", "No"]} />
            </FilterSection>

            {/* Cerca del metro */}
            <FilterSection title="Cerca del metro">
              <NumberOptions options={["Indistinto", "Sí", "No"]} />
            </FilterSection>

            {/* Disponibilidad */}
            <FilterSection title="Disponibilidad">
              <NumberOptions options={["Indistinto", "Inmediata", "Próximamente"]} />
            </FilterSection>

            {/* Amenities del edificio */}
            <FilterSection title="Amenities del edificio">
              <OptionGroup options={[
                "Gimnasio", "Área verde", "Salón de juegos infantiles", "Parrilla",
                "Ascensor", "Lavandería", "Piscina", "Playground",
                "Portería 24hs", "Cancha deportiva", "Salón de fiestas",
                "Salón de juegos", "Sauna"
              ]} />
            </FilterSection>

            {/* Comodidades */}
            <FilterSection title="Comodidades">
              <OptionGroup options={[
                "Aire acondicionado", "Bañera", "Parrilla", "Vestidor",
                "Jardín / Área privada", "Piscina privada", "Televisión",
                "Utensilios de cocina", "Ventilador de techo"
              ]} />
            </FilterSection>

            {/* Mobiliario */}
            <FilterSection title="Mobiliario">
              <OptionGroup options={[
                "Muebles de cocina", "Placard en dormitorio", "Muebles en baños",
                "Cama matrimonial", "Cama individual", "Sofá", "Mesa de comedor"
              ]} />
            </FilterSection>

            {/* Bienestar */}
            <FilterSection title="Bienestar">
              <OptionGroup options={[
                "Ventanales grandes", "Calle tranquila", "Sol de mañana",
                "Sol de tarde", "Vista despejada"
              ]} />
            </FilterSection>

            {/* Electrodomésticos */}
            <FilterSection title="Electrodomésticos">
              <OptionGroup options={[
                "Cocina", "Anafe", "Heladera", "Lavarropas", "Microondas"
              ]} />
            </FilterSection>

            {/* Ambientes especiales */}
            <FilterSection title="Ambientes especiales">
              <OptionGroup options={[
                "Lavadero", "Cocina americana", "Home-office",
                "Jardín", "Patio", "Balcón"
              ]} />
            </FilterSection>

            {/* Accesibilidad */}
            <FilterSection title="Accesibilidad">
              <OptionGroup options={[
                "Baño adaptado", "Pasamanos", "Piso táctil",
                "Rampas de acceso", "Estacionamiento accesible"
              ]} />
            </FilterSection>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1 rounded-full">
            Limpiar
          </Button>
          <Button onClick={onClose} className="flex-1 rounded-full">
            Ver resultados
          </Button>
        </div>
      </div>
    </>
  );
};

export default MoreFiltersPanel;
