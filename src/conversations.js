export const PREFIX = 'tecnobot:conversations:v2:' + new URL('../', import.meta.url).pathname + ':';
const modes = new Set(['shortAnswer', 'easyAnswer', 'fullAnswer', 'examples', 'related']);
export function validConversation(c) {
  return c && typeof c.id === 'string' && typeof c.title === 'string' && Number.isFinite(c.updatedAt) && Array.isArray(c.messages) && c.messages.every(m => m && (
    (m.kind === 'question' && typeof m.text === 'string') ||
    (m.kind === 'answer' && typeof m.id === 'string' && modes.has(m.mode)) ||
    (m.kind === 'clarify' && Array.isArray(m.ids) && m.ids.every(id => typeof id === 'string')) || m.kind === 'unknown'
  ));
}
export function createConversationStore(storage, report = () => {}) {
  const memory = new Map();
  function get(id) {
    if (memory.has(id)) return memory.get(id);
    try {
      const raw = storage.getItem(PREFIX + id);
      if (!raw) return memory.get(id) || null;
      const c = JSON.parse(raw);
      if (!validConversation(c) || c.id !== id) { report('Hi ha una conversa malmesa que no es pot obrir.'); return null; }
      return c;
    } catch { report('No es pot llegir l’historial local.'); return memory.get(id) || null; }
  }
  function save(c) {
    if (!validConversation(c)) throw Error('Conversa no vàlida');
    try { storage.setItem(PREFIX + c.id, JSON.stringify(c)); memory.delete(c.id); return true; }
    catch { memory.set(c.id, c); report('No s’ha pogut desar al navegador. Els canvis es conservaran només mentre aquesta pestanya sigui oberta.'); return false; }
  }
  return {
    get, save,
    list() {
      const ids = new Set(memory.keys());
      try { for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k?.startsWith(PREFIX)) ids.add(k.slice(PREFIX.length)); } }
      catch { report('L’emmagatzematge local no està disponible.'); }
      return [...ids].map(get).filter(Boolean).sort((a,b) => b.updatedAt - a.updatedAt);
    },
    remove(id) { try { storage.removeItem(PREFIX + id); memory.delete(id); return true; } catch { report('No s’ha pogut eliminar la conversa desada.'); return false; } }
  };
}
