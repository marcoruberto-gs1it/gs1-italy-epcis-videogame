// Accesso ai testi di it.json: t("map.play", { id: "1-2" }).
import IT from "./it.json";

export function t(path, vars = {}) {
  const value = path.split(".").reduce((o, k) => (o == null ? o : o[k]), IT);
  if (value == null) throw new Error("Testo mancante: " + path);
  return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : value;
}
