// Language selection uses browser preferences on the client; no IP/country cookie is needed.
export async function onRequest(context) {
  return context.next();
}
