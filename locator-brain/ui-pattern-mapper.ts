import { UIPattern } from './ui-pattern.types'

export function mapLogicalNameToPattern(
  logicalName: string
): UIPattern | null {

  if (/hamburger|menu|nav/i.test(logicalName)) {
    return 'menu-toggle'
  }

  if (/more|kebab|options/i.test(logicalName)) {
    return 'kebab-menu'
  }

  if (/user|profile|account/i.test(logicalName)) {
    return 'dropdown-trigger'
  }

  if (/close|dismiss/i.test(logicalName)) {
    return 'modal-close'
  }

  if (/tab/i.test(logicalName)) {
    return 'tab'
  }

  return null
}
