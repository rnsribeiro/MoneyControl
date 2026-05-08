package com.moneycontrol.mobile.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Category
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Done
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Paid
import androidx.compose.material.icons.outlined.Savings
import androidx.compose.material.icons.outlined.Sync
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.moneycontrol.mobile.data.model.CategoryRecord
import com.moneycontrol.mobile.data.model.DashboardSummary
import com.moneycontrol.mobile.data.model.ExpenseRecord
import com.moneycontrol.mobile.data.model.FinancePeriodFilter
import com.moneycontrol.mobile.data.model.FinanceSnapshot
import com.moneycontrol.mobile.data.model.GoalRecord
import com.moneycontrol.mobile.data.model.HistoryEntry
import com.moneycontrol.mobile.data.model.HistoryTypeFilter
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentRecord
import com.moneycontrol.mobile.data.model.MonthOption
import com.moneycontrol.mobile.data.model.RecentActivity
import com.moneycontrol.mobile.ui.shared.CurrencyText
import java.time.LocalDate

private enum class HomeTab(
    val label: String,
) {
    Dashboard("Dashboard"),
    Expenses("Despesas"),
    Incomes("Receitas"),
    Investments("Investimentos"),
    Goals("Metas"),
    History("Historico"),
    Categories("Categorias"),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onSignOut: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val filteredSnapshot = state.filteredSnapshot
    var selectedTab by rememberSaveable { mutableStateOf(HomeTab.Dashboard) }
    var activeEditor by remember { mutableStateOf<HomeEditor?>(null) }
    var deleteRequest by remember { mutableStateOf<DeleteRequest?>(null) }
    var paymentRequest by remember { mutableStateOf<ExpensePaymentRequest?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }

    val expenseCategories = state.snapshot.categories.filter { it.kind == "expense" }
    val incomeCategories = state.snapshot.categories.filter { it.kind == "income" }
    val investmentCategories = state.snapshot.categories.filter { it.kind == "investment" }

    LaunchedEffect(state.feedbackMessage) {
        val message = state.feedbackMessage ?: return@LaunchedEffect
        snackbarHostState.showSnackbar(message)
        viewModel.consumeFeedback()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("MoneyControl Mobile") },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Outlined.Sync, contentDescription = "Atualizar")
                    }
                    IconButton(onClick = { viewModel.signOut(onSignOut) }) {
                        Icon(Icons.AutoMirrored.Outlined.Logout, contentDescription = "Sair")
                    }
                },
            )
        },
        bottomBar = {
            NavigationBar {
                HomeTab.entries.forEach { tab ->
                    NavigationBarItem(
                        selected = tab == selectedTab,
                        onClick = { selectedTab = tab },
                        icon = {
                            Icon(
                                imageVector = when (tab) {
                                    HomeTab.Dashboard -> Icons.Outlined.AccountBalanceWallet
                                    HomeTab.Expenses -> Icons.Outlined.Paid
                                    HomeTab.Incomes -> Icons.Outlined.AccountBalanceWallet
                                    HomeTab.Investments -> Icons.Outlined.Savings
                                    HomeTab.Goals -> Icons.Outlined.Done
                                    HomeTab.History -> Icons.Outlined.History
                                    HomeTab.Categories -> Icons.Outlined.Category
                                },
                                contentDescription = tab.label,
                            )
                        },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        when {
            state.loading && state.snapshot == FinanceSnapshot() -> LoadingState(padding)
            state.loadError != null && state.snapshot == FinanceSnapshot() -> ErrorState(state.loadError ?: "", padding)
            else -> when (selectedTab) {
                HomeTab.Dashboard -> DashboardTab(
                    snapshot = filteredSnapshot,
                    summary = filteredSnapshot.summary,
                    recentActivities = filteredSnapshot.recentActivities,
                    selectedFilter = state.selectedFilter,
                    selectedMonthKey = state.selectedMonthKey,
                    availableMonthOptions = state.availableMonthOptions,
                    onFilterSelected = viewModel::setFilter,
                    onMonthSelected = viewModel::setSelectedMonth,
                    padding = padding,
                )
                HomeTab.Expenses -> ExpensesTab(
                    expenses = filteredSnapshot.expenses,
                    categories = expenseCategories,
                    selectedFilter = state.selectedFilter,
                    selectedMonthKey = state.selectedMonthKey,
                    availableMonthOptions = state.availableMonthOptions,
                    onFilterSelected = viewModel::setFilter,
                    onMonthSelected = viewModel::setSelectedMonth,
                    padding = padding,
                    onCreate = { activeEditor = HomeEditor.Expense(categories = expenseCategories) },
                    onEdit = { activeEditor = HomeEditor.Expense(initial = it, categories = expenseCategories) },
                    onDelete = { deleteRequest = DeleteRequest.Expense(it) },
                    onToggleStatus = { expense ->
                        val nextStatus = if (expense.remainingAmount <= 0) "pending" else "paid"
                        viewModel.toggleExpenseStatus(expense.id, nextStatus)
                    },
                    onRegisterPayment = { paymentRequest = ExpensePaymentRequest(it) },
                )
                HomeTab.Incomes -> IncomesTab(
                    incomes = filteredSnapshot.incomes,
                    categories = incomeCategories,
                    selectedFilter = state.selectedFilter,
                    selectedMonthKey = state.selectedMonthKey,
                    availableMonthOptions = state.availableMonthOptions,
                    onFilterSelected = viewModel::setFilter,
                    onMonthSelected = viewModel::setSelectedMonth,
                    padding = padding,
                    onCreate = { activeEditor = HomeEditor.Income(categories = incomeCategories) },
                    onEdit = { activeEditor = HomeEditor.Income(initial = it, categories = incomeCategories) },
                    onDelete = { deleteRequest = DeleteRequest.Income(it) },
                )
                HomeTab.Investments -> InvestmentsTab(
                    investments = filteredSnapshot.investments,
                    categories = investmentCategories,
                    selectedFilter = state.selectedFilter,
                    selectedMonthKey = state.selectedMonthKey,
                    availableMonthOptions = state.availableMonthOptions,
                    onFilterSelected = viewModel::setFilter,
                    onMonthSelected = viewModel::setSelectedMonth,
                    padding = padding,
                    onCreate = { activeEditor = HomeEditor.Investment(categories = investmentCategories) },
                    onEdit = { activeEditor = HomeEditor.Investment(initial = it, categories = investmentCategories) },
                    onDelete = { deleteRequest = DeleteRequest.Investment(it) },
                )
                HomeTab.Goals -> GoalsTab(
                    goals = state.snapshot.goals,
                    padding = padding,
                    onCreate = { activeEditor = HomeEditor.Goal() },
                    onEdit = { activeEditor = HomeEditor.Goal(it) },
                    onDelete = { deleteRequest = DeleteRequest.Goal(it) },
                )
                HomeTab.History -> HistoryTab(
                    entries = state.historyEntries,
                    typeFilter = state.historyTypeFilter,
                    searchTerm = state.historySearchTerm,
                    startDate = state.historyStartDate,
                    endDate = state.historyEndDate,
                    onTypeFilterChange = viewModel::setHistoryTypeFilter,
                    onSearchTermChange = viewModel::setHistorySearchTerm,
                    onStartDateChange = viewModel::setHistoryStartDate,
                    onEndDateChange = viewModel::setHistoryEndDate,
                    onClearFilters = viewModel::clearHistoryFilters,
                    padding = padding,
                )
                HomeTab.Categories -> CategoriesTab(
                    categories = state.snapshot.categories,
                    padding = padding,
                    onCreate = { activeEditor = HomeEditor.Category() },
                    onEdit = { activeEditor = HomeEditor.Category(it) },
                    onDelete = { deleteRequest = DeleteRequest.Category(it) },
                )
            }
        }
    }

    when (val editor = activeEditor) {
        is HomeEditor.Category -> CategoryEditorDialog(
            initial = editor.initial,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) viewModel.createCategory(input) else viewModel.updateCategory(editor.initial.id, input)
                activeEditor = null
            },
        )
        is HomeEditor.Expense -> ExpenseEditorDialog(
            initial = editor.initial,
            categories = editor.categories,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) viewModel.createExpense(input) else viewModel.updateExpense(editor.initial.id, input)
                activeEditor = null
            },
        )
        is HomeEditor.Income -> IncomeEditorDialog(
            initial = editor.initial,
            categories = editor.categories,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) viewModel.createIncome(input) else viewModel.updateIncome(editor.initial.id, input)
                activeEditor = null
            },
        )
        is HomeEditor.Investment -> InvestmentEditorDialog(
            initial = editor.initial,
            categories = editor.categories,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) viewModel.createInvestment(input) else viewModel.updateInvestment(editor.initial.id, input)
                activeEditor = null
            },
        )
        is HomeEditor.Goal -> GoalEditorDialog(
            initial = editor.initial,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) viewModel.createGoal(input) else viewModel.updateGoal(editor.initial.id, input)
                activeEditor = null
            },
        )
        null -> Unit
    }

    paymentRequest?.let { request ->
        ExpensePaymentDialog(
            request = request,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) paymentRequest = null },
            onSave = { amount, paymentDate ->
                viewModel.registerExpensePayment(request.expense.id, amount, paymentDate)
                paymentRequest = null
            },
        )
    }

    deleteRequest?.let { request ->
        DeleteConfirmationDialog(
            request = request,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) deleteRequest = null },
            onConfirm = {
                when (request) {
                    is DeleteRequest.Category -> viewModel.deleteCategory(request.item.id)
                    is DeleteRequest.Expense -> viewModel.deleteExpense(request.item.id)
                    is DeleteRequest.Income -> viewModel.deleteIncome(request.item.id)
                    is DeleteRequest.Investment -> viewModel.deleteInvestment(request.item.id)
                    is DeleteRequest.Goal -> viewModel.deleteGoal(request.item.id)
                }
                deleteRequest = null
            },
        )
    }
}

