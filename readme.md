walker
======

A simple nodejs directory walker. It's not very featureful; this demonstrates
the entire API:

    Walker('/etc/')
      .filterDir(function(dir) {
        if (dir === '/etc/pam.d') {
          console.warn('Skipping /etc/pam.d and children')
          return false
        }
        return true
      })
      .on('dir', function(dir) {
        console.log('Got directory: ' + dir)
      })
      .on('file', function(file) {
        console.log('Got file: ' + file)
      })
      .on('error', function(er, target, stat) {
        console.log('Got error ' + er + ' on target ' + target)
      })
      .on('end', function(file) {
        console.log('Walker is done.')
      })

You specify a root directory to walk and optionally specify a function to prune
sub-directory trees via the `filterDir` function. The Walker exposes a number
of events, broadcasting each directory, file, error and finally the event to
signal the end of the process.


TODO
----

- Better symlink support.
