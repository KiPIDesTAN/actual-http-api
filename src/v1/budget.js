
const { currentLocalDate, formatDateToISOString } = require('../utils/utils');
const { getActualApiClient } = require('./actual-client-provider');

async function Budget(budgetSyncId) {
  const actualApi = await getActualApiClient();
  await actualApi.downloadBudget(budgetSyncId);

  async function getMonths() {
    return actualApi.getBudgetMonths();
  }

  async function getMonth(month) {
    return actualApi.getBudgetMonth(month);
  }

  async function getMonthCategories(month) {
    const budgetMonth = await getMonth(month);
    const categories = [];
    budgetMonth.categoryGroups.forEach((categoryGroup) => categories.push(...categoryGroup.categories));
    return categories;
  }

  async function getMonthCategory(month, categoryId) {
    const categories = await getMonthCategories(month);
    return categories.find((category) => categoryId == category.id);
  }

  async function updateMonthCategory(month, categoryId, { budgeted, carryover }) {
    if (budgeted === undefined && carryover === undefined) {
          throw new Error('At least one field is required: budgeted or carryover');
    }
    if (budgeted !== undefined) {
      await actualApi.setBudgetAmount(month, categoryId, budgeted);
    }
    if (carryover !== undefined) {
      await actualApi.setBudgetCarryover(month, categoryId, carryover);
    }
  }

  async function getMonthCategoryGroups(month) {
    const budgetMonth = await actualApi.getBudgetMonth(month);
    const categoryGroups = [];
    budgetMonth.categoryGroups.forEach((categoryGroup) => categoryGroups.push(categoryGroup));
    return categoryGroups;
  }

  async function getMonthCategoryGroup(month, categoryGroupId) {
    const categoryGroups = await getMonthCategoryGroups(month);
    return categoryGroups.find((categoryGroup) => categoryGroupId == categoryGroup.id);
  }

  async function getAccounts() {
    return actualApi.getAccounts();
  }

  async function getAccount(accountId) {
    const accounts = await getAccounts();
    return accounts.find((account) => accountId == account.id);
  }

  async function createAccount(account) {
    return actualApi.createAccount(account);
  }

  async function updateAccount(accountId, account) {
    return actualApi.updateAccount(accountId, account);
  }

  async function deleteAccount(accountId) {
    return actualApi.deleteAccount(accountId);
  }

  async function closeAccount(accountId, {transferAccountId, transferCategoryId}) {
    return actualApi.closeAccount(accountId, transferAccountId, transferCategoryId);
  }

  async function reopenAccount(accountId) {
    return actualApi.reopenAccount(accountId);
  }

  async function getTransactions(accountId, sinceDate, optionalUntilDate) {
    const untilDate = optionalUntilDate || formatDateToISOString(currentLocalDate());
    return actualApi.getTransactions(accountId, sinceDate, untilDate);
  }

  async function addTransaction(accountId, transaction) {
    const transactionIds = await addTransactions(accountId, [transaction]);
    if (transactionIds && Array.isArray(transactionIds) && transactionIds.length > 0) {
      return transactionIds[0];
    }
    return transactionIds;
  }

  async function addTransactions(accountId, transactions) {
    return actualApi.addTransactions(accountId, transactions);
  }

  async function importTransactions(accountId, transactions) {
    return actualApi.importTransactions(accountId, transactions);
  }

  async function updateTransaction(transactionId, transaction) {
    return actualApi.updateTransaction(transactionId, {...transaction, id: transactionId});
  }

  async function deleteTransaction(transactionId) {
    return actualApi.deleteTransaction(transactionId);
  }

  async function getCategories() {
    return actualApi.getCategories();
  }

  async function getCategory(categoryId) {
    const categories = await getCategories();
    return categories.find((category) => categoryId == category.id);
  }

  async function createCategory(category) {
    return actualApi.createCategory(category);
  }

  async function updateCategory(categoryId, category) {
    return actualApi.updateCategory(categoryId, category);
  }

  async function deleteCategory(categoryId, {transferCategoryId}) {
    return actualApi.deleteCategory(categoryId, transferCategoryId);
  }

  async function createCategoryGroup(categoryGroup) {
    return actualApi.createCategoryGroup(categoryGroup);
  }

  async function updateCategoryGroup(categoryGroupId, categoryGroup) {
    return actualApi.updateCategoryGroup(categoryGroupId, categoryGroup);
  }

  async function deleteCategoryGroup(categoryGroupId, {transferCategoryId}) {
    return actualApi.deleteCategoryGroup(categoryGroupId, transferCategoryId);
  }

  async function getPayees() {
    return actualApi.getPayees();
  }

  async function createPayee(payee) {
    return actualApi.createPayee(payee);
  }

  async function updatePayee(payeeId, payee) {
    return actualApi.updatePayee(payeeId, payee);
  }

  async function deletePayee(payeeId) {
    return actualApi.deletePayee(payeeId);
  }

  async function addCategoryTransfer(month, {fromCategoryId, toCategoryId, amount}) {
    if (!(fromCategoryId || toCategoryId)) {
      throw new Error('At least one category id is required, either fromCategoryId or toCategoryId');
    }
    if (amount === undefined) {
      throw new Error('Amount is required');
    }

    if (fromCategoryId) {
      const fromMonthCategory = await getMonthCategory(month, fromCategoryId);
      if (!fromMonthCategory) {
        throw new Error(`Source category not found: ${fromCategoryId}`);
      }
      updateMonthCategory(month, fromCategoryId, { budgeted: fromMonthCategory.budgeted - amount });
    }
    if (toCategoryId) {
      const toMonthCategory = await getMonthCategory(month, toCategoryId);
      if (!toMonthCategory) {
        throw new Error(`Destination category not found: ${toCategoryId}`);
      }
      updateMonthCategory(month, toCategoryId, { budgeted: toMonthCategory.budgeted + amount });
    }
  }

  async function shutdown() {
    actualApi.shutdown();
  }

  return {
    getMonths: getMonths,
    getMonth: getMonth,
    getMonthCategories: getMonthCategories,
    getMonthCategory: getMonthCategory,
    updateMonthCategory: updateMonthCategory,
    getMonthCategoryGroups: getMonthCategoryGroups,
    getMonthCategoryGroup: getMonthCategoryGroup,
    getAccounts: getAccounts,
    getAccount: getAccount,
    createAccount: createAccount,
    updateAccount: updateAccount,
    deleteAccount: deleteAccount,
    closeAccount: closeAccount,
    reopenAccount: reopenAccount,
    getTransactions: getTransactions,
    addTransaction: addTransaction,
    addTransactions: addTransactions,
    updateTransaction: updateTransaction,
    deleteTransaction: deleteTransaction,
    importTransactions: importTransactions,
    getCategories: getCategories,
    getCategory: getCategory,
    createCategory: createCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
    createCategoryGroup: createCategoryGroup,
    updateCategoryGroup: updateCategoryGroup,
    deleteCategoryGroup: deleteCategoryGroup,
    getPayees: getPayees,
    createPayee: createPayee,
    updatePayee: updatePayee,
    deletePayee: deletePayee,
    addCategoryTransfer: addCategoryTransfer,
    shutdown: shutdown,
  };
}

exports.Budget = Budget;