@Composable
private fun DashboardTab(
    snapshot: FinanceSnapshot,
    summary: DashboardSummary,
    recentActivities: List<RecentActivity>,
    selectedFilter: FinancePeriodFilter,
    selectedMonthKey: String,
    availableMonthOptions: List<MonthOption>,
    onFilterSelected: (FinancePeriodFilter) -> Unit,
    onMonthSelected: (String) -> Unit,
    padding: PaddingValues,
) {
    val trendPoints = buildTrendPoints(snapshot.incomes, snapshot.expenses, snapshot.investments)
    val categoryTotals = buildExpenseCategoryTotals(snapshot.expenses)
    val incomeTotals = buildIncomeSourceTotals(snapshot.incomes)
    val incomeVsExpenseTotals = buildIncomeVsExpenseTotals(summary)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            FilterHeader(
                title = "Dashboard",
                description = "Resumo do caixa, das contas e dos objetivos financeiros.",
                selectedFilter = selectedFilter,
                selectedMonthKey = selectedMonthKey,
                availableMonthOptions = availableMonthOptions,
                onFilterSelected = onFilterSelected,
                onMonthSelected = onMonthSelected,
            )
        }
        item { SummaryCard("Em caixa", summary.cashOnHand) }
        item {
            TwoColumnMetrics(
                "Recebido" to summary.receivedIncome,
                "A receber" to summary.expectedIncome,
            )
        }
        item {
            TwoColumnMetrics(
                "Pago em despesas" to summary.paidExpenses,
                "Ainda em aberto" to summary.pendingExpenses,
            )
        }
        item {
            TwoColumnMetrics(
                "Investimentos" to summary.totalInvested,
                "Reservado para metas" to summary.goalReserved,
            )
        }
        item {
            TwoColumnMetrics(
                "Saldo" to summary.balance,
                "Taxa de poupanca" to summary.savingsRate.toDouble(),
                secondAsPercent = true,
            )
        }
        item { TrendChartCard(trendPoints) }
        item {
            DonutBreakdownCard(
                title = "Receitas x despesas",
                description = "Compare o volume total de entradas e saidas no periodo selecionado.",
                emptyMessage = "Sem dados suficientes para o grafico.",
                percentageLabel = "movimentacoes",
                items = incomeVsExpenseTotals,
            )
        }
        item {
            DonutBreakdownCard(
                title = "Despesas por categoria",
                description = "Entenda rapidamente onde o dinheiro esta concentrado.",
                emptyMessage = "Sem despesas para visualizar por categoria.",
                percentageLabel = "despesas",
                items = categoryTotals,
            )
        }
        item {
            DonutBreakdownCard(
                title = "Receitas por origem",
                description = "Veja com clareza quais fontes estao trazendo mais dinheiro para o caixa.",
                emptyMessage = "Sem receitas para visualizar por origem.",
                percentageLabel = "receitas",
                items = incomeTotals,
            )
        }
        item {
            Text(
                text = "Atividades recentes",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
        }
        if (recentActivities.isEmpty()) {
            item { EmptyMessage("Nenhuma movimentacao recente encontrada para este periodo.") }
        } else {
            items(recentActivities, key = { "${it.type}-${it.id}" }) { activity ->
                ActivityCard(activity)
            }
        }
    }
}

