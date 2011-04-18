module.exports = Walker

var path = require('path')
  , fs = require('fs')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter

/**
 * To walk a directory. It's complicated (but it's async, so it must be fast).
 *
 * @param root {String} the directory to start with
 */
function Walker(root) {
  if (!(this instanceof Walker)) return new Walker(root)
  EventEmitter.call(this)
  this.pending = 0
  this.go(root)
  this._filterDir = function() { return true }
}
util.inherits(Walker, EventEmitter)

/**
 * Setup a function to filter out directory entries.
 *
 * @param fn {Function} a function that will be given a directory name, which
 * if returns true will include the directory and it's children
 */
Walker.prototype.filterDir = function(fn) {
  this._filterDir = fn
  return this
}

/**
 * Process a file or directory.
 */
Walker.prototype.go = function(target) {
  var that = this
  this.pending++

  fs.lstat(target, function(er, stat) {
    if (er) {
      that.emit('error', er, target, stat)
      that.doneOne()
      return
    }

    if (stat.isDirectory()) {
      if (!that._filterDir(target)) {
        that.doneOne()
      } else {
        fs.readdir(target, function(er, files) {
          if (er) {
            that.emit('error', er, target, stat)
            that.doneOne()
            return
          }

          that.emit('dir', target, stat)
          files.forEach(function(part) {
            that.go(path.join(target, part))
          })
          that.doneOne()
        })
      }
    } else {
      that.emit('file', target, stat)
      that.doneOne()
    }
  })
}

Walker.prototype.doneOne = function() {
  if (--this.pending === 0) this.emit('end')
}
