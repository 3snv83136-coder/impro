import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Palette,
  Sparkles,
  SlidersHorizontal,
  Tag,
} from "lucide-react";

interface ProfData {
  id: string;
  photo: string | null;
  name: string;
  bio: string;
  specialties: string[];
  color: string;
  attributes: { id: string; label: string; value: number }[];
}

interface ProfEditorProps {
  prof: ProfData | null;
  onSave: (prof: ProfData) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  "#c8440a",
  "#b8860b",
  "#2d6a4f",
  "#1d4e89",
  "#7b2d8b",
  "#c2185b",
  "#00838f",
  "#4e342e",
];

const SPECIALTY_SUGGESTIONS = [
  "Écoute active",
  "Jeu corporel",
  "Chant",
  "Mime",
  "Narration",
  "Match d'impro",
  "Personnages",
  "Direction de jeu",
];

const ATTRIBUTE_SUGGESTIONS = [
  "Présence scénique",
  "Écoute",
  "Lâcher-prise",
  "Réactivité",
  "Pédagogie",
  "Créativité",
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function emptyProf(): ProfData {
  return {
    id: generateId(),
    photo: null,
    name: "",
    bio: "",
    specialties: [],
    color: PRESET_COLORS[0],
    attributes: ATTRIBUTE_SUGGESTIONS.slice(0, 4).map((label) => ({
      id: generateId(),
      label,
      value: 5,
    })),
  };
}

export default function ProfEditor({ prof, onSave, onCancel }: ProfEditorProps) {
  const [data, setData] = useState<ProfData>(prof ? { ...prof } : emptyProf());
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const specialtyInputRef = useRef<HTMLInputElement>(null);

  const isNew = prof === null;

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setData((d) => ({ ...d, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addSpecialty = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !data.specialties.includes(trimmed)) {
      setData((d) => ({ ...d, specialties: [...d.specialties, trimmed] }));
    }
    setSpecialtyInput("");
    setShowSuggestions(false);
  };

  const removeSpecialty = (tag: string) => {
    setData((d) => ({
      ...d,
      specialties: d.specialties.filter((s) => s !== tag),
    }));
  };

  const handleSpecialtyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (specialtyInput.trim()) {
        addSpecialty(specialtyInput);
      }
    }
  };

  const addAttribute = (label: string) => {
    setData((d) => ({
      ...d,
      attributes: [...d.attributes, { id: generateId(), label, value: 5 }],
    }));
  };

  const removeAttribute = (id: string) => {
    setData((d) => ({
      ...d,
      attributes: d.attributes.filter((a) => a.id !== id),
    }));
  };

  const updateAttributeValue = (id: string, value: number) => {
    setData((d) => ({
      ...d,
      attributes: d.attributes.map((a) => (a.id === id ? { ...a, value } : a)),
    }));
  };

  const updateAttributeLabel = (id: string, label: string) => {
    setData((d) => ({
      ...d,
      attributes: d.attributes.map((a) => (a.id === id ? { ...a, label } : a)),
    }));
  };

  const filteredSuggestions = SPECIALTY_SUGGESTIONS.filter(
    (s) =>
      !data.specialties.includes(s) &&
      s.toLowerCase().includes(specialtyInput.toLowerCase())
  );

  const unusedAttributeSuggestions = ATTRIBUTE_SUGGESTIONS.filter(
    (s) => !data.attributes.some((a) => a.label === s)
  );

  const handleSave = () => {
    if (!data.name.trim()) return;
    onSave(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto bg-parchment rounded-sm shadow-xl border border-gold/20 overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ backgroundColor: data.color + "18" }}
      >
        <Sparkles className="w-5 h-5" style={{ color: data.color }} />
        <h2 className="font-serif text-xl text-ink">
          {isNew ? "Nouveau Professeur" : `Modifier ${data.name}`}
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Photo + Name row */}
        <div className="flex items-start gap-6">
          {/* Photo upload */}
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full overflow-hidden border-4 group cursor-pointer transition-all hover:shadow-lg"
              style={{ borderColor: data.color }}
            >
              {data.photo ? (
                <img
                  src={data.photo}
                  alt="Photo du prof"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-1"
                  style={{ backgroundColor: data.color + "20" }}
                >
                  <Camera className="w-6 h-6 text-muted" />
                  <span className="text-[0.6rem] font-mono uppercase text-muted">
                    Photo
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            {data.photo && (
              <button
                type="button"
                onClick={() => setData((d) => ({ ...d, photo: null }))}
                className="mt-1 text-[0.6rem] font-mono text-accent hover:underline"
              >
                Supprimer
              </button>
            )}
            <div className="mt-2 w-28">
              <input
                type="text"
                placeholder="ou URL photo..."
                className="w-full text-[0.6rem] font-mono bg-cream border border-warm rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-gold text-muted"
                onBlur={(e) => {
                  const url = e.target.value.trim();
                  if (url) {
                    setData((d) => ({ ...d, photo: url }));
                    e.target.value = '';
                  }
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = (e.target as HTMLInputElement).value.trim();
                    if (url) {
                      setData((d) => ({ ...d, photo: url }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Name */}
          <div className="flex-1 space-y-2">
            <label className="font-mono text-[0.65rem] uppercase tracking-widest text-muted flex items-center gap-1">
              Nom du professeur
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              placeholder="Entrez le nom..."
              className="w-full text-2xl font-serif text-ink bg-transparent border-b-2 border-warm focus:border-gold outline-none pb-2 placeholder:text-muted/40 transition-colors"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            Biographie
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
            placeholder="Racontez l'histoire de ce professeur, son parcours, sa passion pour l'impro..."
            rows={4}
            className="w-full bg-warm/30 border border-warm rounded-xl p-4 text-sm text-ink leading-relaxed placeholder:text-muted/40 focus:border-gold focus:ring-1 focus:ring-accent/30 outline-none resize-none transition-colors"
          />
        </div>

        {/* Specialties */}
        <div className="space-y-3">
          <label className="font-mono text-[0.65rem] uppercase tracking-widest text-muted flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            Spécialités
          </label>

          {/* Tags display */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {data.specialties.map((tag) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={() => removeSpecialty(tag)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white cursor-pointer transition-all hover:brightness-110 hover:shadow-md"
                  style={{ backgroundColor: data.color }}
                >
                  {tag}
                  <X className="w-3 h-3" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Tag input */}
          <div className="relative">
            <input
              ref={specialtyInputRef}
              type="text"
              value={specialtyInput}
              onChange={(e) => {
                setSpecialtyInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleSpecialtyKeyDown}
              placeholder="Tapez une spécialité + Entrée..."
              className="w-full bg-warm/30 border border-warm rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-gold outline-none transition-colors"
            />
            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-10 top-full mt-1 left-0 right-0 bg-parchment rounded-sm shadow-lg border border-gold/20 overflow-hidden"
                >
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addSpecialty(s)}
                      className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-warm/50 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Color picker */}
        <div className="space-y-3">
          <label className="font-mono text-[0.65rem] uppercase tracking-widest text-muted flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Couleur signature
          </label>
          <div className="flex gap-3 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setData((d) => ({ ...d, color }))}
                className="w-10 h-10 rounded-full border-3 transition-all cursor-pointer hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: data.color === color ? "#2c1810" : "transparent",
                  boxShadow:
                    data.color === color
                      ? `0 0 0 3px ${color}40, 0 2px 8px ${color}60`
                      : "none",
                  transform: data.color === color ? "scale(1.15)" : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-4">
          <label className="font-mono text-[0.65rem] uppercase tracking-widest text-muted flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Attributs (radar)
          </label>

          <div className="space-y-3">
            <AnimatePresence>
              {data.attributes.map((attr) => (
                <motion.div
                  key={attr.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex items-center gap-3 bg-warm/30 rounded-xl px-4 py-3 border border-warm/60"
                >
                  <input
                    type="text"
                    value={attr.label}
                    onChange={(e) => updateAttributeLabel(attr.id, e.target.value)}
                    className="w-36 text-xs font-mono text-ink bg-transparent border-b border-dashed border-warm focus:border-gold outline-none pb-0.5"
                  />
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={attr.value}
                    onChange={(e) =>
                      updateAttributeValue(attr.id, Number(e.target.value))
                    }
                    className="flex-1 accent-accent h-2"
                    style={{ accentColor: data.color }}
                  />
                  <span
                    className="text-sm font-bold w-7 text-center font-mono"
                    style={{ color: data.color }}
                  >
                    {attr.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttribute(attr.id)}
                    className="text-muted hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick-add attribute suggestions */}
          {unusedAttributeSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-[0.6rem] font-mono text-muted uppercase self-center mr-1">
                Ajouter :
              </span>
              {unusedAttributeSuggestions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addAttribute(label)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-mono bg-warm/40 text-ink hover:bg-warm/60 transition-colors cursor-pointer border border-warm"
                >
                  <Plus className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Custom attribute */}
          <button
            type="button"
            onClick={() => addAttribute("Nouvel attribut")}
            className="flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Attribut personnalisé
          </button>
        </div>

        {/* Save / Cancel */}
        <div className="flex justify-end gap-3 pt-4 border-t border-warm">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted bg-warm/40 hover:bg-warm/60 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!data.name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: data.color }}
          >
            <Save className="w-4 h-4" />
            {isNew ? "Créer le professeur" : "Enregistrer"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