@Composable
private fun ExpensesTab(
    expenses: List<ExpenseRecord>,
    categories: List<CategoryRecord>,
    selectedFilter: FinancePeriodFilter,
    selectedMonthKey: String,
    availableMonthOptions: List<MonthOption>,
    onFilterSelected: (FinancePeriodFilter) -> Unit,
    onMonthSelected: (String) -> Unit,
    padding: PaddingValues,
    onCreate: () -> Unit,
    onEdit: (ExpenseRecord) -> Unit,
    onDelete: (ExpenseRecord) -> Unit,
    onToggleStatus: (ExpenseRecord) -> Unit,
    onRegisterPayment: (ExpenseRecord) -> Unit,
) {
    val paidAmount = expenses.sumOf { it.normalizedPaidAmount }
    val pendingAmount = expenses.sumOf { it.remainingAmount }
    val overdueCount = expenses.count { isOverdue(it) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            FilterHeader(
                title = "Despesas",
                description = "Controle vencimentos, pagamentos totais e pagamentos parciais.",
                selectedFilter = selectedFilter,
                selectedMonthKey = selectedMonthKey,
                availableMonthOptions = availableMonthOptions,
                onFilterSelected = onFilterSelected,
                onMonthSelected = onMonthSelected,
                buttonLabel = "Nova despesa",
                onButtonClick = onCreate,
            )
        }
        item {
            TwoColumnMetrics(
                "Pago" to paidAmount,
                "Ainda falta" to pendingAmount,
            )
        }
        item { CountCard("Contas vencidas", overdueCount) }
        if (categories.isEmpty()) {
            item { EmptyMessage("Crie uma categoria de despesa para cadastrar contas.") }
        }
        if (expenses.isEmpty()) {
            item { EmptyMessage("Nenhuma despesa cadastrada para este periodo.") }
        } else {
            items(expenses, key = { it.id }) { expense ->
                ExpenseCard(
                    expense = expense,
                    onEdit = onEdit,
                    onDelete = onDelete,
                    onToggleStatus = onToggleStatus,
                    onRegisterPayment = onRegisterPayment,
                )
            }
        }
    }
}

