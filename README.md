# Sym Diff By Props
Find the symmetric difference of two arrays of objects by comparing a a set of shared properties

# Why
Because before I was using [ramda][0] like so to calculate a symmetric difference: `symmetricDifferenceWith(eqBy(props['a', b']))`. Turns out that when either one of the input lists has more then ~ 100 elements, ramda starts to get really slow when calculating the symmetric difference. I love ramda but the performance of this usage of ramda became a pain point for me recently and so I decided to roll my own with a specific focus on solving the symmetric difference between two arrays of objects by analysing a list of shared properties.

I have included some basic tests if you want to see for yourself just how much slower ramda takes for this with marignally larger arrays: Clone the repo, run `yarn` or `npm i`, then `yarn test` or `npm t`.

As a nice side benefit, this package is dependency-free. No getting tons of extra packages shoehorned in to your project just because you want to use this one.

# Usage
`npm i sym-diff-by-props` or `yarn add sym-diff-by-props` then:

```node
const symDiffByProps = require('sym-diff-by-props');


const list1 = [{ a: 6, b: 'foo' }, { a: 3, b: 'adderall' }, { a: 5, b: 'chocolate' }];

const list2 = [{ a: 3, b: 'adx' }, { a: 6, b: 'foo' }, { a: 5, b: 'chocolate' }, { a: 3, b: 'adderall' }, { a: 6, b: 'foo' }, { a: 50, b: 'crazy' }];

const symDiff = symDiffByProps(['a', 'b'], list1, list2);

console.log(symDiff); // [{a: 3, b: 'adx'}, {a: 50, b: 'crazy'}]
```

[0]: https://ramdajs.com/
