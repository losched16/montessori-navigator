// Server-only GoHighLevel contact sync.
//
// Upserts a contact into the Montessori Family Alliance GHL sub-account so the
// team can run segmented email marketing (parents vs schools) from GHL. Uses a
// location-scoped Private Integration Token. Fire-and-forget: never throws, and
// no-ops silently if the GHL env vars aren't configured, so it can't break a
// signup or page load.

const GHL_UPSERT_URL = 'https://services.leadconnectorhq.com/contacts/upsert'

export async function syncContactToGHL(params: {
  email: string
  name?: string | null
  tags: string[]
  companyName?: string | null
}): Promise<boolean> {
  const pit = process.env.GHL_AGENCY_PIT
  const locationId = process.env.GHL_LOCATION_ID
  if (!pit || !locationId || !params.email) return false

  const [firstName, ...rest] = (params.name || '').trim().split(/\s+/)

  try {
    const res = await fetch(GHL_UPSERT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pit}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        locationId,
        email: params.email,
        ...(firstName ? { firstName } : {}),
        ...(rest.length ? { lastName: rest.join(' ') } : {}),
        tags: [...params.tags, 'mfa-app'],
        source: 'MFA App',
        ...(params.companyName ? { companyName: params.companyName } : {}),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