@Composable
private fun IncomesTab(
    incomes: List<IncomeRecord>,
    categories: List<CategoryRecord>,
    selectedFilter: FinancePeriodFilter,
    selectedMonthKey: String,
    availableMonthOptions: List<MonthOption>,
    onFilterSelected: (FinancePeriodFilter) -> Unit,
    onMonthSelected: (String) -> Unit,
    padding: PaddingValues,
    onCreate: () -> Unit,
    onEdit: (IncomeRecord) -> Unit,
    onDelete: (IncomeRecord) -> Unit,
) {
    val receivedAmount = incomes.filter { it.status == "received" }.sumOf { it.amount }
    val expectedAmount = incomes.filter { it.status == "expected" }.sumOf { it.amount }
    val incomeTotals = buildIncomeSourceTotals(incomes)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            FilterHeader(
                title = "Receitas",
                description = "Registre valores recebidos e valores previstos.",
                selectedFilter = selectedFilter,
                selectedMonthKey = selectedMonthKey,
                availableMonthOptions = availableMonthOptions,
                onFilterSelected = onFilterSelected,
                onMonthSelected = onMonthSelected,
                buttonLabel = "Nova receita",
                onButtonClick = onCreate,
            )
        }
        item {
            TwoColumnMetrics(
                "Recebido" to receivedAmount,
                "A receber" to expectedAmount,
            )
        }
        if (incomeTotals.isNotEmpty()) {
            item {
                DonutBreakdownCard(
                    title = "Receitas por origem",
                    description = "Acompanhe quais fontes geram mais entradas no periodo selecionado.",
                    emptyMessage = "Sem receitas para visualizar por origem.",
                    percentageLabel = "receitas",
                    items = incomeTotals,
                )
            }
        }
        if (categories.isEmpty()) {
            item { EmptyMessage("Crie uma categoria de receita para cadastrar entradas.") }
        }
        if (incomes.isEmpty()) {
            item { EmptyMessage("Nenhuma receita cadastrada para este periodo.") }
        } else {
            items(incomes, key = { it.id }) { income ->
                IncomeCard(income, onEdit, onDelete)
            }
        }
    }
}

