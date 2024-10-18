function main() {
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
}

main();