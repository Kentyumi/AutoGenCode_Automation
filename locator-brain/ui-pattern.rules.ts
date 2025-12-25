import { PatternRule, UIPattern } from './ui-pattern.types'

export const UI_PATTERN_RULES: Record<UIPattern, PatternRule[]> = {
  'menu-toggle': [
    {
      ariaLabel: /menu|navigation/i,
      role: 'button'
    },
    {
      hasSvg: true,
      classLike: /menu|nav|drawer/i,
      container: 'header'
    }
  ],

  'kebab-menu': [
    {
      ariaLabel: /more|options/i
    },
    {
      hasSvg: true,
      svgPathCount: 3
    }
  ],

  'dropdown-trigger': [
    {
      role: 'button',
      ariaLabel: /account|user|profile/i
    }
  ],

  'modal-close': [
    {
      ariaLabel: /close|dismiss/i
    }
  ],

  tab: [
    {
      role: 'tab'
    }
  ]
}