@Composable
private fun InvestmentsTab(
    investments: List<InvestmentRecord>,
    categories: List<CategoryRecord>,
    selectedFilter: FinancePeriodFilter,
    selectedMonthKey: String,
    availableMonthOptions: List<MonthOption>,
    onFilterSelected: (FinancePeriodFilter) -> Unit,
    onMonthSelected: (String) -> Unit,
    padding: PaddingValues,
    onCreate: () -> Unit,
    onEdit: (InvestmentRecord) -> Unit,
    onDelete: (InvestmentRecord) -> Unit,
) {
    val investedAmount = investments.sumOf { it.amount }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            FilterHeader(
                title = "Investimentos",
                description = "Acompanhe aportes, corretoras e objetivos.",
                selectedFilter = selectedFilter,
                selectedMonthKey = selectedMonthKey,
                availableMonthOptions = availableMonthOptions,
                onFilterSelected = onFilterSelected,
                onMonthSelected = onMonthSelected,
                buttonLabel = "Novo investimento",
                onButtonClick = onCreate,
            )
        }
        item { SummaryCard("Aportes do periodo", investedAmount) }
        if (categories.isEmpty()) {
            item { EmptyMessage("Crie uma categoria de investimento para cadastrar aportes.") }
        }
        if (investments.isEmpty()) {
            item { EmptyMessage("Nenhum investimento cadastrado para este periodo.") }
        } else {
            items(investments, key = { it.id }) { investment ->
                InvestmentCard(investment, onEdit, onDelete)
            }
        }
    }
}

@Composable
private fun GoalsTab(
    goals: List<GoalRecord>,
    padding: PaddingValues,
    onCreate: () -> Unit,
    onEdit: (GoalRecord) -> Unit,
    onDelete: (GoalRecord) -> Unit,
) {
    val reservedTotal = goals.sumOf { it.currentAmount }
    val targetTotal = goals.sumOf { it.targetAmount }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ActionHeader(
                title = "Metas",
                description = "Acompanhe sonhos, desejos e reservas financeiras com progresso percentual.",
                buttonLabel = "Nova meta",
                onClick = onCreate,
            )
        }
        item {
            TwoColumnMetrics(
                "Ja reservado" to reservedTotal,
                "Valor-alvo" to targetTotal,
            )
        }
        if (goals.isEmpty()) {
            item { EmptyMessage("Nenhuma meta cadastrada.") }
        } else {
            items(goals, key = { it.id }) { goal ->
                GoalCard(goal, onEdit, onDelete)
            }
        }
    }
}

