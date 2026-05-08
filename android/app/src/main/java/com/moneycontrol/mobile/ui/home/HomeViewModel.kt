package com.moneycontrol.mobile.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.moneycontrol.mobile.data.model.CategoryMutation
import com.moneycontrol.mobile.data.model.DashboardSummary
import com.moneycontrol.mobile.data.model.ExpenseMutation
import com.moneycontrol.mobile.data.model.ExpenseRecord
import com.moneycontrol.mobile.data.model.FinancePeriodFilter
import com.moneycontrol.mobile.data.model.FinanceSnapshot
import com.moneycontrol.mobile.data.model.GoalMutation
import com.moneycontrol.mobile.data.model.HistoryEntry
import com.moneycontrol.mobile.data.model.HistoryTypeFilter
import com.moneycontrol.mobile.data.model.IncomeMutation
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentMutation
import com.moneycontrol.mobile.data.model.InvestmentRecord
import com.moneycontrol.mobile.data.model.MonthOption
import com.moneycontrol.mobile.data.repository.AuthRepository
import com.moneycontrol.mobile.data.repository.FinanceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

data class HomeUiState(
    val loading: Boolean = true,
    val submitting: Boolean = false,
    val snapshot: FinanceSnapshot = FinanceSnapshot(),
    val selectedFilter: FinancePeriodFilter = FinancePeriodFilter.ALL_TIME,
    val selectedMonthKey: String = currentMonthKey(),
    val historyTypeFilter: HistoryTypeFilter = HistoryTypeFilter.ALL,
    val historySearchTerm: String = "",
    val historyStartDate: String = "",
    val historyEndDate: String = "",
    val loadError: String? = null,
    val feedbackMessage: String? = null,
) {
    val availableMonthOptions: List<MonthOption>
        get() = snapshot.availableMonthOptions()

    val filteredSnapshot: FinanceSnapshot
        get() = snapshot.filterBy(selectedFilter, selectedMonthKey)

    val historyEntries: List<HistoryEntry>
        get() = filteredSnapshot.buildHistoryEntries().filterHistory(
            typeFilter = historyTypeFilter,
            searchTerm = historySearchTerm,
            startDate = historyStartDate,
            endDate = historyEndDate,
        )
}

