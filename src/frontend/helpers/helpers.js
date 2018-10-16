export const calc_days = (sh_exp_endDate) => {
  let d = new Date()
  // d.setDate(d.getDate() + 21); // reset date for development
  const endDate = new Date(Date.parse(sh_exp_endDate))
  const months = {1:31,2:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31}
  let days_left = endDate.getDate() - d.getDate()
  if (endDate.getFullYear() === d.getFullYear()) {
    days_left += (endDate.getMonth() - d.getMonth())*months[d.getMonth()+1]
  } else if (endDate.getFullYear() > d.getFullYear()) {
    days_left += 31
  }
  return {days_left, endDate};
}
