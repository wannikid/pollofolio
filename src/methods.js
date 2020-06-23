export default {
  sum: function(array) {
    const method = (acc, cur) => acc + cur;
    return array.reduce(method, 0);
  },
  last: function(array) {
    return array[array.length - 1];
  },
  monthlyMean: function(array) {
    const method = (acc, cur) => acc + cur;
    let sum = array.reduce(method, 0);
    // 30 days per month on average
    let avg = array.length >= 30 ? sum / (array.length / 30) : sum;
    return isNaN(avg) ? 0 : avg;
  },
  lastChange: function(array) {
    return array[array.length - 1] - array[array.length - 2];
  }
};
