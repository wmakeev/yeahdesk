let getUniqPhoneCount = 0

export const getUniqPhone = () => {
  const date = new Date()

  const uniqStr =
    String(date.getFullYear()).substring(2) +
    String(date.getMonth()).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0')

  getUniqPhoneCount++

  return (
    '+' +
    uniqStr.substring(0, 2) +
    ' (' +
    uniqStr.substring(2, 5) +
    ') ' +
    uniqStr.substring(5, 8) +
    '-' +
    uniqStr.substring(8, 10) +
    '-' +
    uniqStr.substring(10) +
    String(getUniqPhoneCount).substr(0, 1)
  )
}

console.log(getUniqPhone())
console.log(getUniqPhone())
console.log(getUniqPhone())
