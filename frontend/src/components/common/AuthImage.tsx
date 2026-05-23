import { useEffect, useState } from 'react'

export function AuthImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let objectUrl = ''
    const controller = new AbortController()

    const token = localStorage.getItem('AegisAuthToken')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(src, { headers, signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (mounted) setBlobUrl(objectUrl)
      })
      .catch(() => {
        if (mounted) setBlobUrl(null)
      })

    return () => {
      mounted = false
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  return <img src={blobUrl ?? ''} alt={alt ?? ''} className={className} />
}
