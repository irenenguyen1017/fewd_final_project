// Test data: use to populate localStorage with default users
const defaultUsers = [
  {
    fullName: 'Jessica Davis',
    userName: 'user1',
    accountNumber: 123456,
    transactions: [
      { type: 'deposit', amount: 500, date: '2024-10-01T13:15:33.035Z' },
      { type: 'withdrawal', amount: 200, date: '2024-10-05T09:48:16.867Z' },
      { type: 'deposit', amount: 100, date: '2024-10-07T14:11:59.604Z' },
      { type: 'loan', amount: 800, date: '2024-10-15T17:01:17.194Z' },
      { type: 'deposit', amount: 300, date: '2024-10-18T23:36:17.929Z' },
    ],
    interestRate: 1.5,
    pin: 1111,
  },
  {
    fullName: 'Michael Johnson',
    userName: 'user2',
    accountNumber: 234567,
    transactions: [
      { type: 'deposit', amount: 900, date: '2024-09-25T11:24:33.035Z' },
      { type: 'withdrawal', amount: 200, date: '2024-09-28T14:48:16.867Z' },
      { type: 'deposit', amount: 500, date: '2024-09-30T10:11:59.604Z' },
      { type: 'loan', amount: 600, date: '2024-10-19T09:01:17.194Z' },
      { type: 'deposit', amount: 400, date: '2024-10-20T12:36:17.929Z' },
    ],
    interestRate: 2.0,
    pin: 2222,
  },
  {
    fullName: 'Emily Clark',
    userName: 'user3',
    accountNumber: 345678,
    transactions: [
      { type: 'deposit', amount: 1000, date: '2024-10-03T13:55:33.035Z' },
      { type: 'withdrawal', amount: 300, date: '2024-10-06T16:35:16.867Z' },
      { type: 'deposit', amount: 200, date: '2024-10-09T18:20:59.604Z' },
      { type: 'loan', amount: 1200, date: '2024-10-14T21:01:17.194Z' },
      { type: 'deposit', amount: 500, date: '2024-10-19T23:10:17.929Z' },
    ],
    interestRate: 1.8,
    pin: 3333,
  },
];

// StorageManager class handles localStorage operations
class StorageManager {
  // Add a new item (key-value pair) to localStorage
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Get an item's value from localStorage by key
  get(key) {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : null;
  }

  // Remove an item from localStorage by key
  remove(key) {
    localStorage.removeItem(key);
  }
}

// BankAccountUser class defines a user and their banking details
class BankAccountUser {
  constructor({ fullName, userName, transactions = [], pin }) {
    this.fullName = fullName; // User's full name
    this.userName = userName; // Unique username
    this.transactions = transactions; // Initializes user's transaction history
    this.pin = pin; // Assigns the user's pin
    this.accountNumber = this.generateAccountNumber(); // Generates a unique account number for the user
    this.interestRate = this.generateInterestRate(); // Generates a random interest rate for each user
  }

  generateAccountNumber() {
    return Math.floor(Math.random() * 900000 + 100000);
  }

  generateInterestRate() {
    return (Math.random() * 3).toFixed(2);
  }
}

// BankAccountManager class handles operations like login, registration, and transactions (transfer, loan) or delete account
class BankAccountManager {
  constructor() {
    this.storageKey = 'users'; // Key to store all user and bank account data in localStorage
    this.currentUserKey = 'currentUser'; // Key for storing the logged-in user
    this.storage = new StorageManager(); // Use StorageManager for all localStorage operations

    // Initialize with default users if no users exist in localStorage
    this.setDefaultUsers();
  }

  // Load default users if localStorage is empty
  setDefaultUsers() {
    const users = this.getUsers();

    if (!users || users.length === 0) {
      this.setUsers(defaultUsers);
    }
  }

  // Check if the current user is authenticated
  isAuthenticated() {
    const currentUser = this.getCurrentUser();
    return !!currentUser;
  }

