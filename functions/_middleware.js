export async function onRequest(context) {
  const response = await context.next();
  const nextResponse = new Response(response.body, response);
  const country = context.request.cf?.country || '';

  if (country) {
    nextResponse.headers.append('Set-Cookie', `golynCountry=${country}; Path=/; Max-Age=86400; SameSite=Lax; Secure`);
  }

  return nextResponse;
}
