'use babel'

const minim = require('minim').namespace()

import {
  lineEndingsIndices,
  resolutionType,
  resolutionRange,
  createResolution
}
from '../lib/helpers.js'

import AnnotationRefractFixture from './fixtures/annotation.refract.json'
import AnnotationResolutionFixture from './fixtures/annotation.resolution.json'
import ComplexSourceMapFixture from './fixtures/complexsourcemap.refract.json'

describe('API Blueprint linter helpers', () => {

  describe('Resolution type helper', () => {

    it('recognizes the warning source annotation class', () => {
      let type = resolutionType(minim.toElement(['warning']))
      expect(type).toEqual('Warning')
    })

    it('recognizes the error source annotation class', () => {
      let type = resolutionType(minim.toElement(['red', 'green', 'error']))
      expect(type).toEqual('Error')
    })
  })

  describe('Line endings indices helper', () => {

    it('computes the line endings indices', () => {
      const text = "one\ntwo\nthree\n"
      let endingsIndices = lineEndingsIndices(text)
      expect(endingsIndices).toEqual([3, 7, 13])
    })

  })

  describe('Resolution range helper', () => {

    it('computes the correct range', () => {
      let textBuffer = "\
# GET /r\n\
- response 200\n\
\n\
    {\n\
        ...\n\
    }\n"

      let endingsIndices = lineEndingsIndices(textBuffer)
      let annotation = minim.fromRefract(ComplexSourceMapFixture)
      let sourceMap = annotation.attributes.get('sourceMap')
      let range = resolutionRange(endingsIndices, sourceMap)
      expect(range).toEqual([
        [3, 4],
        [5, 5]
      ])
    })

  })

  describe('Create resolution helper', () => {

    it('creates resolution from a warning annotation', () => {
      let annotation = minim.fromRefract(AnnotationRefractFixture)
      let resolution = createResolution('', '', annotation)
      expect(resolution).toEqual(AnnotationResolutionFixture)
    })

  })
})
