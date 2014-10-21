# Binary search implementation with a custom comparator function.
module.exports = (arr, item, comparator) ->
  # Numeric comparator.
  comparator ?= (a, b) ->
    switch
      when a < b then -1
      when a > b then +1
      else 0

  minIndex = 0
  maxIndex = arr.length - 1
  
  while minIndex <= maxIndex
    index = (minIndex + maxIndex) / 2 | 0
    existing = arr[index]
    
    res = comparator existing, item
    switch
      when result < 0 then minIndex = index + 1
      when result > 0 then maxIndex = index - 1
      else return index

  -1