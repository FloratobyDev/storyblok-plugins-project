export type MenuItem = {
  name: string
  price: number
  description?: string
}

export type MenuSection = {
  section: string
  items: MenuItem[]
}

export type MenuResponse = {
  menu: MenuSection[]
}