  // Register a new user if they don't already exist
  register({ data, onSuccess, onError }) {
    const users = this.getUsers();
    const { fullName, userName, pin } = data;

    // Check if username already exists
    const existingUser = users.find((user) => user.userName === userName);

    if (existingUser) {
      onError('User already registered');
      return;
    }

    // Create new user
    const newUser = new BankAccountUser({
      fullName,
      userName,
      pin: Number(pin),
    });

    // Save the new user and set as the current user
    users.push(newUser);

    this.setUsers(users);

    this.setCurrentUser(newUser);

    onSuccess();
  }

  // Log in a user based on username and pin
  login({ data, onSuccess, onError }) {
    const { userName, pin } = data;
    const users = this.getUsers();

    // Find the user based on username and pin
    const user = users.find(
      (user) => user.userName === userName && user.pin === pin
    );

    if (!user) {
      onError('Invalid user name or pin');
      return;
    }

    // Set the current user
    this.setCurrentUser(user);

    onSuccess();
  }

  // Log out the current user
  logout({ onSuccess, onError }) {
    if (!this.isAuthenticated()) {
      onError('User is not authenticated');
      return;
    }

    // Remove the current user from localStorage
    this.storage.remove(this.currentUserKey);
    onSuccess();
  }

  // Delete the current user's account if the username and pin match
  deleteAccount({ data, onSuccess, onError }) {
    const { userName, pin } = data;
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();

    // Validate user credentials
    if (currentUser.userName !== userName || currentUser.pin !== pin) {
      onError('Invalid user name or pin');
      return;
    }

    // Filter out the deleted user from the users array
    const updatedUsers = users.filter((user) => user.userName !== userName);

    this.setUsers(updatedUsers);

    onSuccess();
  }

  // Calculate the current user's balance based on transactions
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

  // Get a summary of the current user's transactions: incomes, outcomes, and interest
  getTransactionSummary() {
    const user = this.getCurrentUser();

    const incomes = user.transactions
      .filter(
        (transaction) =>
          transaction.type === 'deposit' || transaction.type === 'loan'
      )
      .reduce((total, transaction) => total + transaction.amount, 0);

    const outcomes = user.transactions
      .filter((transaction) => transaction.type === 'withdrawal')
      .reduce((total, transaction) => total + transaction.amount, 0);

    const interest = user.transactions
      .filter((transaction) => transaction.type === 'loan')
      .map((transaction) => (transaction.amount * user.interestRate) / 100)
      .reduce((total, amount) => total + amount, 0);

    return { incomes, outcomes, interest };
  }

  // Transfer money between accounts
  transferMoney({ data, onSuccess, onError }) {
    const { toAccountNumber, amount } = data;

    const currentUser = this.getCurrentUser();
    const recipient = this.findUserByAccountNumber(toAccountNumber);

    // Validate recipient account and ensure current user has sufficient balance
    if (!recipient) {
      onError(`Recipient account ${toAccountNumber} not found`);
      return;
    }

    if (currentUser.accountNumber === recipient.accountNumber) {
      onError('Cannot transfer money to your own account');
      return;
    }

    const currentUserBalance = this.calculateBalance();

    if (currentUserBalance < amount) {
      onError('You do not have enough balance to transfer');
      return;
    }

    // Process the transfer: deduct from sender, add to recipient
    currentUser.transactions.push({
      type: 'withdrawal',
      amount,
      date: new Date().toISOString(),
    });

    recipient.transactions.push({
      type: 'deposit',
      amount,
      date: new Date().toISOString(),
    });

    // Update both user records
    this.updateUserData(currentUser);

    this.updateUserData(recipient);

    onSuccess();
  }

  // Process a loan for the current user
  loan({ data, onSuccess }) {
    const { amount } = data;
    const currentUser = this.getCurrentUser();

    // Add a loan transaction
    currentUser.transactions.push({
      type: 'loan',
      amount,
      date: new Date().toISOString(),
    });

    // Update new record
    this.updateUserData(currentUser);
    onSuccess();
  }