@Composable
private fun HistoryTab(
    entries: List<HistoryEntry>,
    typeFilter: HistoryTypeFilter,
    searchTerm: String,
    startDate: String,
    endDate: String,
    onTypeFilterChange: (HistoryTypeFilter) -> Unit,
    onSearchTermChange: (String) -> Unit,
    onStartDateChange: (String) -> Unit,
    onEndDateChange: (String) -> Unit,
    onClearFilters: () -> Unit,
    padding: PaddingValues,
) {
    val totalIncome = entries.filter { it.type == "income" }.sumOf { it.amount }
    val totalExpense = entries.filter { it.type == "expense" }.sumOf { it.amount }
    val totalInvestment = entries.filter { it.type == "investment" }.sumOf { it.amount }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Text("Historico", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Text(
                        "Consulte entradas, saidas e investimentos em um so lugar com filtro por tipo, intervalo e termo.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        HistoryTypeFilter.entries.forEach { filter ->
                            FilterChip(
                                selected = filter == typeFilter,
                                onClick = { onTypeFilterChange(filter) },
                                label = { Text(filter.label) },
                            )
                        }
                    }
                    OutlinedTextField(
                        value = searchTerm,
                        onValueChange = onSearchTermChange,
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Buscar por termo") },
                        placeholder = { Text("Descricao, categoria, status ou observacao") },
                        singleLine = true,
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        OutlinedTextField(
                            value = startDate,
                            onValueChange = onStartDateChange,
                            modifier = Modifier.weight(1f),
                            label = { Text("Data inicial") },
                            placeholder = { Text("2026-05-01") },
                            singleLine = true,
                        )
                        OutlinedTextField(
                            value = endDate,
                            onValueChange = onEndDateChange,
                            modifier = Modifier.weight(1f),
                            label = { Text("Data final") },
                            placeholder = { Text("2026-05-31") },
                            singleLine = true,
                        )
                    }
                    TextButton(onClick = onClearFilters) { Text("Limpar filtros") }
                }
            }
        }
        item { TwoColumnMetrics("Entradas" to totalIncome, "Saidas" to totalExpense) }
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Investimentos", totalInvestment, Modifier.weight(1f))
                CountCard("Total de lancamentos", entries.size, Modifier.weight(1f))
            }
        }
        if (entries.isEmpty()) {
            item { EmptyMessage("Nenhum lancamento encontrado para os filtros selecionados.") }
        } else {
            items(entries, key = { "${it.type}-${it.id}" }) { entry ->
                HistoryEntryCard(entry)
            }
        }
    }
}

@Composable
private fun CategoriesTab(
    categories: List<CategoryRecord>,
    padding: PaddingValues,
    onCreate: () -> Unit,
    onEdit: (CategoryRecord) -> Unit,
    onDelete: (CategoryRecord) -> Unit,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ActionHeader(
                title = "Categorias",
                description = "Gerencie categorias de despesas, receitas e investimentos.",
                buttonLabel = "Nova categoria",
                onClick = onCreate,
            )
        }
        if (categories.isEmpty()) {
            item { EmptyMessage("Nenhuma categoria cadastrada.") }
        } else {
            items(categories, key = { it.id }) { category ->
                CategoryCard(category, onEdit, onDelete)
            }
        }
    }
}

