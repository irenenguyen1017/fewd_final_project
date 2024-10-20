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

    const newUser = new BankAccountUser({fullName, userName, pin, interestRate: this.generateInterestRate()});

    users.push(newUser);

    this.setUsers(users);

    this.setCurrentUser(newUser);

    onSuccess();
  }

  login({data, onSuccess, onError}) {
    const {userName, pin} = data;
    const users = this.getUsers();

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
    if(!this.isAuthenticated()) {
      onError('User is not authenticated');
      return;
    };

    const {userName, pin} = data;
    const users = this.getUsers();
    const user = users.find(user => user.userName === userName && user.pin === pin);

    if(!user) {
      onError('Invalid user name or pin');
      return;
    }

    const updatedUsers = users.filter(user => user.userName !== userName);
    this.setUsers(updatedUsers);

    this.logout();

    onSuccess();
  }

  calculateBalance() {
    const currentUser = this.getCurrentUser();
    const transactions = currentUser.transactions;
    const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    return balance;
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
    return this.storage.get(this.currentUserKey);
  }
  
  setCurrentUser(user) {
    const { userName, accountNumber } = user;

    return this.storage.set(this.currentUserKey, { userName, accountNumber});
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

    if (isAuthenticated) {
      if (!dashboardPage) {
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

    const data = {
      userName: signInUserInput.value,
      pin: signInPasswordInput.value
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

    const data = {
      fullName: registerFullNameInput.value,
      userName: registerUserInput.value,
      pin: registerPasswordInput.value
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

  function displayBalance() {   
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

  

  

}

main();