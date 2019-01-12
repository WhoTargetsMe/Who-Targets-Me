// pulling userCount for this country
export const getUserCount = (input) => {
  const gaps = [100, 250, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000]
  const gapslen = gaps.length;
  let userCount = input;
  let nextUserCount = gaps[gapslen - 1];
  if (!userCount || userCount < gaps[0]) { userCount = 101; } // if userCount is not available, fall back to 100

  if (userCount > gaps[gapslen - 1]) {
    userCount = gaps[gapslen - 1];
    nextUserCount = gaps[gapslen - 1] + 5000;
  }
  else {
    for (let i = gapslen - 1; i > -1 ; i--) {
      if (userCount > gaps[i]) {
        userCount = gaps[i];
        nextUserCount = gaps[i+1];
        break;
      }
    }
  }
  return {userCount, nextUserCount}
}
