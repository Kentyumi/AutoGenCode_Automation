export type UIPattern =
  | 'menu-toggle'
  | 'kebab-menu'
  | 'dropdown-trigger'
  | 'modal-close'
  | 'tab'

export interface PatternRule {
  role?: string
  ariaLabel?: RegExp
  classLike?: RegExp
  hasSvg?: boolean
  svgPathCount?: number
  container?: 'header' | 'nav' | 'any'
}