class HomeViewModel(
    private val financeRepository: FinanceRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, loadError = null) }
            runCatching { financeRepository.loadSnapshot() }
                .onSuccess { snapshot ->
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        snapshot = snapshot,
                        loadError = null,
                    )
                }
                .onFailure {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        loadError = "Nao foi possivel carregar os dados financeiros.",
                    )
                }
        }
    }

    fun setFilter(filter: FinancePeriodFilter) {
        _uiState.update { state ->
            state.copy(
                selectedFilter = filter,
                selectedMonthKey = if (filter == FinancePeriodFilter.SPECIFIC_MONTH) {
                    state.availableMonthOptions.firstOrNull()?.key ?: state.selectedMonthKey
                } else {
                    state.selectedMonthKey
                },
            )
        }
    }

    fun setSelectedMonth(monthKey: String) {
        _uiState.update {
            it.copy(
                selectedFilter = FinancePeriodFilter.SPECIFIC_MONTH,
                selectedMonthKey = monthKey,
            )
        }
    }

    fun setHistoryTypeFilter(filter: HistoryTypeFilter) {
        _uiState.update { it.copy(historyTypeFilter = filter) }
    }

    fun setHistorySearchTerm(term: String) {
        _uiState.update { it.copy(historySearchTerm = term) }
    }

    fun setHistoryStartDate(date: String) {
        _uiState.update { it.copy(historyStartDate = date) }
    }

    fun setHistoryEndDate(date: String) {
        _uiState.update { it.copy(historyEndDate = date) }
    }

    fun clearHistoryFilters() {
        _uiState.update {
            it.copy(
                historyTypeFilter = HistoryTypeFilter.ALL,
                historySearchTerm = "",
                historyStartDate = "",
                historyEndDate = "",
            )
        }
    }

    fun createCategory(input: CategoryMutation) = performMutation("Categoria salva com sucesso.") {
        financeRepository.createCategory(input)
    }

    fun updateCategory(id: String, input: CategoryMutation) =
        performMutation("Categoria atualizada com sucesso.") {
            financeRepository.updateCategory(id, input)
        }

    fun deleteCategory(id: String) = performMutation("Categoria excluida com sucesso.") {
        financeRepository.deleteCategory(id)
    }

    fun createExpense(input: ExpenseMutation) = performMutation("Despesa salva com sucesso.") {
        financeRepository.createExpense(input)
    }

    fun updateExpense(id: String, input: ExpenseMutation) =
        performMutation("Despesa atualizada com sucesso.") {
            financeRepository.updateExpense(id, input)
        }

    fun toggleExpenseStatus(id: String, status: String) = performMutation(
        if (status == "paid") "Despesa marcada como paga." else "Despesa marcada como pendente.",
    ) {
        financeRepository.updateExpenseStatus(id, status)
    }

    fun registerExpensePayment(id: String, amount: Double, paymentDate: String) = performMutation(
        "Pagamento parcial registrado com sucesso.",
    ) {
        financeRepository.registerExpensePayment(id, amount, paymentDate)
    }

    fun deleteExpense(id: String) = performMutation("Despesa excluida com sucesso.") {
        financeRepository.deleteExpense(id)
    }

    fun createIncome(input: IncomeMutation) = performMutation("Receita salva com sucesso.") {
        financeRepository.createIncome(input)
    }

    fun updateIncome(id: String, input: IncomeMutation) =
        performMutation("Receita atualizada com sucesso.") {
            financeRepository.updateIncome(id, input)
        }

    fun deleteIncome(id: String) = performMutation("Receita excluida com sucesso.") {
        financeRepository.deleteIncome(id)
    }

    fun createInvestment(input: InvestmentMutation) =
        performMutation("Investimento salvo com sucesso.") {
            financeRepository.createInvestment(input)
        }

    fun updateInvestment(id: String, input: InvestmentMutation) =
        performMutation("Investimento atualizado com sucesso.") {
            financeRepository.updateInvestment(id, input)
        }

    fun deleteInvestment(id: String) = performMutation("Investimento excluido com sucesso.") {
        financeRepository.deleteInvestment(id)
    }

    fun createGoal(input: GoalMutation) = performMutation("Meta salva com sucesso.") {
        financeRepository.createGoal(input)
    }

    fun updateGoal(id: String, input: GoalMutation) = performMutation("Meta atualizada com sucesso.") {
        financeRepository.updateGoal(id, input)
    }

    fun deleteGoal(id: String) = performMutation("Meta excluida com sucesso.") {
        financeRepository.deleteGoal(id)
    }

    fun consumeFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }

    fun signOut(onDone: () -> Unit) {
        viewModelScope.launch {
            authRepository.signOut()
            onDone()
        }
    }

    fun reset() {
        _uiState.value = HomeUiState()
    }

    private fun performMutation(successMessage: String, action: suspend () -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(submitting = true, feedbackMessage = null) }
            runCatching {
                action()
                financeRepository.loadSnapshot()
            }.onSuccess { snapshot ->
                _uiState.value = _uiState.value.copy(
                    submitting = false,
                    snapshot = snapshot,
                    loadError = null,
                    feedbackMessage = successMessage,
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    submitting = false,
                    feedbackMessage = error.message ?: "Nao foi possivel concluir a operacao.",
                )
            }
        }
    }
}

private fun FinanceSnapshot.filterBy(
    filter: FinancePeriodFilter,
    selectedMonthKey: String,
): FinanceSnapshot {
    if (filter == FinancePeriodFilter.ALL_TIME) {
        return copy(summary = buildSummary(expenses, incomes, investments, goals))
    }

    val filteredExpenses = expenses.filter { expense ->
        dateMatches(expense.dueDate ?: expense.expenseDate, filter, selectedMonthKey)
    }
    val filteredIncomes = incomes.filter { income ->
        dateMatches(incomeFilterDate(income), filter, selectedMonthKey)
    }
    val filteredInvestments = investments.filter { investment ->
        dateMatches(investment.investmentDate, filter, selectedMonthKey)
    }
    val filteredActivities = recentActivities.filter { activity ->
        dateMatches(activity.date, filter, selectedMonthKey)
    }

    return FinanceSnapshot(
        summary = buildSummary(filteredExpenses, filteredIncomes, filteredInvestments, goals),
        expenses = filteredExpenses,
        incomes = filteredIncomes,
        investments = filteredInvestments,
        goals = goals,
        categories = categories,
        recentActivities = filteredActivities.take(6),
    )
}

