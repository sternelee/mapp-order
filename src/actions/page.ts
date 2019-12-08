export const set = (val: object) => {
  return {
    type: 'SET',
    val
  }
}