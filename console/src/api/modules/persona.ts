import { request } from "../request";
import type { Persona, PersonaTemplate } from "../types";

export const personaApi = {
  listPersonas: () => request<Persona[]>("/personas"),

  getPersona: (id: string) =>
    request<Persona>(`/personas/${encodeURIComponent(id)}`),

  createPersona: (persona: Partial<Persona>) =>
    request<Persona>("/personas", {
      method: "POST",
      body: JSON.stringify(persona),
    }),

  updatePersona: (id: string, persona: Partial<Persona>) =>
    request<Persona>(`/personas/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(persona),
    }),

  deletePersona: (id: string) =>
    request<{ deleted: boolean }>(`/personas/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  listPersonaTemplates: () =>
    request<PersonaTemplate[]>("/personas/templates"),

  createPersonaFromTemplate: (templateId: string) =>
    request<Persona>(`/personas/templates/${encodeURIComponent(templateId)}`, {
      method: "POST",
    }),
};
