export const library = {
  formatDate: (date: Date | string | number, format = 'YYYY-MM-DD'): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },
  
  escapeHtml: (text: string): string => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  },
  
  truncate: (text: string, length: number, suffix = '...'): string => {
    if (text.length <= length) return text
    return text.substring(0, length - suffix.length) + suffix
  },
  
  extractDomain: (url: string): string => {
    try {
      const u = new URL(url)
      return u.hostname
    } catch {
      return ''
    }
  },
  
  simplifyUrl: (url: string): string => {
    return url.replace(/\?.*$/, '').replace(/\/$/, '')
  },
  
  toMarkdownLink: (text: string, url: string): string => {
    return `[${text}](${url})`
  },
  
  toHtmlLink: (text: string, url: string): string => {
    return `<a href="${url}">${library.escapeHtml(text)}</a>`
  }
}