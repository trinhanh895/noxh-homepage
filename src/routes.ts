/* Hash routes — "#/..." is a page, any other hash is a section anchor on the home page. */
export const routes = {
  home: '#top',
  projects: '#du-an',
  faq: '#cau-hoi',
  journey: '#/hanh-trinh',
  assistant: '#/tro-ly',
  profile: '#/ho-so',
  advisor: '#/tu-van',
  privacy: '#/quyen-rieng-tu',
  login: '#/dang-nhap',
  project: (slug: string) => `#/du-an/${slug}`,
}

/* "#/tro-ly?prj=x&guide=1" → { prj: 'x', guide: '1' } */
export function hashParams() {
  return new URLSearchParams(window.location.hash.split('?')[1] ?? '')
}

export function withParams(route: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
  const s = q.toString()
  return s ? `${route}?${s}` : route
}
