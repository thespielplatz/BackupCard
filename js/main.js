const inputQRCode = document.getElementById('input_qrcode')
const textId = document.getElementById('identifier')
const minimizedCode = document.getElementById('minimizedCode')
const seedGrid = document.getElementById('seed-grid')
const seedFieldTemplate = document.getElementById('template-seed-field').innerHTML

const seedFields = []
const zeroPad = (num, places = 2) => String(num).padStart(places, '0')
for (let i = 0; i < 24; ++i) {
  const div = document.createElement('div')
  div.innerHTML = seedFieldTemplate
  seedGrid.appendChild(div)

  div.getElementsByClassName('label')[0].innerText = zeroPad(i + 1)
  seedFields.push(div.getElementsByClassName('value')[0])
}

const seed = document.getElementById("input-seed").value.split(' ')
const xprv = 'zprvAfcFwXSMcdJZ8S7L2PwHaTaNbkugAi4yrnbkY7KeB7jnY245n35MSB1nxAbGXwdMXokUU1TKvkESwPwxBpqNMmrJEPeVn42VZEopVJ7QtC3'
for (let i = 0; i < 24; ++i) {
  seedFields[i].innerText = (i < seed.length ? seed[i] : '')
}

let qrcode = new QRCode(document.getElementById("xprv-qr-code"), {
  text: xprv,
  width: 125,
  height: 125
})


/*
inputQRCode.addEventListener("keyup", function(event) {
  event.preventDefault()
  console.log(inputQRCode.value)
  qrcode.clear()
  qrcode.makeCode(inputQRCode.value.trim())

  textId.innerText = inputQRCode.value

  const parts = inputQRCode.value.split('/')
  const codeFull = parts.at(-1)
  const codeParts = codeFull.split('-')
  const codeMinimized = codeParts.at(0).toUpperCase()

  minimizedCode.innerText = codeMinimized
})
*/
