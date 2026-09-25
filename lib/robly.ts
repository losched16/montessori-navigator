// Server-only Robly contact sync.
//
// Pushes parent subscribers into a dedicated Robly sub list so the team can run
// parent email marketing from Robly. Uses Robly's V1 API (api_id + api_key).
// Fire-and-forget: never throws, and no-ops silently if the Robly env vars
// aren't configured, so it can't break a signup or page load.
//
// Flow: try to add an existing contact to the list first; if Robly doesn't know
// the email yet, create the contact subscribed to the list.

const ROBLY_API = 'https://api.robly.com/api/v1'

async function roblyPost(path: string, params: URLSearchParams): Promise<boolean> {
  const res = await fetch(`${ROBLY_API}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: params.toString(),
  })
  if (!res.ok) return false
  const json = await res.json().catch(() => null)
  return json?.successful === true
}

export async function syncParentToRobly(params: {
  email: string
  name?: string | null
}): Promise<boolean> {
  const apiId = process.env.ROBLY_API_ID
  const apiKey = process.env.ROBLY_API_KEY
  const listId = process.env.ROBLY_PARENT_LIST_ID
  if (!apiId || !apiKey || !listId || !params.email) return false

  const auth = { api_id: apiId, api_key: apiKey }

  try {
    const added = await roblyPost(
      'contacts/add_sub_list',
      new URLSearchParams({ ...auth, email: params.email, sub_list_id: listId }),
    )
    if (added) return true

    const [fname, ...rest] = (params.name || '').trim().split(/\s+/)
    const signup = new URLSearchParams({ ...auth, email: params.email, include_autoresponder: 'true' })
    if (fname) signup.set('fname', fname)
    if (rest.length) signup.set('lname', rest.join(' '))
    signup.append('sub_lists[]', listId)
    return await roblyPost('sign_up/generate', signup)
  } catch {
    return false
  }
}
