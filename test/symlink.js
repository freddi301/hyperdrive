var test = require('tape')
var create = require('./helpers/create')

test('basic symlink', t => {
  const archive = create()

  archive.writeFile('/hello.txt', 'world', err => {
    t.error(err, 'no error')
    archive.symlink('/hello.txt', '/link.txt', err => {
      t.error(err, 'no error')
      onlink()
    })
  })

  function onlink () {
    archive.stat('/link.txt', (err, st) => {
      t.error(err, 'no error')
      t.same(st.size, 5)
      archive.readFile('/link.txt', (err, contents) => {
        t.error(err, 'no error')
        t.same(contents, Buffer.from('world'))
        t.end()
      })
    })
  }
})

test('fixing a broken symlink', t => {
  const archive = create()

  archive.symlink('/hello.txt', '/link.txt', err => {
    t.error(err, 'no error')
    archive.stat('/link.txt', (err, st) => {
      t.same(err.errno, 2)
      archive.writeFile('/hello.txt', 'world', err => {
        t.error(err, 'no error')
        onwrite()
      })
    })
  })

  function onwrite () {
    archive.stat('/link.txt', (err, st) => {
      t.error(err, 'no error')
      t.same(st.size, 5)
      archive.readFile('/link.txt', (err, contents) => {
        t.error(err, 'no error')
        t.same(contents, Buffer.from('world'))
        t.end()
      })
    })
  }
})

test('unlinking a symlink does not delete the target', t => {
  const archive = create()

  archive.writeFile('/hello.txt', 'world', err => {
    t.error(err, 'no error')
    archive.symlink('/hello.txt', '/link.txt', err => {
      t.error(err, 'no error')
      archive.unlink('/link.txt', err => {
        t.error(err, 'no error')
        onunlink()
      })
    })
  })

  function onunlink () {
    archive.stat('/hello.txt', (err, st) => {
      t.error(err, 'no error')
      t.same(st.size, 5)
      archive.readFile('/hello.txt', (err, contents) => {
        t.error(err, 'no error')
        t.same(contents, Buffer.from('world'))
        t.end()
      })
    })
  }
})

test('symlinks appear in readdir', t => {
  const archive = create()

  archive.writeFile('/hello.txt', 'world', err => {
    t.error(err, 'no error')
    archive.symlink('/hello.txt', '/link.txt', err => {
      t.error(err, 'no error')
      onlink()
    })
  })

  function  onlink () {
    archive.readdir('/', (err, files) => {
      t.error(err, 'no errors')
      t.same(files, ['hello.txt', 'link.txt'])
      t.end()
    })
  }
})
