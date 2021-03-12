// Funcionalidade abrir e fechar modal.
const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

// sistema que armazena as informações no dispositivo(cookies)
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

// Calcula as informações para coloca-las nos cards.
const Transaction = {
    all: Storage.get(), 

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    // Calcula e soma as entradas. (se a entrada for maior que zero, ele soma nos incomes)
    incomes() {
        let income = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income;
    },
    // Calcula e soma os gastos. (se a entrada for menor que zero, ele soma nas expenses)
    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense;

    },
    // soma os incomes e as expenses
    Total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// mexe nos elementos da página.
const DOM = {
    //coloca o elemento </tr> na table
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    // lida com os elementos da tabela, interpola as informações para que mude no nosso html.
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onClick="Transaction.remove(${index})" src="/assets/minus.svg" alt="remove transaction">
        </td>
        `
        return html
    },

    //
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.Total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    // formata o valor, multiplicando-o por 100
    formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    //formata a data, pois ela vem com um formatação diferente da habitual
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // formata moeda e sinais.
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })

        return signal + value
    },
}

// valores do formulário, do moral.
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // pega os valores colocados nos inputs. No caso seria as respostas do form.
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // caso algum dos inputs esteja vazio (ou seja, == ""), ele lança um erro.
    validateFields() {
        const { description, amount, date } = Form.getValues()
        if (description.trim() == "" || amount.trim() == "" || date.trim() == "") {
            throw new Error("Complete all the fields")
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // adiciona o dado.
    saveTransaction() {
        Transaction.add(transaction)
    },

    // limpa os dados da linha.
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    // faz a checagem, validação e envio dos dados. Caso esteja tudo certoe ele não ativa o alert.
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }

        Form.formatData()
    }
}
const App = {
    //inicia o app
    init() {
        Transaction.all.forEach(function(transaction, index) {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
        
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()