// Modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')
//Modulos Internos
const fs = require('fs')
const { constrainedMemory } = require('process')
const { createUnzip } = require('zlib')
const { json } = require('express')

console.log('Iniciamos o Accounts')

operation()

function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
      },
    ])
    .then(anwser => {
      const action = anwser['action']

      if (action === 'Criar Conta') {
        createAccount()
      } else if (action === 'Consultar Saldo') {
        getAccountBalance()
      } else if (action === 'Depositar') {
        deposit()
      } else if (action === 'Sacar') {
        widthdaw()
      } else if (action === 'Sair') {
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        process.exit()
      }
    })
    .catch(err => console.log(err))
}

//create an account

function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher nosso Banco!'))
  console.log(chalk.green('Defina as Opções da sua conta a seguir'))
  buildAccount()
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para sua conta:',
      },
    ])
    .then(anwser => {
      const accountName = anwser['accountName']
      console.info(accountName)

      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts')
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
        buildAccount()
        return
      }
      fs.writeFileSync(`accounts/${accountName}.json`, '{"balance":0}', function (err) {
        console.log(err)
      })
      console.log(chalk.green('Parabéns, a sua conta foi Criada"'))
      operation()
    })
    .catch(err => console.log(err))
}

//add an amount to user account

function deposit() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then(anwser => {
      const accountName = anwser['accountName']
      //verify if account exists
      if (!checkAccount(accountName)) {
        return deposit()
      }
      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja depositar',
          },
        ])
        .then(anwser => {
          const amount = anwser['amount']

          //add an mount
          addAmount(accountName, amount)
          operation()
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
    return false
  }
  return true
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
    return deposit()
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function (err) {
    console.log(err)
  })

  console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r',
  })

  return JSON.parse(accountJSON)
}

//show account balance

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then(anwser => {
      const accountName = anwser['accountName']
      //verify if account exists
      if (!checkAccount(accountName)) {
        return getAccountBalance()
      }

      const accountData = getAccount(accountName)
      console.log(chalk.bgBlue.black(`Olá, o salda da sua conta éR$${accountData.balance}`))
      operation()
    })
    .catch(err => console.log(err))
}

//widthdraw an amount from user account
function widthdaw() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then(anwser => {
      const accountName = anwser['accountName']

      if (!checkAccount(accountName)) {
        return widthdaw()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Qunato você deseja sacar?',
          },
        ])
        .then(anwser => {
          const amount = anwser['amount']

          removeAmount(accountName, amount)
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
    return widthdaw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return widthdaw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function (err) {
    console.log(err)
  })

  console.log(chalk.greenBright(`Foi realizado um saque de R$${amount} da sua conta!`))
  operation()
}
