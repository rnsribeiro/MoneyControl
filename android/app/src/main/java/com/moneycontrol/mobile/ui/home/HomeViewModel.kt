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
    val loadError: String? = null,
    val feedbackMessage: String? = null,
) {
    val availableMonthOptions: List<MonthOption>
        get() = snapshot.availableMonthOptions()

    val filteredSnapshot: FinanceSnapshot
        get() = snapshot.filterBy(selectedFilter, selectedMonthKey)
}

class HomeViewModel(
    private val financeRepository: FinanceRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun refresh() {
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    loading = true,
                    loadError = null,
                )
            }
            runCatching {
                financeRepository.loadSnapshot()
            }.onSuccess { snapshot ->
                _uiState.value = _uiState.value.copy(
                    loading = false,
                    snapshot = snapshot,
                    loadError = null,
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    loading = false,
                    loadError = "Não foi possível carregar os dados financeiros.",
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

    fun createCategory(input: CategoryMutation) = performMutation("Categoria salva com sucesso.") {
        financeRepository.createCategory(input)
    }

    fun updateCategory(id: String, input: CategoryMutation) =
        performMutation("Categoria atualizada com sucesso.") {
            financeRepository.updateCategory(id, input)
        }

    fun deleteCategory(id: String) = performMutation("Categoria excluída com sucesso.") {
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

    fun deleteExpense(id: String) = performMutation("Despesa excluída com sucesso.") {
        financeRepository.deleteExpense(id)
    }

    fun createIncome(input: IncomeMutation) = performMutation("Receita salva com sucesso.") {
        financeRepository.createIncome(input)
    }

    fun updateIncome(id: String, input: IncomeMutation) =
        performMutation("Receita atualizada com sucesso.") {
            financeRepository.updateIncome(id, input)
        }

    fun deleteIncome(id: String) = performMutation("Receita excluída com sucesso.") {
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

    fun deleteInvestment(id: String) = performMutation("Investimento excluído com sucesso.") {
        financeRepository.deleteInvestment(id)
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
                    feedbackMessage = error.message ?: "Não foi possível concluir a operação.",
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
        return copy(summary = buildSummary(expenses, incomes, investments))
    }

    val filteredExpenses = expenses.filter { expense ->
        dateMatches(expense.dueDate, filter, selectedMonthKey)
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
        summary = buildSummary(filteredExpenses, filteredIncomes, filteredInvestments),
        expenses = filteredExpenses,
        incomes = filteredIncomes,
        investments = filteredInvestments,
        categories = categories,
        recentActivities = filteredActivities.take(6),
    )
}

private fun FinanceSnapshot.availableMonthOptions(): List<MonthOption> {
    val locale = Locale.forLanguageTag("pt-BR")
    val monthKeys = buildSet {
        expenses.mapTo(this) { monthKey(it.dueDate) }
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
        MonthOption(
            key = key,
            label = formatMonthLabel(key, locale),
        )
    }
}

private fun buildSummary(
    expenses: List<ExpenseRecord>,
    incomes: List<IncomeRecord>,
    investments: List<InvestmentRecord>,
): DashboardSummary {
    val receivedIncome = incomes.filter { it.status == "received" }.sumOf { it.amount }
    val expectedIncome = incomes.filter { it.status == "expected" }.sumOf { it.amount }
    val totalIncome = receivedIncome + expectedIncome
    val totalExpenses = expenses.sumOf { it.amount }
    val paidExpenses = expenses.filter { it.status == "paid" }.sumOf { it.amount }
    val pendingExpenses = expenses.filter { it.status != "paid" }.sumOf { it.amount }
    val totalInvested = investments.sumOf { it.amount }

    return DashboardSummary(
        totalIncome = totalIncome,
        receivedIncome = receivedIncome,
        expectedIncome = expectedIncome,
        totalExpenses = totalExpenses,
        paidExpenses = paidExpenses,
        pendingExpenses = pendingExpenses,
        totalInvested = totalInvested,
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

private fun dateMatches(
    value: String,
    filter: FinancePeriodFilter,
    selectedMonthKey: String,
): Boolean {
    val parsedDate = runCatching { LocalDate.parse(value) }.getOrNull() ?: return false
    val now = LocalDate.now()

    return when (filter) {
        FinancePeriodFilter.ALL_TIME -> true
        FinancePeriodFilter.CURRENT_MONTH -> {
            parsedDate.year == now.year && parsedDate.month == now.month
        }
        FinancePeriodFilter.CURRENT_YEAR -> {
            parsedDate.year == now.year
        }
        FinancePeriodFilter.SPECIFIC_MONTH -> {
            monthKey(value) == selectedMonthKey
        }
    }
}

private fun currentMonthKey(): String {
    val now = LocalDate.now()
    return "${now.year}-${now.monthValue.toString().padStart(2, '0')}"
}

private fun monthKey(value: String): String {
    val parsedDate = runCatching { LocalDate.parse(value) }.getOrNull() ?: return ""
    return "${parsedDate.year}-${parsedDate.monthValue.toString().padStart(2, '0')}"
}

private fun formatMonthLabel(value: String, locale: Locale): String {
    val parsedDate = runCatching { LocalDate.parse("$value-01") }.getOrNull()
        ?: return value

    val month = parsedDate.month.getDisplayName(TextStyle.FULL, locale)
        .replaceFirstChar { if (it.isLowerCase()) it.titlecase(locale) else it.toString() }

    return "$month ${parsedDate.year}"
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