@Composable
private fun HistoryEntryCard(entry: HistoryEntry) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(entry.title, fontWeight = FontWeight.SemiBold)
                    Text(entry.secondaryLabel ?: entry.category, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                AssistChip(
                    onClick = {},
                    label = {
                        Text(
                            when (entry.type) {
                                "income" -> "Entrada"
                                "expense" -> "Saida"
                                else -> "Investimento"
                            },
                        )
                    },
                )
            }
            CurrencyText(amount = entry.amount, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(
                "${entry.category} - ${entry.date}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(entry.status, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            if (!entry.notes.isNullOrBlank()) {
                Text(entry.notes, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun FilterHeader(
    title: String,
    description: String,
    selectedFilter: FinancePeriodFilter,
    selectedMonthKey: String,
    availableMonthOptions: List<MonthOption>,
    onFilterSelected: (FinancePeriodFilter) -> Unit,
    onMonthSelected: (String) -> Unit,
    buttonLabel: String? = null,
    onButtonClick: (() -> Unit)? = null,
) {
    var monthMenuExpanded by remember { mutableStateOf(false) }
    val selectedMonthLabel = availableMonthOptions.firstOrNull { it.key == selectedMonthKey }?.label ?: selectedMonthKey

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            Text(description, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FinancePeriodFilter.entries.forEach { filter ->
                    FilterChip(
                        selected = filter == selectedFilter,
                        onClick = { onFilterSelected(filter) },
                        label = { Text(filter.label) },
                    )
                }
            }
            if (selectedFilter == FinancePeriodFilter.SPECIFIC_MONTH && availableMonthOptions.isNotEmpty()) {
                Box {
                    Button(onClick = { monthMenuExpanded = true }) { Text(selectedMonthLabel) }
                    DropdownMenu(
                        expanded = monthMenuExpanded,
                        onDismissRequest = { monthMenuExpanded = false },
                    ) {
                        availableMonthOptions.forEach { option ->
                            DropdownMenuItem(
                                text = { Text(option.label) },
                                onClick = {
                                    onMonthSelected(option.key)
                                    monthMenuExpanded = false
                                },
                            )
                        }
                    }
                }
            }
            if (buttonLabel != null && onButtonClick != null) {
                Button(onClick = onButtonClick) {
                    Icon(Icons.Outlined.Add, contentDescription = null)
                    Text(buttonLabel, modifier = Modifier.padding(start = 8.dp))
                }
            }
        }
    }
}

@Composable
private fun ActionHeader(
    title: String,
    description: String,
    buttonLabel: String,
    onClick: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            Text(description, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Button(onClick = onClick) {
                Icon(Icons.Outlined.Add, contentDescription = null)
                Text(buttonLabel, modifier = Modifier.padding(start = 8.dp))
            }
        }
    }
}

@Composable
private fun CategoryCard(
    category: CategoryRecord,
    onEdit: (CategoryRecord) -> Unit,
    onDelete: (CategoryRecord) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    Text(category.name, fontWeight = FontWeight.SemiBold)
                    Text(category.slug, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                AssistChip(onClick = {}, label = { Text(category.kind) })
            }
            ActionButtons(onEdit = { onEdit(category) }, onDelete = { onDelete(category) })
        }
    }
}

@Composable
private fun ExpenseCard(
    expense: ExpenseRecord,
    onEdit: (ExpenseRecord) -> Unit,
    onDelete: (ExpenseRecord) -> Unit,
    onToggleStatus: (ExpenseRecord) -> Unit,
    onRegisterPayment: (ExpenseRecord) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(expense.title, fontWeight = FontWeight.SemiBold)
            Text("${expense.categoryName} - ${expense.paymentMethod}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            CurrencyText(amount = expense.amount, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(
                "Pago ${expense.normalizedPaidAmount.formatMoney()} de ${expense.amount.formatMoney()} - ${expenseStatusLabel(expense)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                if (expense.dueDate != null) {
                    "Vencimento em ${expense.dueDate}. Restam ${expense.remainingAmount.formatMoney()}."
                } else {
                    "Despesa sem vencimento. Restam ${expense.remainingAmount.formatMoney()}."
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(
                    onClick = { onToggleStatus(expense) },
                    label = { Text(if (expense.remainingAmount <= 0) "Marcar pendente" else "Quitar despesa") },
                    leadingIcon = {
                        Icon(
                            imageVector = if (expense.remainingAmount <= 0) Icons.Outlined.Sync else Icons.Outlined.Done,
                            contentDescription = null,
                        )
                    },
                )
                if (expense.remainingAmount > 0) {
                    AssistChip(onClick = { onRegisterPayment(expense) }, label = { Text("Registrar pagamento") })
                }
            }
            ActionButtons(onEdit = { onEdit(expense) }, onDelete = { onDelete(expense) })
        }
    }
}

