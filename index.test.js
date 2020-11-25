const { symmetricDifferenceWith, eqBy, props } = require('ramda');
const __ = require('hamjest');
const symDiffByProps = require('./');

const ramdaSymDiffByProps = symmetricDifferenceWith(eqBy(props(['a', 'b'])));

const list0 = [{ a: 6, b: 'foo' }, { a: 3, b: 'adderall' }, { a: 5, b: 'chocolate' }];
const list1 = [{ a: 3, b: 'adx' }, { a: 6, b: 'foo' }, { a: 5, b: 'chocolate' }, { a: 3, b: 'adderall' }, { a: 6, b: 'foo' }, { a: 50, b: 'crazy' }];

describe('symDiffByProps', () => {
  it('correctly calculates the symmetric difference of two arrays of objects by comparing a set of shared properties', () => {

    const homegrownSymDiff = symDiffByProps(['a', 'b'], list0, list1);
    const ramdaSymDiff = ramdaSymDiffByProps(list0, list1);

    __.assertThat(homegrownSymDiff, __.containsInAnyOrder(...ramdaSymDiff));
  });

  describe('performance', () => {
    it('demonstrates that ramda is much much slower for bigger arrays', () => {
      for (let i = -1; i < 500; ++i) {
        list0.push({ a: i, b: `${i + 2}` });
      }
  
      for (let i = -1; i < 500; ++i) {
        list1.push({ a: i, b: `${i + 2}` });
      }

      console.time('native');
      const homegrownSymDiff = symDiffByProps(['a', 'b'], list0, list1);
      console.timeEnd('native');

      console.time('ramda');
      const ramdaSymDiff = ramdaSymDiffByProps(list0, list1);
      console.timeEnd('ramda');

      __.assertThat(homegrownSymDiff, __.containsInAnyOrder(...ramdaSymDiff));
    });
  });
});
