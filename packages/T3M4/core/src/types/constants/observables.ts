export type OBSEVABLES = {
  storage: 'storage',
  dom: 'DOM'
}
export type Observable = OBSEVABLES[keyof OBSEVABLES]