@Composable
private fun IncomeCard(
    income: IncomeRecord,
    onEdit: (IncomeRecord) -> Unit,
    onDelete: (IncomeRecord) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(income.title, fontWeight = FontWeight.SemiBold)
            Text(income.source, color = MaterialTheme.colorScheme.onSurfaceVariant)
            CurrencyText(amount = income.amount, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(
                "Previsto para ${income.expectedDate} - ${if (income.status == "received") "Recebido" else "A receber"}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            ActionButtons(onEdit = { onEdit(income) }, onDelete = { onDelete(income) })
        }
    }
}

@Composable
private fun InvestmentCard(
    investment: InvestmentRecord,
    onEdit: (InvestmentRecord) -> Unit,
    onDelete: (InvestmentRecord) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(investment.name, fontWeight = FontWeight.SemiBold)
            Text("${investment.type} - ${investment.broker}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            CurrencyText(amount = investment.amount, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text("Meta: ${investment.goal}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            ActionButtons(onEdit = { onEdit(investment) }, onDelete = { onDelete(investment) })
        }
    }
}

@Composable
private fun GoalCard(
    goal: GoalRecord,
    onEdit: (GoalRecord) -> Unit,
    onDelete: (GoalRecord) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(goal.title, fontWeight = FontWeight.SemiBold)
            Text(
                goal.targetDate?.let { "Prazo: $it" } ?: "Meta sem prazo final definido",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Alvo", goal.targetAmount, Modifier.weight(1f))
                CompactSummaryCard("Reservado", goal.currentAmount, Modifier.weight(1f))
            }
            Text(
                "Faltam ${goal.remainingAmount.formatMoney()} - progresso de ${goal.progressPercentage}%",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            goal.notes?.takeIf { it.isNotBlank() }?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            ActionButtons(onEdit = { onEdit(goal) }, onDelete = { onDelete(goal) })
        }
    }
}

@Composable
private fun ActionButtons(
    onEdit: () -> Unit,
    onDelete: () -> Unit,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        TextButton(onClick = onEdit) {
            Icon(Icons.Outlined.Edit, contentDescription = null)
            Text("Editar", modifier = Modifier.padding(start = 6.dp))
        }
        TextButton(onClick = onDelete) {
            Icon(Icons.Outlined.Delete, contentDescription = null)
            Text("Excluir", modifier = Modifier.padding(start = 6.dp))
        }
    }
}

@Composable
private fun SummaryCard(label: String, value: Double) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant)
            CurrencyText(amount = value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun TwoColumnMetrics(
    first: Pair<String, Double>,
    second: Pair<String, Double>,
    secondAsPercent: Boolean = false,
) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        CompactSummaryCard(first.first, first.second, Modifier.weight(1f))
        if (secondAsPercent) {
            PercentSummaryCard(second.first, second.second.toInt(), Modifier.weight(1f))
        } else {
            CompactSummaryCard(second.first, second.second, Modifier.weight(1f))
        }
    }
}

@Composable
private fun CompactSummaryCard(label: String, value: Double, modifier: Modifier = Modifier) {
    Card(modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            CurrencyText(amount = value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun PercentSummaryCard(label: String, value: Int, modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            Text("$value%", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun CountCard(label: String, count: Int, modifier: Modifier = Modifier) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            Text(count.toString(), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ActivityCard(activity: RecentActivity) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(activity.title, fontWeight = FontWeight.SemiBold)
            Text("${activity.category} - ${activity.type}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            CurrencyText(amount = activity.amount, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text("${activity.date} - ${activity.status}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun EmptyMessage(message: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Text(text = message, modifier = Modifier.padding(16.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun LoadingState(padding: PaddingValues) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator(modifier = Modifier.padding(start = 24.dp))
    }
}

@Composable
private fun ErrorState(message: String, padding: PaddingValues) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(text = message, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyLarge)
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

private fun isOverdue(expense: ExpenseRecord): Boolean {
    if (expense.remainingAmount <= 0) {
        return false
    }
    val dueDate = expense.dueDate?.let { runCatching { LocalDate.parse(it) }.getOrNull() } ?: return false
    return dueDate.isBefore(LocalDate.now())
}

private fun Double.formatMoney(): String = "R$ %.2f".format(this)
