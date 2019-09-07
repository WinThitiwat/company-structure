const modal = document.querySelector('.modal')
M.Modal.init(modal) // init materialize Modal from Materialize Object `M`

const form = document.querySelector('form')
const name = document.querySelector('#name')
const parent = document.querySelector('#parent')
const department = document.querySelector('#department')

form.addEventListener('submit', ev => {
  ev.preventDefault(); // to prevent refreshing the page

  db.collection('employees').add({
    name: name.value,
    parent: parent.value,
    department: department.value
  })

  var instance = M.Modal.getInstance(modal)
  instance.close()

  form.reset()
})

