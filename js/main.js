const ADDRESSES_PER_PAGE = 8

const seedFieldTemplate = document.getElementById('template-seed-field').innerHTML
const addressBoxTemplate = document.getElementById('template-address-box').innerHTML
const accountSheetTemplate = document.getElementById('template-account-sheet').innerHTML
const addressSheetTemplate = document.getElementById('template-address-sheet').innerHTML

const loadingIndicator = document.getElementById('loading')
const seedGrid = document.getElementById('seed-grid')
const mnemonicInfo = document.getElementById('mnemonic-info')
const mnemonicInput = document.getElementById('mnemonic-input')

const activeAccountInfo = document.getElementById('active-account-info')

const walletNameInput = document.getElementById('wallet-name-input')
const walletNameCard = document.getElementById('wallet-name-card')
const walletNameCover = document.getElementById('wallet-name-cover')

const acountWalletNameField =document.getElementById('acountWalletName')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const hide = (element) => {
  if (!element.className.includes('hidden')) {
    const newClassNames = element.className.split(' ')
    newClassNames.push('hidden')
    element.className = newClassNames.join(' ')
  }
}

const show = (element) => {
  element.className = element.className.split(' ').filter((className => className != 'hidden')).join(' ')
}

const wordFields = []
let addressIndex = 0
let activeAccount = 0
let bip32RootNode = null
let activeAccountNode = null

const zeroPad = (num, places = 2) => String(num).padStart(places, '0')

for (let i = 0; i < 24; ++i) {
  const div = document.createElement('div')
  div.innerHTML = seedFieldTemplate
  seedGrid.appendChild(div)

  div.getElementsByClassName('label')[0].innerText = zeroPad(i + 1)
  wordFields.push(div.getElementsByClassName('value')[0])
}

function pubToPub(xyzpub, outputPub = 'xpub') {
  if (!['xpub', 'ypub', 'zpub'].includes(xyzpub.slice(0, 4))) {
    throw new Error('Invalid argument. Provided Public Key is neither a valid xpub, ypub nor zpub.')
  }

  let bytes = null
  if (outputPub === 'xpub') bytes = '0488b21e'
  if (outputPub === 'ypub') bytes = '049d7cb2'
  if (outputPub === 'zpub') bytes = '04b24746'
  if (bytes === null) throw new Error('Invalid argument output. Provide with xpub, ypub or zpub.')

  let data = base58.decode(xyzpub).slice(4)
  data = Buffer.concat([Buffer.from(bytes,'hex'), data])
  return base58.encode(data)
}

function prvToPrv(xyzprv,  outputPub = 'xprv') {
  if (!['xprv', 'yprv', 'zprv'].includes(xyzprv.slice(0, 4))) {
    throw new Error('Invalid argument. Provided Public Key is neither a valid xpub, ypub nor zpub.')
  }

  let bytes = null
  if (outputPub === 'xprv') bytes = '0488ade4'
  if (outputPub === 'yprv') bytes = '049d7878'
  if (outputPub === 'zprv') bytes = '04b2430c'
  if (bytes === null) throw new Error('Invalid argument output. Provide with xprv, yprv or zprv.')

  let data = base58.decode(xyzprv).slice(4)
  data = Buffer.concat([Buffer.from(bytes,'hex'), data])
  return base58.encode(data)
}

const account2Address = (acountNode, index) => {
  const addressNode = acountNode.derivePath(`0/${index}`)
  const publicKey = addressNode.publicKey.toString('hex')
  const privateKey = addressNode.toWIF()

  const payment = bitcoin.payments.p2wpkh({ pubkey: addressNode.publicKey })
  const bc1Address = payment.address

  return {
    publicKey,
    privateKey,
    bc1Address
  }
}

const createAddressPage = () => {
  const addressPage = document.createElement('section')
  addressPage.setAttribute('class', 'sheet padding-10mm')
  addressPage.setAttribute('data-address-page', 'true')
  addressPage.innerHTML = addressSheetTemplate
  document.getElementById('theBody').appendChild(addressPage)
  return addressPage
}

const mnemonicChanged = async (mnemonic) => {
  activeAccountInfo.innerText = ''
  account0Node = null
  addressIndex = 0
  activeAccount = 0

  document.querySelectorAll('[data-address-page=true]').forEach(element => {
    element.remove()
  })
  document.querySelectorAll('[data-account-page=true]').forEach(element => {
    element.remove()
  })
  const valid = bip39lib.validateMnemonic(mnemonic)
  mnemonicInfo.innerText = `${valid ? '✅ Valid' : '🚨 Not Valid'} BIP39 Mnemonic`

  const words = valid ? mnemonic.split(' ') : []

  for (let i = 0; i < 24; ++i) {
    wordFields[i].innerText = (i < words.length ? words[i] : '')
  }

  if (!valid) {
    return
  }

  const bip39Seed = await bip39lib.mnemonicToSeed(mnemonic)
  const bip39HEX = bip39Seed.toString('hex')

  const bip32 = bip32lib.BIP32Factory(ecc)
  bip32RootNode = bip32.fromSeed(bip39Seed)

  /*
  const bip32XPRV = bip32RootNode.toBase58()
  const bip32ZPRV = prvToPrv(bip32XPRV, 'zprv')

  console.info('BIP32 Root Key - XPRV', bip32XPRV)
  console.info('BIP32 Root Key - ZPRV', bip32ZPRV)
  */

  activeAccount = -1
  addAccountPage()
}

