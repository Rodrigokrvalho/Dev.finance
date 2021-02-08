var lastIndex = 0
const Modal = {
    //toogle pode subistituir as duas funções
    open(){
        document.querySelector('.modal-overlay').classList.add('active')
    },

    openEdit(index){
        document.querySelector('.modal-overlay-edit').classList.add('active')
        Form.fillFields(index)
    },

    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
        document.querySelector('.modal-overlay-edit').classList.remove('active')
        Form.clearFields()
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transaction) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
    }
}

const transaction = [
    {
        description: 'Luz',
        amount: -50000,
        paymentForm: 'debito',
        date: '23/01/2021'
    },
    
    {
        description: 'Website',
        amount: 500000,
        paymentForm: 'debito',
        date: '23/01/2021'
    },

    {
        description: 'Internet',
        amount: -20000,
        paymentForm: 'debito',
        date: '23/01/2021'
    },

    {
        description: 'App',
        amount: 200040,
        paymentForm: 'debito',
        date: '23/01/2021'
    }]

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        
        App.reload()
    },

    edit(index, transaction){
        Transaction.remove(index)
        Transaction.add(transaction)
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
       const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const html = 
        `   
            <td class="description" onclick="Modal.openEdit(${index})">${transaction.description}</td>
            <td class="${CSSclass}" onclick="Modal.openEdit(${index})">${amount}</td>
            <td class="paymentForm" onclick="Modal.openEdit(${index})">${transaction.paymentForm}</td>
            <td class="date" onclick="Modal.openEdit(${index})">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação"></td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document    
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {

    formatAmount(value){
        value = Number(value) * 100

        return Math.round(value)
    },

    formatToExibitionAmount(value) {
        value = Number(value) / 100

        return `${Number(value).toFixed(2)}`
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatDateToExibition(date) {
        const splittedDate = date.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, "")// expressão regular, encontre todas as letras e transforme 
    
        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    paymentForm: document.querySelector('input#paymentForm'),

    descriptionEdit: document.querySelector('input#descriptionEdit'),
    amountEdit: document.querySelector('input#amountEdit'),
    dateEdit: document.querySelector('input#dateEdit'),
    paymentFormEdit: document.querySelector('input#paymentFormEdit'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            paymentForm: Form.paymentForm.value
        }
    },

    getValuesEdit() {
        return {
            description: Form.descriptionEdit.value,
            amount: Form.amountEdit.value,
            date: Form.dateEdit.value,
            paymentForm: Form.paymentFormEdit.value
        }
    },

    setValues(description, amount, paymentForm, date){
        Form.descriptionEdit.value = description
        Form.amountEdit.value = amount
        Form.paymentFormEdit.value = paymentForm
        Form.dateEdit.value = date
        
    },

    validateFields() {
        const { description, amount, paymentForm, date } = Form.getValues()
        
        if( description.trim() === "" || 
            amount.trim() === "" || 
            paymentForm.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    validateFieldsEdited() {
        const {description, amount, paymentForm, date} = Form.getValuesEdit()

        if( description.trim() === "" || 
            amount.trim() === "" || 
            paymentForm.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }        
    },

    formatValues() {
        let {description, amount, paymentForm, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {description, amount, paymentForm, date}
    },

    formatValuesEdited() {
        let {description, amount, paymentForm, date} = Form.getValuesEdit()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {description, amount, paymentForm, date}

    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.paymentForm.value = ""
    },

    fillFields(index) {
        let transactions = {}
        transactions = transaction[index]
        Form.setValues(transactions.description, Utils.formatToExibitionAmount(transactions.amount), transactions.paymentForm, Utils.formatDateToExibition(transactions.date))
        lastIndex = index
    },

    editedSubmit(event){
        event.preventDefault()

            Form.validateFieldsEdited()
            const transaction = Form.formatValuesEdited()
            Transaction.edit(lastIndex, transaction)
            console.log(transaction, lastIndex)
            Form.clearFields()
            Modal.close()
        
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            console.log(transaction, lastIndex)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}




const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
    
}

App.init()