private fun FinanceSnapshot.availableMonthOptions(): List<MonthOption> {
    val locale = Locale.forLanguageTag("pt-BR")
    val monthKeys = buildSet {
        expenses.mapTo(this) { monthKey(it.dueDate ?: it.expenseDate) }
        incomes.mapTo(this) { monthKey(incomeFilterDate(it)) }
        investments.mapTo(this) { monthKey(it.investmentDate) }
    }
        .filter { it.isNotBlank() }
        .sortedDescending()

    if (monthKeys.isEmpty()) {
        val fallback = currentMonthKey()
        return listOf(MonthOption(fallback, formatMonthLabel(fallback, locale)))
    }

    return monthKeys.map { key ->
        MonthOption(key = key, label = formatMonthLabel(key, locale))
    }
}

private fun FinanceSnapshot.buildHistoryEntries(): List<HistoryEntry> {
    val items = buildList {
        incomes.forEach {
            add(
                HistoryEntry(
                    id = it.id,
                    title = it.title,
                    amount = it.amount,
                    date = incomeFilterDate(it),
                    category = it.source,
                    type = "income",
                    status = if (it.status == "received") "Recebido" else "A receber",
                    notes = it.notes,
                    secondaryLabel = if (it.status == "received") {
                        "Recebido em ${incomeFilterDate(it)}"
                    } else {
                        "Previsto para ${it.expectedDate}"
                    },
                ),
            )
        }
        expenses.forEach {
            add(
                HistoryEntry(
                    id = it.id,
                    title = it.title,
                    amount = it.amount,
                    date = it.dueDate ?: it.expenseDate,
                    category = it.categoryName,
                    type = "expense",
                    status = expenseStatusLabel(it),
                    notes = it.notes,
                    secondaryLabel = "Pago ${formatCurrencyPart(it.normalizedPaidAmount)} de ${formatCurrencyPart(it.amount)}",
                ),
            )
        }
        investments.forEach {
            add(
                HistoryEntry(
                    id = it.id,
                    title = it.name,
                    amount = it.amount,
                    date = it.investmentDate,
                    category = it.type,
                    type = "investment",
                    status = "Investido",
                    notes = it.notes,
                    secondaryLabel = "${it.broker} - ${it.goal}",
                ),
            )
        }
    }

    return items.sortedByDescending { it.date }
}

private fun List<HistoryEntry>.filterHistory(
    typeFilter: HistoryTypeFilter,
    searchTerm: String,
    startDate: String,
    endDate: String,
): List<HistoryEntry> {
    val normalizedTerm = searchTerm.trim().lowercase(Locale.forLanguageTag("pt-BR"))
    val start = parseLocalDateOrNull(startDate)
    val end = parseLocalDateOrNull(endDate)
    val rangeStart = if (start != null && end != null && start.isAfter(end)) end else start
    val rangeEnd = if (start != null && end != null && start.isAfter(end)) start else end

    return filter { entry ->
        val entryDate = parseLocalDateOrNull(entry.date)
        val matchesType = when (typeFilter) {
            HistoryTypeFilter.ALL -> true
            HistoryTypeFilter.INCOME -> entry.type == "income"
            HistoryTypeFilter.EXPENSE -> entry.type == "expense"
            HistoryTypeFilter.INVESTMENT -> entry.type == "investment"
        }
        val matchesTerm = if (normalizedTerm.isBlank()) {
            true
        } else {
            listOf(entry.title, entry.category, entry.status, entry.notes, entry.secondaryLabel)
                .filterNotNull()
                .joinToString(" ")
                .lowercase(Locale.forLanguageTag("pt-BR"))
                .contains(normalizedTerm)
        }
        val matchesStart = if (rangeStart == null || entryDate == null) true else !entryDate.isBefore(rangeStart)
        val matchesEnd = if (rangeEnd == null || entryDate == null) true else !entryDate.isAfter(rangeEnd)

        matchesType && matchesTerm && matchesStart && matchesEnd
    }
}

