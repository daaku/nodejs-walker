var Walker = require('walker')
  , fs = require('fs')
  , assert = require('assert')

const SIMPLE_WALK = __dirname + '/fixture-simple-walk'
const ERROR_WALK = __dirname + '/fixture-error-walk'
const BAD_START_WALK = __dirname + '/fixture-error-walk/d'
const SYMLINK_WALK = __dirname + '/fixture-symlink-walk'

// create/remove an in-accessable empty directory to trigger errors
try {
  fs.chmodSync(BAD_START_WALK, 0600)
  fs.rmdirSync(BAD_START_WALK)
} catch(e) {}
try { fs.mkdirSync(BAD_START_WALK, 0200) } catch(e) {}

exports['simple walk'] = function(beforeExit) {
  var n = 9

  Walker(SIMPLE_WALK)
    .on('dir', function(dir) {
      assert.includes([SIMPLE_WALK, SIMPLE_WALK + '/d'],
        dir, 'Unexpected directory.')
      n--
    })
    .on('file', function(file) {
      assert.includes(
        [SIMPLE_WALK + '/a',
         SIMPLE_WALK + '/b',
         SIMPLE_WALK + '/c',
         SIMPLE_WALK + '/d/e',
         SIMPLE_WALK + '/d/f',
         SIMPLE_WALK + '/d/g'],
        file, 'Unexpected file.')
      n--
    })
    .on('error', function(er, entry, stat) {
      assert.ifError(er)
    })
    .on('end', function() {
      n--
    })

  beforeExit(function() {
    assert.equal(0, n, 'Ensure expected asserts.')
  })
}

exports['simple walk, exclude sub-directory tree'] = function(beforeExit) {
  var n = 5

  Walker(SIMPLE_WALK)
    .filterDir(function(dir) {
      return dir != (SIMPLE_WALK + '/d')
    })
    .on('dir', function(dir) {
      assert.equal(SIMPLE_WALK, dir, 'Expect specific directory')
      n--
    })
    .on('file', function(file) {
      assert.includes(
        [SIMPLE_WALK + '/a',
         SIMPLE_WALK + '/b',
         SIMPLE_WALK + '/c'],
        file, 'Unexpected file.')
      n--
    })
    .on('error', function(er, entry, stat) {
      assert.ifError(er)
    })
    .on('end', function() {
      n--
    })

  beforeExit(function() {
    assert.equal(0, n, 'Ensure expected asserts.')
  })
}

exports['error walk'] = function(beforeExit) {
  var n = 6

  Walker(ERROR_WALK)
    .on('dir', function(dir) {
      assert.equal(ERROR_WALK, dir, 'Expect specific directory')
      n--
    })
    .on('file', function(file) {
      assert.includes(
        [ERROR_WALK + '/a',
         ERROR_WALK + '/b',
         ERROR_WALK + '/c'],
        file, 'Unexpected file.')
      n--
    })
    .on('error', function(er, entry, stat) {
      assert.equal(ERROR_WALK + '/d', entry, 'Expect specific error.')
      n--
    })
    .on('end', function() {
      n--
    })

  beforeExit(function() {
    assert.equal(0, n, 'Ensure expected asserts.')
  })
}

exports['bad start'] = function(beforeExit) {
  var n = 2

  Walker(BAD_START_WALK)
    .on('dir', function(dir) {
      n--
    })
    .on('file', function(file) {
      n--
    })
    .on('error', function(er, entry, stat) {
      assert.equal(BAD_START_WALK, entry, 'Expect specific error.')
      n--
    })
    .on('end', function() {
      n--
    })

  beforeExit(function() {
    assert.equal(0, n, 'Ensure expected asserts.')
  })
}

exports['symlink test'] = function(beforeExit) {
  var n = 10

  Walker(SYMLINK_WALK)
    .on('dir', function(dir) {
      assert.includes([SYMLINK_WALK, SYMLINK_WALK + '/d'],
        dir, 'Unexpected directory: ' + dir)
      n--
    })
    .on('file', function(file) {
      assert.includes(
        [
          SYMLINK_WALK + '/a',
          SYMLINK_WALK + '/b',
          SYMLINK_WALK + '/d/e',
          SYMLINK_WALK + '/d/f',
          SYMLINK_WALK + '/d/g',
        ],
        file,
        'Unexpected file: ' + file
      )
      n--
    })
    .on('symlink', function(symlink) {
      assert.includes(
        [
          SYMLINK_WALK + '/c',
          SYMLINK_WALK + '/e',
        ],
        symlink,
        'Unexpected symlink: ' + symlink
      )
      n--
    })
    .on('error', function(er, entry, stat) {
      assert.ifError(er)
    })
    .on('end', function() {
      n--
    })

  beforeExit(function() {
    assert.equal(0, n, 'Ensure expected asserts: ' + n)
  })
}
