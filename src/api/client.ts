import { API_BASE_URL } from '@/core/config'
import { createAppError } from '@/core/errors'

interface RequestJsonOptions {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  signal?: AbortSignal
}

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function requestJson<T>(
  path: string,
  options: RequestJsonOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    body: options.body,
    headers: options.headers,
    signal: options.signal,
  })
  const responseBody = await readResponseBody(response)

  if (!response.ok) {
    throw createAppError({
      status: response.status,
      detail: responseBody,
    })
  }

  return responseBody as T
}

export function buildAbsoluteUrl(path: string): string {
  return buildUrl(path)
}
