import { assert, expect } from 'chai';

import { model, Schema } from 'mongoose';
import { pre } from '../../src/hooks';
import { DecoratorKeys } from '../../src/internal/constants';
import {
  InvalidTypeError,
  NoMetadataError,
  NotAllVPOPElementsError,
  NotNumberTypeError,
  NotStringTypeError,
  NoValidClass
} from '../../src/internal/errors';
import { _buildSchema } from '../../src/internal/schema';
import { assignMetadata, mergeSchemaOptions } from '../../src/internal/utils';
import { arrayProp, mapProp, prop } from '../../src/prop';
import { addModelToTypegoose, buildSchema, getModelForClass } from '../../src/typegoose';

// disable "no-unused-variable" for this file, because it tests for errors
// tslint:disable:no-unused-variable

/**
 * Function to pass into describe
 * ->Important: you need to always bind this
 * @example
 * ```
 * import { suite as ErrorTests } from './errors.test'
 * ...
 * describe('Test if the correct errors are returned', ErrorTests.bind(this));
 * ...
 * ```
 */
export function suite() {
  it('should error if type is not string and a transform is supplied [NotStringTypeError]', () => {
    try {
      class TestNSTETransform {
        @prop({ lowercase: true })
        public test: number;
      }
      getModelForClass(TestNSTETransform);
      assert.fail('Expected to throw "NotStringTypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(NotStringTypeError);
    }
  });

  it('should error if type is not string and a validate is supplied [NotStringTypeError]', () => {
    try {
      class TestNSTEValidate {
        @prop({ maxlength: 10 })
        public test: number;
      }
      getModelForClass(TestNSTEValidate);
      assert.fail('Expected to throw "NotStringTypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(NotStringTypeError);
    }
  });

  it('should error if type is not number and a validate is supplied [NotNumberTypeError]', () => {
    try {
      class TestNNTEValidate {
        @prop({ max: 10 })
        public test: string;
      }
      getModelForClass(TestNNTEValidate);
      assert.fail('Expected to throw "NotNumberTypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(NotNumberTypeError);
    }
  });

  it('should error if an non-existing(runtime) type is given [NoMetadataError]', () => {
    try {
      class TestNME {
        @prop()
        public test: undefined;
      }
      getModelForClass(TestNME);
      assert.fail('Expected to throw "InvalidPropError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(NoMetadataError);
    }
  });

  it('should error if no function for hooks is defined [TypeError]', () => {
    try {
      // ignore that it is not written right, it should be tested so
      // @ts-ignore
      @pre<Test>('')
      class TestNoFunctionHook {
        @prop()
        public test: string;
      }
      getModelForClass(TestNoFunctionHook);
      assert.fail('Expected to throw "TypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
      expect((err as TypeError).message).to.be.equals(`"TestNoFunctionHook.pre."'s function is not a function!`);
    }
  });

  it('should error if no get or set function is defined for non-virtuals [TypeError]', () => {
    try {
      class TestNoGetNoSet {
        // @ts-ignore
        @prop({ set: false })
        public test: string;
      }
      getModelForClass(TestNoGetNoSet);
      assert.fail('Expected to throw "TypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
      expect((err as TypeError).message).to.be.equals(`"TestNoGetNoSet.test" does not have a set function!`);
    }
    try {
      class TestWrongGetSetType {
        // @ts-ignore
        @prop({ set: () => undefined, get: false })
        public test: string;
      }
      getModelForClass(TestWrongGetSetType);
      assert.fail('Expected to throw "TypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
      expect((err as TypeError).message).to.be.equals(`"TestWrongGetSetType.test" does not have a get function!`);
    }
  });

  it('should error if not all needed parameters for virtual-populate are given [NotAllElementsError]', () => {
    try {
      class TestNAEEVirtualPopulate {
        @prop({ localField: true })
        public test: string;
      }
      getModelForClass(TestNAEEVirtualPopulate);
      assert.fail('Expected to throw "NotAllElementsError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(NotAllVPOPElementsError);
    }
  });

  it('should error if no valid model is supplied to "addModelToTypegoose" [TypeError]', () => {
    try {
      // @ts-ignore
      addModelToTypegoose('hello');
      assert.fail('Expected to throw "TypeError"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
    }
  });

  it('should not modify an immutable', async () => {
    class TestImmutable {
      @prop({ required: true, immutable: true })
      public someprop: Readonly<string>;
    }

    const TIModel = getModelForClass(TestImmutable);
    const doc = await TIModel.create({ someprop: 'Hello' } as TestImmutable);
    expect(doc).to.not.be.an('undefined');
    doc.someprop = 'Hello2';
    await doc.save();
    expect(doc.someprop).to.be.equals('Hello');
  });

  describe('tests for "NoValidClass"', () => {
    it('should error if no valid class is supplied to "addModelToTypegoose" [NoValidClass]', () => {
      try {
        // @ts-ignore
        addModelToTypegoose(model('hello', new Schema()), 'not class');
        assert.fail('Expected to throw "TypeError"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(NoValidClass);
      }
    });

    it('should error if no valid class is supplied to "buildSchema" [NoValidClass]', () => {
      try {
        // @ts-ignore
        buildSchema('hello');
        assert.fail('Expected to throw "NoValidClass"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(NoValidClass);
      }
    });

    it('should error if no valid class is supplied to "_buildSchema" [NoValidClass]', () => {
      try {
        // @ts-ignore
        _buildSchema('hello');
        assert.fail('Expected to throw "NoValidClass"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(NoValidClass);
      }
    });

    it('should error if no valid class is supplied to "getModelForClass" [NoValidClass]', () => {
      try {
        // @ts-ignore
        getModelForClass('hello');
        assert.fail('Expected to throw "NoValidClass"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(NoValidClass);
      }
    });
  });

  describe('tests for "InvalidTypeError"', () => {
    // test for @prop will return a "NoMetadataError", which is already tested above

    it('should error if no valid type is supplied to "@arrayProp" [InvalidTypeError]', () => {
      try {
        class TestInvalidTypeErrorAP {
          @arrayProp({ items: undefined })
          public something: undefined;
        }
        getModelForClass(TestInvalidTypeErrorAP);
        assert.fail('Expected to throw "InvalidTypeError"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(InvalidTypeError);
      }
    });

    it('should error if no valid type is supplied to "@mapProp" [InvalidTypeError]', () => {
      try {
        class TestInvalidTypeErrorMP {
          @mapProp({ of: undefined })
          public something: undefined;
        }
        getModelForClass(TestInvalidTypeErrorMP);
        assert.fail('Expected to throw "InvalidTypeError"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(InvalidTypeError);
      }
    });
  });

  describe('tests for "assignMetadata"', () => {
    it('should error if no valid key is supplied [TypeError]', () => {
      try {
        class Dummy { }
        // @ts-ignore
        assignMetadata(true, {}, Dummy);
        assert.fail('Expected to throw "TypeError"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(TypeError);
        expect((err as TypeError).message).to.be.equals(`"true"(key) is not a string! (assignMetadata)`);
      }
    });

    it('should error if no valid class is supplied [NoValidClass]', () => {
      try {
        // @ts-ignore
        assignMetadata(DecoratorKeys.Index, {}, true);
        assert.fail('Expected to throw "NoValidClass"');
      } catch (err) {
        expect(err).to.be.an.instanceOf(NoValidClass);
      }
    });
  });

  it('should error if no valid class is supplied to "mergeSchemaOptions" [NoValidClass]', () => {
    try {
      // @ts-ignore
      mergeSchemaOptions({}, true);
      assert.fail('Expected to throw "NoValidClass"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(NoValidClass);
    }
  });

  it('should throw an error if a self-contained class is used', () => {
    try {
      class TestSelfContained {
        @prop()
        public self: TestSelfContained;
      }
      assert.fail('Expected to throw "NoValidClass"');
    } catch (err) {
      expect(err).to.be.an.instanceOf(Error);
    }
  });
}
