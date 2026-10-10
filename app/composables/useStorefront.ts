interface Paged<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useStorefront() {
  const { api } = useApi()

  async function fetchAll<T>(path: string, query: Record<string, string | number> = {}): Promise<Paged<T>> {
    const first = await api<Paged<T>>(path, { query: { ...query, page: 1, per_page: 50 } })
    const items = [...(first.data ?? [])]
    const lastPage = first.meta?.last_page ?? 1

    if (lastPage > 1) {
      const pages = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, index) =>
          api<Paged<T>>(path, { query: { ...query, page: index + 2, per_page: 50 } }),
        ),
      )
      for (const page of pages) items.push(...(page.data ?? []))
    }

    return { data: items, meta: first.meta }
  }

  return { fetchAll }
}
