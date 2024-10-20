const defaultUsers = [
  {
    fullName: "Jessica Davis",
    userName: "testUser1",
    accountNumber: 123456,
    transactions: [
      { type: "deposit", amount: 5000, date: "2024-10-01T13:15:33.035Z" },
      { type: "withdrawal", amount: 1500, date: "2024-10-05T09:48:16.867Z" },
      { type: "deposit", amount: 1000, date: "2024-10-07T14:11:59.604Z" },
      { type: "loan", amount: 8000, date: "2024-10-10T17:01:17.194Z" },
      { type: "deposit", amount: 3000, date: "2024-10-12T23:36:17.929Z" },
    ],
    interestRate: 1.5,
    pin: 1111,
  },
  {
    fullName: "Michael Johnson",
    userName: "testUser2",
    accountNumber: 234567,
    transactions: [
      { type: "deposit", amount: 7000, date: "2024-09-25T11:24:33.035Z" },
      { type: "withdrawal", amount: 2000, date: "2024-09-28T14:48:16.867Z" },
      { type: "deposit", amount: 500, date: "2024-09-30T10:11:59.604Z" },
      { type: "loan", amount: 6000, date: "2024-10-02T09:01:17.194Z" },
      { type: "deposit", amount: 4000, date: "2024-10-03T12:36:17.929Z" },
    ],
    interestRate: 2.0,
    pin: 2222,
  },
  {
    fullName: "Emily Clark",
    userName: "testUser3",
    accountNumber: 345678,
    transactions: [
      { type: "deposit", amount: 10000, date: "2024-10-03T13:55:33.035Z" },
      { type: "withdrawal", amount: 3000, date: "2024-10-06T16:35:16.867Z" },
      { type: "deposit", amount: 2000, date: "2024-10-09T18:20:59.604Z" },
      { type: "loan", amount: 12000, date: "2024-10-10T21:01:17.194Z" },
      { type: "deposit", amount: 5000, date: "2024-10-11T23:10:17.929Z" },
    ],
    interestRate: 1.8,
    pin: 3333,
  }
];

// Define the localStorage manager
class StorageManager {
  // Add a new item (key-value pair) to localStorage
  add(key, value) {
    const existing = this.get(key);
    if (!existing) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      console.warn(`The "${key}" already exists.`);
    }
  }

  // Set or update an item in localStorage
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove an item from localStorage
  remove(key) {
    localStorage.removeItem(key);
  }

  // Get an item from localStorage
  get(key) {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : null;
  }
}

class BankAccountUser {
  constructor({fullName, userName, transactions=[], interestRate, pin, accountNumber}) {
    this.fullName = fullName;
    this.userName = userName;
    this.transactions = transactions;
    this.interestRate = interestRate;
    this.pin = pin;
    this.accountNumber = accountNumber || this.generateAccountNumber();
  }

