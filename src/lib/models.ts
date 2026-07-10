import type { ModelId } from "@/types/showcase";

export interface ModelIdentity {
  id: ModelId;
  label: string;
  code: string;
  accent: string;
  description: string;
  thesis: string;
}

export const models: Record<ModelId, ModelIdentity> = {
  sol: {
    id: "sol",
    label: "Sol",
    code: "S-01",
    accent: "#ffb45c",
    description: "High-energy generative studies with an instinct for dimensional systems.",
    thesis: "Radiant, kinetic, spatial"
  },
  terra: {
    id: "terra",
    label: "Terra",
    code: "T-02",
    accent: "#7fc8a3",
    description: "A broad field study in interaction, atmosphere, sound, and simulated worlds.",
    thesis: "Grounded, adaptive, prolific"
  },
  luna: {
    id: "luna",
    label: "Luna",
    code: "L-03",
    accent: "#a9bad1",
    description: "A reserved chamber awaiting its first computational specimens.",
    thesis: "Reflective, quiet, emergent"
  }
};

export function isModelId(value: string): value is ModelId {
  return value === "sol" || value === "terra" || value === "luna";
}
