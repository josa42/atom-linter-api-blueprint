'use babel'

const minim = require('minim').namespace()

import fs from 'fs'
import path from 'path'

import {
  lineEndingsIndices,
  resolutionType,
  resolutionRange,
  createResolution
}
from '../lib/helpers.js'

import AnnotationRefractFixture from './fixtures/annotation.refract.json'
import AnnotationResolutionFixture from './fixtures/annotation.resolution.json'

import ComplexSourceMapRefractFixture from './fixtures/complexsourcemap.refract.json'
const ComplexSourceMapBlueprintFixturePath = './fixtures/complexsourcemap.apib'

import InvalidRefractFixture from './fixtures/invalid.refract.json'
import InvalidResolutionFixture from './fixtures/invalid.resolution.json'
import InvalidParseResultFixture from './fixtures/invalid.parseresult.json'
const InvalidBlueprintFixturePath = './fixtures/invalid.apib'

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
    let textBuffer

    beforeEach(() => {
      let fixturePath = path.join(__dirname, ComplexSourceMapBlueprintFixturePath)
      textBuffer = fs.readFileSync(fixturePath, 'utf8')
    })

    it('computes the correct range', () => {
      let endingsIndices = lineEndingsIndices(textBuffer)
      let annotation = minim.fromRefract(ComplexSourceMapRefractFixture)
      let sourceMap = annotation.attributes.get('sourceMap')
      let range = resolutionRange(endingsIndices, sourceMap)
      expect(range).toEqual([
        [3, 4],
        [5, 5]
      ])
    })

  })

  describe('Create resolution helper', () => {
    let textBuffer

    beforeEach(() => {
      let fixturePath = path.join(__dirname, InvalidBlueprintFixturePath)
      textBuffer = fs.readFileSync(fixturePath, 'utf8')
    })

    it('creates the resolution from a warning annotation', () => {
      let annotation = minim.fromRefract(AnnotationRefractFixture)
      let resolution = createResolution('', '', annotation)
      expect(resolution).toEqual(AnnotationResolutionFixture)
    })

    it('creates the resolution from an error annotation', () => {
      let annotation = minim.fromRefract(InvalidRefractFixture)
      let endingsIndices = lineEndingsIndices(textBuffer)

      let resolution = createResolution(endingsIndices, InvalidBlueprintFixturePath, annotation)
      expect(resolution).toEqual(InvalidResolutionFixture)
    })

    it('creates resolution from parser result', () => {
      let parseResult = minim.fromRefract(InvalidParseResultFixture)
      let endingsIndices = lineEndingsIndices(textBuffer)

      var resolutions = []
      var annotations = parseResult.content.filter(item => item.element === 'annotation')
      annotations.forEach(function(annotation) {
        console.log(`\nannotation: ${JSON.stringify(annotation, ' ', 2)}`)
        resolutions.push(createResolution(endingsIndices, InvalidBlueprintFixturePath, minim.fromRefract(annotation)))
      })
      expect(resolutions.length).toEqual(2)
    })

  })
})