  generateAccountNumber() {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
class BankAccountManager {
  constructor() {
    this.storageKey = 'users'; // Key to store all user and bank account data in localStorage
    this.currentUserKey = 'currentUser'; // Key for storing the logged-in user
    this.storage = new StorageManager(); // Use StorageManager for all localStorage operations

    // Feed test data to localStorage
    this.setDefaultUsers();
  }

  setDefaultUsers() {
    const users = this.getUsers();

    if (!users || users.length === 0) {
      this.setUsers(defaultUsers);
    }
  }

  isAuthenticated() {
    const currentUser = this.getCurrentUser();
    return !!currentUser;
  }

  register({data, onSuccess, onError}) {
    const users = this.getUsers();
    const {fullName, userName, pin} = data;

    const existingUser = users.find(user => user.userName === userName);

    if (existingUser) {
      onError('User already registered');
      return;
    }

    const newUser = new BankAccountUser({fullName, userName, pin: Number(pin), interestRate: this.generateInterestRate()});

    users.push(newUser);

    this.setUsers(users);

    this.setCurrentUser(newUser);

    onSuccess();
  }

  login({data, onSuccess, onError}) {
    const {userName, pin} = data;
    const users = this.getUsers();

    console.log({ users, userName, pin })

    const user = users.find(user => user.userName === userName && user.pin === pin);

    if (!user) {
      onError('Invalid user name or pin');
      return;
    }

    this.setCurrentUser(user);

    onSuccess();
  }

  logout ({onSuccess, onError}) {
    if(!this.isAuthenticated()) {
      onError('User is not authenticated');
      return;
    }

    this.storage.remove(this.currentUserKey);
    onSuccess();
  }

  deleteAccount ({data, onSuccess, onError}) {
    const {userName, pin} = data;
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();

    if (currentUser.userName !== userName || currentUser.pin !== pin) {
      onError('Invalid user name or pin');
      return;
    }

    const updatedUsers = users.filter(user => user.userName !== userName);
    
    this.setUsers(updatedUsers);

    onSuccess();
  }

  calculateBalance() {
    const currentUser = this.getCurrentUser();
    const transactions = currentUser.transactions;
    const balance = transactions.reduce((total, transaction) => {
      if (transaction.type === 'deposit' || transaction.type === 'loan') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);

    return balance;
  }

  getTransactionSummary() {
    const user = this.getCurrentUser();

    const incomes = user.transactions.filter(transaction => transaction.type === 'deposit' || transaction.type === 'loan').reduce((total, transaction) => total + transaction.amount, 0);

    const outcomes = user.transactions.filter(transaction => transaction.type === 'withdrawal').reduce((total, transaction) => total + transaction.amount, 0);

    const interest = user.transactions.filter(transaction => transaction.type === 'loan').map(transaction => transaction.amount * user.interestRate / 100).reduce((total, amount) => total + amount, 0);

    return { incomes, outcomes, interest };
  }

  transferMoney({data, onSuccess, onError })  {
    const { toAccountNumber, amount } = data;
    const currentUser = this.getCurrentUser();
    const recipient = this.findUserByAccountNumber(toAccountNumber);
  
    console.log({ currentUser, recipient, toAccountNumber });

    if(!recipient) {
      onError(`Recipient account ${toAccountNumber} not found`);
      return;
    }

    if(currentUser.accountNumber === recipient.accountNumber) {
      onError('Cannot transfer money to your own account');
      return;
    }

    const currentUserBalance = this.calculateBalance();

    if (currentUserBalance < amount) {
      onError('You do not have enough balance to transfer');
      return;
    }

    currentUser.transactions.push({ type: 'withdrawal', amount, date: new Date().toISOString() });
    recipient.transactions.push({ type: 'deposit', amount, date: new Date().toISOString() });

    this.updateUserData(currentUser);
    this.updateUserData(recipient);
    
    onSuccess();
  }

  loan ({data, onSuccess}) {
    const { amount } = data;
    const currentUser = this.getCurrentUser();
    currentUser.transactions.push({ type: 'loan', amount, date: new Date().toISOString() });
    this.updateUserData(currentUser);
    onSuccess();
  }

  generateInterestRate() {
    return (Math.random() * 3).toFixed(2);
  }

  getUsers() {
    return this.storage.get(this.storageKey) ?? [];
  }

  setUsers(users) {
    this.storage.set(this.storageKey, users);
  }

  getCurrentUser() {
    const currentUser = this.storage.get(this.currentUserKey);

    const users = this.getUsers();

    return currentUser ? users.find(user => user.userName === currentUser.userName) : null;
  }
  
  setCurrentUser(user) {
    const { userName, accountNumber } = user;

    return this.storage.set(this.currentUserKey, { userName, accountNumber});
  }

  updateUserData(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.userName === user.userName);

    if (index === -1) {
      return;
    }

    users[index] = user;

    this.setUsers(users);
  }

  findUserByAccountNumber(accountNumber) {
    const users = this.getUsers();
    return users.find(user => user.accountNumber === accountNumber);
  }
}

function main() {
  // Page elements
  const dashboardPage = document.getElementById('dashboard-page');
  const loginPage = document.getElementById('login-page');
  const registerPage = document.getElementById('register-page');

  // Sign in elements
  const signInForm = document.getElementById('sign-in-form');
  const signInUserInput = document.getElementById('sign-in-user-input');
  const signInPasswordInput = document.getElementById('sign-in-password-input');
  
  // Sign out elements
  const signOutButton = document.getElementById('sign-out-button');

  // Register elements
  const registerForm = document.getElementById('register-form');
  const registerFullNameInput = document.getElementById('register-full-name-input');
  const registerUserInput = document.getElementById('register-user-input');
  const registerPasswordInput = document.getElementById('register-password-input');

  // Balance elements
  const currentDate = document.getElementById('current-date');
  const currentBalance = document.getElementById('current-balance');

  // Transactions elements
  const transactions = document.getElementById('transactions');

  // Summary elements
  const summaryValueIn = document.getElementById('summary-value-in');
  const summaryValueOut = document.getElementById('summary-value-out');
  const summaryValueInterest = document.getElementById('summary-value-interest');

  // Transfer operation elements
  const transferForm = document.getElementById('transfer-form');
  const transferUserInput = document.getElementById('transfer-user-input');
  const transferAmountInput = document.getElementById('transfer-amount-input');

  // Loan operation elements
  const loanForm = document.getElementById('loan-form');
  const loanAmountInput = document.getElementById('loan-amount-input');

  // Account operation elements
  const deleteForm = document.getElementById('delete-form');
  const deleteAccountInput = document.getElementById('delete-account-input');
  const deleletAccountPasswordInput = document.getElementById('delete-account-password-input');

  const bankAccountManager = new BankAccountManager();

  function initialize() {
    const isAuthenticated = bankAccountManager.isAuthenticated();

    console.log({ isAuthenticated })

    if (isAuthenticated) {
      if (dashboardPage) {
        updateUI();
      } else {
        window.location.href = 'index.html';
      }
    } else {
      if (dashboardPage) {
        window.location.href = 'login.html';
      }
    }
  }

  initialize();

  // Signin page
  function signIn(event) {
    event.preventDefault();

    const validateUserName = validateInput('userName', signInUserInput.value, { maxLength: 12 });

    if (!validateUserName.isValid) {
      alert(validateUserName.message);
      return;
    }

    const validatePin = validateInput('pin', signInPasswordInput.value);

    if (!validatePin.isValid) {
      alert(validatePin.message);
      return;
    }

    const data = {
      userName: signInUserInput.value,
      pin: Number(signInPasswordInput.value)
    }

    bankAccountManager.login({
      data,
      onSuccess: () => {
        window.location.href = 'index.html';
      },
      onError: (message) => {
        alert(message);
      }
    })
  }

  if(signInForm) {
    signInForm.addEventListener('submit', signIn);
  }

  // Register page
  function registerUser(event) {
    event.preventDefault();

    const validateFullName = validateInput('fullName', registerFullNameInput.value, { maxLength: 50 });

    if (!validateFullName.isValid) {
      alert(validateFullName.message);
      return;
    }

    const validateUserName = validateInput('userName', registerUserInput.value, { maxLength: 12 });

    if (!validateUserName.isValid) {
      alert(validateUserName.message);
      return;
    }

    const validatePin = validateInput('pin', registerPasswordInput.value);

    if (!validatePin.isValid) {
      alert(validatePin.message);
      return;
    }

    const data = {
      fullName: registerFullNameInput.value,
      userName: registerUserInput.value,
      pin: Number(registerPasswordInput.value)
    };

    bankAccountManager.register({
      data,
      onSuccess: () => {
        window.location.href = 'index.html';
      },
      onError: (message) => {
        alert(message);
      }
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
  }

  // Dashboard page
  function signOut(event) {
    event.preventDefault();

    bankAccountManager.logout({
      onSuccess: () => {
        window.location.href = 'login.html';
      },
      onError: (message) => {
        alert(message);
      }
    });
  }

  if(signOutButton) {
    signOutButton.addEventListener('click', signOut);
  }

  function updateUI() {
    displayBalance();
    displayTransactions();
    displayTransactionsSummary();
  }

  function displayBalance() {   
    const balance = bankAccountManager.calculateBalance();
    currentBalance.textContent = formatCurrency(balance);
    currentDate.textContent = formatDate(new Date());
  }

  function displayTransactionsSummary() {
    const transaction = bankAccountManager.getTransactionSummary();
    summaryValueIn.textContent = formatCurrency(transaction.incomes);
    summaryValueOut.textContent = formatCurrency(transaction.outcomes);
    summaryValueInterest.textContent = formatCurrency(transaction.interest);
  }

  function displayTransactions() {
    const transactionsList = bankAccountManager.getCurrentUser().transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    let transactionsContent = '';

    transactionsList.forEach(({ date, amount, type }) => {
      const formattedDate = formatDatePass(new Date(date));
      const formattedAmount = formatCurrency(amount);

      transactionsContent += `
        <div class="transactions__row">
          <div class="transactions__type transactions__type--${type}">
            ${type}
          </div>
          <div class="transactions__date">${formattedDate}</div>
          <div class="transactions__value">${formattedAmount}</div>
        </div>
      `;
    })

    transactions.innerHTML = transactionsContent;
  }


  // Transfer operation
  function transfer(event) {
    event.preventDefault();

    const validateAccountNumber = validateInput('accountNumber', transferUserInput.value);

    if (!validateAccountNumber.isValid) {
      alert(validateAccountNumber.message);
      return;
    }

    const validateAmount = validateInput('transferAmount', transferAmountInput.value);

    if (!validateAmount.isValid) {
      alert(validateAmount.message);
      return;
    }

    const data = {
      toAccountNumber: Number(transferUserInput.value),
      amount: Number(transferAmountInput.value)
    };

    console.log({ data });

    bankAccountManager.transferMoney({
      data,
      onSuccess: () => {
        updateUI();
        transferUserInput.value = '';
        transferAmountInput.value = '';
      },
      onError: (message) => {
        alert(message);
      }
    });
  }

  if(transferForm) {
    transferForm.addEventListener('submit', transfer);
  }

  // Loan operation
  function loan(event) {
    event.preventDefault();

    const validateAmount = validateInput('transferAmount', loanAmountInput.value);

    if (!validateAmount.isValid) {
      alert(validateAmount.message);
      return;
    }

    const data = {
      amount: Number(loanAmountInput.value)
    };

    bankAccountManager.loan({
      data,
      onSuccess: () => {
        updateUI();
        loanAmountInput.value = '';
      }
    });
  }

  if(loanForm) {
    loanForm.addEventListener('submit', loan);
  }

  // Delete account operation
  function deleteAccount(event) {
    event.preventDefault();

    const validateUserName = validateInput('userName', deleteAccountInput.value, { maxLength: 12 });

    if (!validateUserName.isValid) {
      alert(validateUserName.message);
      return;
    }

    const validatePin = validateInput('pin', deleletAccountPasswordInput.value);

    if (!validatePin.isValid) {
      alert(validatePin.message);
      return;
    }

    const data = {
      userName: deleteAccountInput.value,
      pin: Number(deleletAccountPasswordInput.value)
    }

    const shouldDelete = confirm('Are you sure you want to delete your account?');

    if (!shouldDelete) {
      return;
    }

    bankAccountManager.deleteAccount({ 
      data,
      onError: (message) => {
        alert(message);
      },
      onSuccess: () => {
        window.location.href = 'login.html';
      }
    })
  }

  if(deleteForm) {
    deleteForm.addEventListener('submit', deleteAccount);
  }

  // Utils  
  function formatDate (date) {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  function formatDatePass (date) {
    const calcDaysPassed = (date1, date2) =>
      Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  
    const daysPassed = calcDaysPassed(new Date(), date);
    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;
  
    return formatDate(date);
  };

  function formatCurrency (value) {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };

  function validateInput(type, value, rules = {}) {
    // Default response object
    const result = {
      isValid: true,
      message: '',
    };
  
    // Helper function to set invalid result
    const setInvalid = (message) => {
      result.isValid = false;
      result.message = message;
      return result;
    };
  
    // Full name validation (alphabet only)
    if (type === 'fullName') {
      const { maxLength } = rules;
      const regex = /^[A-Za-z\s]+$/; // Alphabet and space only
  
      if (!regex.test(value)) {
        return setInvalid('The full name should contain alphabetic characters only.');
      }
  
      if (maxLength !== undefined && value.length > maxLength) {
        return setInvalid(`The full name should not exceed ${maxLength} characters.`);
      }
    }
  
    // Username validation (max 12 characters, alphabet only)
    if (type === 'userName') {
      const regex = /^[A-Za-z]+$/; // Alphabet only
      const { maxLength = 12 } = rules;
  
      if (!regex.test(value)) {
        return setInvalid('The username should contain alphabetic characters only.');
      }
  
      if (value.length > maxLength) {
        return setInvalid(`The username must not exceed ${maxLength} characters.`);
      }
    }
  
    // PIN validation (exactly 4 digits)
    if (type === 'pin') {
      if (!/^\d{4}$/.test(value)) {
        return setInvalid('The PIN must be exactly 4 digits long.');
      }
    }
  
    // Account number validation (exactly 6 digits)
    if (type === 'accountNumber') {
      if (!/^\d{6}$/.test(value)) {
        return setInvalid('The account number must be exactly 6 digits long.');
      }
    }
  
    // Transfer amount validation (must be a number greater than 0)
    if (type === 'transferAmount') {
      if (isNaN(value) || value <= 0) {
        return setInvalid('The transfer amount must be a number greater than 0.');
      }
    }
  
    return result;
  };
}

main();