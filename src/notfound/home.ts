/** Where the site's home page is: the repo folder on GitHub Pages, the root anywhere else. */
export function homeHref(loc: Pick<Location, 'hostname' | 'pathname'> = window.location): string {
  if (loc.hostname.endsWith('github.io')) {
    const first = loc.pathname.split('/').filter(Boolean)[0]
    return first ? `/${first}/` : '/'
  }
  return '/'
}
