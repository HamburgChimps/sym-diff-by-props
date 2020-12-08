// symDiffByProps helper functions
const calcElIdx = (props) => (element) => {
  let idx = '';

  for (let i = 0; i < props.length; ++i) {
    idx = `${idx}${element[props[i]]}`;
  }

  return idx;
};

const addToSeen = (seen) => (listIdx, elIdx) => {
  if (!seen[elIdx]) {
    seen[elIdx] = [false, false];
  }

  if (!seen[elIdx][listIdx]) {
    seen[elIdx][listIdx] = true;
  }
};

const calcDiffies = (diffies) => (seen) => (inserted) => (elIdx, el) => {
  // inserted is an object where the key is the element index (see line 144) and the value
  // is the array index / location in the symmetric difference array
  // If we are attempting to add an element that already exists
  // in the symmetric difference array and has been seen in both lists,
  // then not only do we not insert it again but we have to remove the existing element
  // in the symmetric difference array because its no longer a symmetric difference.
  const insertedIdx = inserted[elIdx];
  if ((insertedIdx || insertedIdx === 0) && seen[elIdx].every(s => !!s)) {
    diffies[insertedIdx] = null;
  }

  // If we have never seen this element, then it is indeed (for now), a symmetric difference
  // and we add it to the symmetric differences array as well as keep track of its index
  // in the array in the insertions object.
  if (!seen[elIdx]) {
    inserted[elIdx] = diffies.push(el) - 1;
  }
};

// calculate the symmetric difference of two lists of objects by comparing
// specific property values.
// Or in symbol form: (list1 U list2) - (list1 n list2)
const symDiffByProps = (props, list1, list2) => {
  const symDiffies = [];
  const seen = {};
  const inserted = {};
  const addSeenIdx = addToSeen(seen);
  const calcIdxForProps = calcElIdx(props);
  const addToDiffies = calcDiffies(symDiffies)(seen)(inserted);

  // First, a few checks to make sure we don't try and do unneccesary work
  if (!props.length) {
    return symDiffies;
  }

  if (!list1.length && list2.length) {
    for (let i = 0; i < list2.length; ++i) {
      const el = list2[i];
      const idx = calcIdxForProps(el);

      addToDiffies(idx, el);

      addSeenIdx(1, idx);
    }

    return symDiffies.filter(d => !!d);
  }

  if (list1.length && !list2.length) {
    for (let i = 0; i < list1.length; ++i) {
      const el = list1[i];
      const idx = calcIdxForProps(el);

      addToDiffies(idx, el);

      addSeenIdx(0, idx);
    }

    return symDiffies.filter(d => !!d);
  }

  if (!list1.length && !list2.length) {
    return symDiffies;
  }

  // Then, we sort both input lists elements from "smallest" to "largest"
  // "Smallest" and "largest" are in quotes here because we are dealing with javascript
  // of course and those terms dont always mean what you think they mean unless you are
  // comparing two numbers. But the good thing is javascript will always give you consistent
  // results for this comparison so the arrays will still be sorted consistently.

  // Doing so allows us to iterate through both lists simultaneously, comparing
  // elements "side-by-side" if you will, and therein lies the main optimization of this
  // symmetric difference function. This function was written by me, but I got the idea of
  // sorting the inputs and then iterating through them simultaneously while researching
  // symmetric difference performance improvements.
  //
  // Note: By spreading the lists and packing them in new arrays we avoid modifiying
  // the input lists themselves
  const [sortedList1, sortedList2] = [[...list1], [...list2]].map((l) => {
    return l.sort((e1, e2) => {
      let orderIndicator = 0;
      for (let i = 0; i < props.length; ++i) {
        if (e1[props[i]] < e2[props[i]]) {
          orderIndicator = -1;
          break;
        }

        if (e2[props[i]] < e1[props[i]]) {
          orderIndicator = 1;
          break;
        }
      }

      return orderIndicator;
    });
  });

  let i = 0;
  let j = 0;

  const l1L = sortedList1.length;
  const l2L = sortedList2.length;

  const list1Idx = 0;
  const list2Idx = 1;

  let l1Diffl2;
  let l2Diffl1;

  // Now we start actually calculating the symmetric difference.
  // We loop through both lists simultaneously, comparing the property
  // values for the current element in the first list to the property values
  // in the second list.
  while (i < l1L && j < l2L) {
    l1Diffl2 = false;
    l2Diffl1 = false;

    const elLi1 = sortedList1[i];
    const elLi2 = sortedList2[j];

    // The "index" of an element in this context is the combined values (as as string)
    // of the properties being compared.
    const elIdxs = [calcIdxForProps(elLi1), calcIdxForProps(elLi2)];

    const [elLi1Idx, elLi2Idx] = elIdxs;

    for (let n = 0; n < props.length; ++n) {
      if (elLi1[props[n]] < elLi2[props[n]]) {
        l1Diffl2 = true;
        break;
      }
      if (elLi2[props[n]] < elLi1[props[n]]) {
        l2Diffl1 = true;
        break;
      }
    }

    // If the element in list one is "less-than" (in javascript terms) and therefore
    // "differs" from the element in list two, we call the addToDiffies function.
    // This function is responsible for the final checks to determine if the element
    // is indeed a symmetric difference or not. We also mark the element as "seen" in list one so
    // that if the element appears later in the other list, it will not be considered a
    // symmetric difference.
    // By incrementing the first lists index, we "move along" in the first list as
    // we no longer need to evaluate the element at index i as it as been marked
    // as a potential symmetric difference and comparing it again is redundant.
    if (l1Diffl2) {
      addToDiffies(elLi1Idx, elLi1);
      addSeenIdx(list1Idx, elLi1Idx);
      ++i;
    }

    // Do the same thing with the element in list 2 if it is "less-than" and therefore
    // differs from the element in list 1.
    if (l2Diffl1) {
      addToDiffies(elLi2Idx, elLi2);
      addSeenIdx(list2Idx, elLi2Idx);
      ++j;
    }

    // If the elements in list 1 and list 2 do not differ from each other, add both element
    // indexes to "seen" in their respective lists so that if either element is seen
    // in the other list later on, it will not be considered a symmetric difference
    // We dont need to inspect either element any longer so move along the comparision
    // in both lists.
    if (!l1Diffl2 && !l2Diffl1) {
      addSeenIdx(list1Idx, elLi1Idx);
      addSeenIdx(list2Idx, elLi2Idx);
      ++i;
      ++j;
    }
  }

  // If list 1 is bigger, mark all remaining elements as potential symmetric differences
  while (i < l1L) {
    const el = sortedList1[i];
    const idx = calcIdxForProps(el);

    addToDiffies(idx, el);

    ++i;

    addSeenIdx(list1Idx, idx);
  }

  // Same thing but with list 2
  while (j < l2L) {
    const el = sortedList2[j];
    const idx = calcIdxForProps(el);

    addToDiffies(idx, el);

    ++j;

    addSeenIdx(list2Idx, idx);
  }

  // If a potential symmetric difference was later determined to in fact not be one, it
  // gets replaced in the symmetric differences array with null, and we filter them out
  // in the final result
  return symDiffies.filter(d => !!d);
};

module.exports = symDiffByProps;