private fun buildSummary(
    expenses: List<ExpenseRecord>,
    incomes: List<IncomeRecord>,
    investments: List<InvestmentRecord>,
    goals: List<com.moneycontrol.mobile.data.model.GoalRecord>,
): DashboardSummary {
    val receivedIncome = incomes.filter { it.status == "received" }.sumOf { it.amount }
    val expectedIncome = incomes.filter { it.status == "expected" }.sumOf { it.amount }
    val totalIncome = receivedIncome + expectedIncome
    val totalExpenses = expenses.sumOf { it.amount }
    val paidExpenses = expenses.sumOf { it.normalizedPaidAmount }
    val pendingExpenses = expenses.sumOf { it.remainingAmount }
    val totalInvested = investments.sumOf { it.amount }
    val goalReserved = goals.sumOf { it.currentAmount }

    return DashboardSummary(
        totalIncome = totalIncome,
        receivedIncome = receivedIncome,
        expectedIncome = expectedIncome,
        totalExpenses = totalExpenses,
        paidExpenses = paidExpenses,
        pendingExpenses = pendingExpenses,
        totalInvested = totalInvested,
        goalReserved = goalReserved,
        balance = totalIncome - totalExpenses - totalInvested,
        cashOnHand = receivedIncome - paidExpenses - totalInvested,
        savingsRate = if (receivedIncome > 0) ((totalInvested / receivedIncome) * 100).toInt() else 0,
    )
}

private fun incomeFilterDate(income: IncomeRecord): String {
    return if (income.status == "received") {
        income.actualReceivedAt ?: income.receivedAt
    } else {
        income.expectedDate
    }
}

private fun expenseStatusLabel(expense: ExpenseRecord): String {
    return when {
        isOverdue(expense) -> "Vencida"
        expense.remainingAmount <= 0 -> "Pago"
        expense.normalizedPaidAmount > 0 -> "Parcial"
        else -> "Pendente"
    }
}

private fun dateMatches(
    value: String,
    filter: FinancePeriodFilter,
    selectedMonthKey: String,
): Boolean {
    val parsedDate = parseLocalDateOrNull(value) ?: return false
    val now = LocalDate.now()

    return when (filter) {
        FinancePeriodFilter.ALL_TIME -> true
        FinancePeriodFilter.CURRENT_MONTH -> parsedDate.year == now.year && parsedDate.month == now.month
        FinancePeriodFilter.CURRENT_YEAR -> parsedDate.year == now.year
        FinancePeriodFilter.SPECIFIC_MONTH -> monthKey(value) == selectedMonthKey
    }
}

private fun currentMonthKey(): String {
    val now = LocalDate.now()
    return "${now.year}-${now.monthValue.toString().padStart(2, '0')}"
}

private fun monthKey(value: String): String {
    val parsedDate = parseLocalDateOrNull(value) ?: return ""
    return "${parsedDate.year}-${parsedDate.monthValue.toString().padStart(2, '0')}"
}

private fun formatMonthLabel(value: String, locale: Locale): String {
    val parsedDate = parseLocalDateOrNull("$value-01") ?: return value
    val month = parsedDate.month.getDisplayName(TextStyle.FULL, locale)
        .replaceFirstChar { if (it.isLowerCase()) it.titlecase(locale) else it.toString() }
    return "$month ${parsedDate.year}"
}

private fun parseLocalDateOrNull(value: String?): LocalDate? {
    return value?.takeIf { it.isNotBlank() }?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
}

private fun isOverdue(expense: ExpenseRecord): Boolean {
    if (expense.remainingAmount <= 0) {
        return false
    }
    val dueDate = parseLocalDateOrNull(expense.dueDate) ?: return false
    return dueDate.isBefore(LocalDate.now())
}

private fun formatCurrencyPart(value: Double): String {
    return "R$ %.2f".format(Locale.US, value)
}

class HomeViewModelFactory(
    private val financeRepository: FinanceRepository,
    private val authRepository: AuthRepository,
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return HomeViewModel(financeRepository, authRepository) as T
    }
}
