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
  constructor({fullName, userName, transactions=[], interestRate, pin, accountNunber}) {
    this.fullName = fullName;
    this.userName = userName;
    this.transactions = transactions;
    this.interestRate = interestRate;
    this.pin = pin;
    this.accountNunber = accountNunber || this.generateAccountNumber();
  }

  generateAccountNumber() {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}

class BankAccountManager {
  constructor() {
    this.storageKey = 'users'; // Key to store all user and bank account data in localStorage
    this.currentUserKey = 'currentUser'; // Key for storing the logged-in user
    this.timeoutDuration = 60 * 60 * 1000; // 1-hour session timeout duration
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
    return this.storage.set(this.currentUserKey, user);
  }

}


function main() {
  // Page elements
  const dashboardPage = document.getElementById('dashboard-page');
  const loginPage = document.getElementById('login-page');
  const registerPage = document.getElementById('register-page');

  // Loader element
  const loader = document.getElementById('loader');

  // Sign in elements
  const signInContent = document.getElementById('sign-in-content');
  const signInForm = document.getElementById('sign-in-form');
  const signInUserInput = document.getElementById('sign-in-user-input');
  const signInPasswordInput = document.getElementById('sign-in-password-input');

  // Register elements
  const registerContent = document.getElementById('register-content');
  const registerForm = document.getElementById('register-form');
  const registerUserInput = document.getElementById('register-user-input');
  const registerPasswordInput = document.getElementById('register-password-input');
  
  // Dashboard elements
  const dashboardContent = document.getElementById('dashboard-content');

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
  }
  

}

main();