const addAccountPage = () => {
  addressIndex = 0
  activeAccount++

  activeAccountInfo.innerText = activeAccount

  const path = `m/84'/0'/${activeAccount}'`
  activeAccountNode = bip32RootNode.derivePath(path)

  const acountXpubField = document.getElementById('acountXpub')
  const acountZpubField = document.getElementById('acountZpub')

  const accountXPRV = activeAccountNode.toBase58()
  const accountZPRV = prvToPrv(accountXPRV, 'zprv')

  const accountXPUB = activeAccountNode.neutered().toBase58()
  const accountZPUB = pubToPub(accountXPUB, 'zpub')

  //console.log('Account0 - ZPRV', account0ZPRV)
  //console.log('Account0 - ZPUB', account0ZPUB)

  const accountPage = document.createElement('section')
  accountPage.setAttribute('class', 'sheet padding-10mm')
  accountPage.setAttribute('data-account-page', 'true')
  accountPage.innerHTML = accountSheetTemplate
  document.getElementById('theBody').appendChild(accountPage)

  accountPage.querySelectorAll('[data-field=account]')[0].innerText = activeAccount
  accountPage.getElementsByClassName('backupName')[0].innerText = walletNameInput.value
  accountPage.getElementsByClassName('accountPath')[0].innerText = path
  accountPage.querySelectorAll('[data-field=accountXpub]')[0].innerText = accountXPUB
  accountPage.querySelectorAll('[data-field=accountZpub]')[0].innerText = accountZPUB

  const zubQRCodeContainer = accountPage.querySelectorAll('[data-field=zpub-qrcode]')[0]
  const zpubQRCode = new QRCode(zubQRCodeContainer, {
    text: accountZPUB,
    width: 400,
    height: 400,
    colorDark: '#000000',
    colorLight: '#FFFFFF',
    correctLevel : QRCode.CorrectLevel.H,
  })
}

const addAddressPage = () => {
  let addressGrid

  for (let i = 0; i < ADDRESSES_PER_PAGE; ++i) {
    if (i % ADDRESSES_PER_PAGE === 0) {
      const addressPage = createAddressPage()
      addressPage.getElementsByTagName('h1')[0].innerHTML = `Addresses from ${addressIndex} to ${addressIndex + ADDRESSES_PER_PAGE - 1}`
      addressPage.getElementsByClassName('backupName')[0].innerText = walletNameInput.value
      addressPage.querySelectorAll('[data-field=walletPath]')[0].innerText = `m/84'/0'/${activeAccount}`

      addressGrid = addressPage.getElementsByClassName('address-grid')[0]
    }
    const { bc1Address } = account2Address(activeAccountNode, addressIndex)

    const div = document.createElement('div')
    div.innerHTML = addressBoxTemplate
    addressGrid.appendChild(div)

    div.getElementsByTagName('span')[0].innerText = `m/84'/0'/${activeAccount}'/0/${addressIndex}`
    new QRCode(div.getElementsByClassName('address-qrcode')[0], {
      text: bc1Address,
      width: 175,
      height: 175,
    })
    div.getElementsByClassName('address-bc1')[0].innerHTML = bc1Address

    addressIndex++
  }
}

const EMPTY_STRING = ''
let currentMnemonic = EMPTY_STRING

mnemonicInput.addEventListener('keyup',  async () => {
  if (currentMnemonic !== EMPTY_STRING) {
    if (currentMnemonic === mnemonicInput.value) {
      return
    }
  }

  while (currentMnemonic !== EMPTY_STRING) {
    await wait(100)
  }

  currentMnemonic = mnemonicInput.value

  show(loadingIndicator)
  await wait(10)
  await mnemonicChanged(currentMnemonic)
  hide(loadingIndicator)

  currentMnemonic = EMPTY_STRING
})

document.getElementById('btnAddAddressPage').addEventListener('click', () => {
  show(loadingIndicator)
  addAddressPage()
  hide(loadingIndicator)
})

document.getElementById('btnAddAccountPage').addEventListener('click', () => {
  show(loadingIndicator)
  addAccountPage()
  hide(loadingIndicator)
})

walletNameInput.addEventListener('keyup', () => {
  walletNameCard.innerText = walletNameInput.value
  walletNameCover.innerText = walletNameInput.value

  let list = document.getElementsByClassName('backupName')
  for (let i = 0; i < list.length; ++i) {
    list[i].innerText = walletNameInput.value
  }
})

hide(loadingIndicator)

window.onload = () => {
}
