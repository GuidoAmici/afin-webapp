'use server'

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean }> {
  const apiKey = process.env.BREVO_API_KEY
  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined

  if (!apiKey || !listId) {
    console.error('BREVO_API_KEY or BREVO_LIST_ID not configured')
    return { success: false }
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    })

    return { success: res.status === 201 || res.status === 204 }
  } catch {
    return { success: false }
  }
}