  // Retrieve all users from localStorage
  getUsers() {
    return this.storage.get(this.storageKey) ?? [];
  }

  // Store all users into localStorage
  setUsers(users) {
    this.storage.set(this.storageKey, users);
  }

  // Retrieve the current logged-in user from localStorage
  getCurrentUser() {
    const currentUser = this.storage.get(this.currentUserKey);

    const users = this.getUsers();

    return currentUser
      ? users.find((user) => user.userName === currentUser.userName)
      : null;
  }

  // Set the current logged-in user into localStorage
  setCurrentUser(user) {
    const { userName, accountNumber } = user;

    return this.storage.set(this.currentUserKey, { userName, accountNumber });
  }

  // Update new record data in the users array and localStorage
  updateUserData(user) {
    const users = this.getUsers();

    const updatedUsers = users.map((existingUser) =>
      existingUser.userName === user.userName ? user : existingUser
    );

    this.setUsers(updatedUsers);
  }

  // Find a user by their account number
  findUserByAccountNumber(accountNumber) {
    const users = this.getUsers();
    return users.find((user) => user.accountNumber === accountNumber);
  }
}

function main() {
  // Select the dashboard page element
  const dashboardPage = document.getElementById('dashboard-page');

  // Sign-in form elements for handling user login
  const signInForm = document.getElementById('sign-in-form');
  const signInUserInput = document.getElementById('sign-in-user-input');
  const signInPasswordInput = document.getElementById('sign-in-password-input');

  // Sign-out button for logging out the current user
  const signOutButton = document.getElementById('sign-out-button');

  // Registration form elements for new user registration
  const registerForm = document.getElementById('register-form');
  const registerFullNameInput = document.getElementById(
    'register-full-name-input'
  );
  const registerUserInput = document.getElementById('register-user-input');
  const registerPasswordInput = document.getElementById(
    'register-password-input'
  );

  // Elements to display the current date and user's balance on the dashboard
  const currentDate = document.getElementById('current-date');
  const currentBalance = document.getElementById('current-balance');

  // Transactions element for displaying the user's transaction history
  const transactions = document.getElementById('transactions');

  // Element to display the user's account number on the dashboard
  const accountNumber = document.getElementById('account-number');

  // Elements for displaying a summary of transactions (income, expenses, and interest)
  const summaryValueIn = document.getElementById('summary-value-in');
  const summaryValueOut = document.getElementById('summary-value-out');
  const summaryValueInterest = document.getElementById(
    'summary-value-interest'
  );

  // Transfer form elements for handling money transfer between accounts
  const transferForm = document.getElementById('transfer-form');
  const transferUserInput = document.getElementById('transfer-user-input');
  const transferAmountInput = document.getElementById('transfer-amount-input');

  // Loan form elements for handling loan operations
  const loanForm = document.getElementById('loan-form');
  const loanAmountInput = document.getElementById('loan-amount-input');

  // Delete account form elements for handling account deletion
  const deleteForm = document.getElementById('delete-form');
  const deleteAccountInput = document.getElementById('delete-account-input');
  const deleletAccountPasswordInput = document.getElementById(
    'delete-account-password-input'
  );

  // Initialize the BankAccountManager class to handle banking operations
  const bankAccountManager = new BankAccountManager();

  // Function to initialize the app by checking if the user is authenticated
  function initialize() {
    const isAuthenticated = bankAccountManager.isAuthenticated();

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

  // Sign-in function triggered on form submission
  function signIn(event) {
    event.preventDefault();

    const validateUserName = validateInput('userName', signInUserInput.value, {
      maxLength: 12,
    });

    // Validate the username input
    if (!validateUserName.isValid) {
      alert(validateUserName.message);
      return;
    }

    const validatePin = validateInput('pin', signInPasswordInput.value);

    // Validate the PIN input
    if (!validatePin.isValid) {
      alert(validatePin.message);
      return;
    }

    // Get the username and PIN from the user input
    const data = {
      userName: signInUserInput.value,
      pin: Number(signInPasswordInput.value),
    };

    // Use login method from BankAccountManager class to authenticate the user
    bankAccountManager.login({
      data,
      onSuccess: () => {
        window.location.href = 'index.html'; // Redirect to the dashboard page on successful login
      },
      onError: (message) => {
        alert(message); // Show an alert message on login error
      },
    });
  }

  // Attach the signIn function to the form submission event only if the form exists
  if (signInForm) {
    signInForm.addEventListener('submit', signIn);
  }

  // Register user function triggered on form submission
  function registerUser(event) {
    event.preventDefault();

    const validateFullName = validateInput(
      'fullName',
      registerFullNameInput.value,
      { maxLength: 50 }
    );

    // Validate the full name input
    if (!validateFullName.isValid) {
      alert(validateFullName.message);
      return;
    }

    const validateUserName = validateInput(
      'userName',
      registerUserInput.value,
      { maxLength: 12 }
    );

    // Validate the username input
    if (!validateUserName.isValid) {
      alert(validateUserName.message);
      return;
    }

    const validatePin = validateInput('pin', registerPasswordInput.value);

    // Validate the PIN input
    if (!validatePin.isValid) {
      alert(validatePin.message);
      return;
    }

    // Get the full name, username, and PIN from the user input
    const data = {
      fullName: registerFullNameInput.value,
      userName: registerUserInput.value,
      pin: Number(registerPasswordInput.value),
    };

    // Use the register method from BankAccountManager class to create a new user
    bankAccountManager.register({
      data,
      onSuccess: () => {
        window.location.href = 'index.html'; // Redirect to the dashboard page on successful registration
      },
      onError: (message) => {
        alert(message); // Show an alert message on registration error
      },
    });
  }

  // Attach the registerUser function to the form submission event only if the form exists
  if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
  }

  // Sign-out function triggered on button click
  function signOut(event) {
    event.preventDefault();

    bankAccountManager.logout({
      onSuccess: () => {
        window.location.href = 'login.html'; // Redirect to the login page on successful logout
      },
      onError: (message) => {
        alert(message); // Show an alert message on logout error
      },
    });
  }

  // Attach the signOut function to the button click event only if the button exists
  if (signOutButton) {
    signOutButton.addEventListener('click', signOut);
  }

  // Update the dashboard UI with the current user's data
  function updateUI() {
    displayBalance();
    displayTransactions();
    displayTransactionsSummary();
    displayAccountNumber();
  }

  // Display the current user's account number on the dashboard
  function displayAccountNumber() {
    accountNumber.textContent =
      bankAccountManager.getCurrentUser().accountNumber;
  }

  // Display the current user's balance on the dashboard
  function displayBalance() {
    const balance = bankAccountManager.calculateBalance();
    currentBalance.textContent = formatCurrency(balance);
    currentDate.textContent = formatDate(new Date());
  }

  // Display a summary of the current user's transactions: incomes, outcomes, and interest
  function displayTransactionsSummary() {
    const transaction = bankAccountManager.getTransactionSummary();
    summaryValueIn.textContent = formatCurrency(transaction.incomes);
    summaryValueOut.textContent = formatCurrency(transaction.outcomes);
    summaryValueInterest.textContent = formatCurrency(transaction.interest);
  }

  // Display the current user's transaction history on the dashboard
  function displayTransactions() {
    const transactionsList = bankAccountManager
      .getCurrentUser()
      .transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

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
    });

    // Update the transactions element with the new content
    transactions.innerHTML = transactionsContent;
  }

  // Transfer money operation between accounts
  function transfer(event) {
    event.preventDefault();

    // Validate the recipient account number
    const validateAccountNumber = validateInput(
      'accountNumber',
      transferUserInput.value
    );

    if (!validateAccountNumber.isValid) {
      alert(validateAccountNumber.message);
      return;
    }

    // Validate the transfer amount
    const validateAmount = validateInput(
      'transferAmount',
      transferAmountInput.value
    );

    // Validate the transfer amount input
    if (!validateAmount.isValid) {
      alert(validateAmount.message);
      return;
    }

    // Get the recipient account number and transfer amount from the user input
    const data = {
      toAccountNumber: Number(transferUserInput.value),
      amount: Number(transferAmountInput.value),
    };

    // Use the transferMoney method from BankAccountManager class to transfer money
    bankAccountManager.transferMoney({
      data,
      onSuccess: () => {
        updateUI();
        transferUserInput.value = '';
        transferAmountInput.value = '';
      },
      onError: (message) => {
        alert(message);
      },
    });
  }

  // Attach the transfer function to the form submission event only if the form exists
  if (transferForm) {
    transferForm.addEventListener('submit', transfer);
  }

  // Loan operation to request a loan from the bank
  function loan(event) {
    event.preventDefault();

    // Validate the loan amount input
    const validateAmount = validateInput(
      'transferAmount',
      loanAmountInput.value
    );

    // Validate the loan amount input
    if (!validateAmount.isValid) {
      alert(validateAmount.message);
      return;
    }

    // Get the loan amount from the user input
    const data = {
      amount: Number(loanAmountInput.value),
    };

    // Use the loan method from BankAccountManager class to request a loan
    bankAccountManager.loan({
      data,
      onSuccess: () => {
        updateUI();
        loanAmountInput.value = '';
      },
    });
  }

  // Attach the loan function to the form submission event only if the form exists
  if (loanForm) {
    loanForm.addEventListener('submit', loan);
  }

  // Delete account operation to delete the current user's account
  function deleteAccount(event) {
    event.preventDefault();

    // Validate the username input
    const validateUserName = validateInput(
      'userName',
      deleteAccountInput.value,
      { maxLength: 12 }
    );

    if (!validateUserName.isValid) {
      alert(validateUserName.message);
      return;
    }
    // Validate the PIN input
    const validatePin = validateInput('pin', deleletAccountPasswordInput.value);

    if (!validatePin.isValid) {
      alert(validatePin.message);
      return;
    }

    // Get the username and PIN from the user input
    const data = {
      userName: deleteAccountInput.value,
      pin: Number(deleletAccountPasswordInput.value),
    };

    // Confirm account deletion before proceeding
    const shouldDelete = confirm(
      'Are you sure you want to delete your account?'
    );

    if (!shouldDelete) {
      return;
    }

    // Use the deleteAccount method from BankAccountManager class to delete the account
    bankAccountManager.deleteAccount({
      data,
      onError: (message) => {
        alert(message);
      },
      onSuccess: () => {
        window.location.href = 'login.html';
      },
    });
  }

  // Attach the deleteAccount function to the form submission event only if the form exists
  if (deleteForm) {
    deleteForm.addEventListener('submit', deleteAccount);
  }

  // Helper functions for formatting
  function formatDate(date) {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Format the date passed
  function formatDatePass(date) {
    const calcDaysPassed = (date1, date2) =>
      Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date(), date);

    console.log(daysPassed);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return formatDate(date);
  }

  // Format the currency
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  }

  // Validation function to validate user input based on type and rules
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
        return setInvalid(
          'The full name should contain alphabetic characters only.'
        );
      }

      if (maxLength !== undefined && value.length > maxLength) {
        return setInvalid(
          `The full name should not exceed ${maxLength} characters.`
        );
      }
    }

    // Username validation (max 12 characters, alphabet only)
    if (type === 'userName') {
      const regex = /^[a-z0-9]+$/; // Lowercase alphabet and numbers only
      const { maxLength = 12 } = rules;

      if (!regex.test(value)) {
        return setInvalid(
          'The username should contain lowercase alphabetic characters and numbers only.'
        );
      }

      if (value.length > maxLength) {
        return setInvalid(
          `The username must not exceed ${maxLength} characters.`
        );
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
        return setInvalid(
          'The transfer amount must be a number greater than 0.'
        );
      }
    }

    return result;
  }
}

main();
