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
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentRecord
import com.moneycontrol.mobile.data.model.MonthOption
import com.moneycontrol.mobile.data.model.RecentActivity
import com.moneycontrol.mobile.ui.shared.CurrencyText

private enum class HomeTab(
    val label: String,
) {
    Dashboard("Dashboard"),
    Expenses("Despesas"),
    Incomes("Receitas"),
    Investments("Investimentos"),
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
                    IconButton(
                        onClick = {
                            viewModel.signOut(onSignOut)
                        },
                    ) {
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
                    onCreate = {
                        activeEditor = HomeEditor.Expense(categories = expenseCategories)
                    },
                    onEdit = {
                        activeEditor = HomeEditor.Expense(initial = it, categories = expenseCategories)
                    },
                    onDelete = { deleteRequest = DeleteRequest.Expense(it) },
                    onToggleStatus = { expense ->
                        val nextStatus = if (expense.status == "paid") "pending" else "paid"
                        viewModel.toggleExpenseStatus(expense.id, nextStatus)
                    },
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
                    onCreate = {
                        activeEditor = HomeEditor.Income(categories = incomeCategories)
                    },
                    onEdit = {
                        activeEditor = HomeEditor.Income(initial = it, categories = incomeCategories)
                    },
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
                    onCreate = {
                        activeEditor = HomeEditor.Investment(categories = investmentCategories)
                    },
                    onEdit = {
                        activeEditor = HomeEditor.Investment(initial = it, categories = investmentCategories)
                    },
                    onDelete = { deleteRequest = DeleteRequest.Investment(it) },
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
                if (editor.initial == null) {
                    viewModel.createCategory(input)
                } else {
                    viewModel.updateCategory(editor.initial.id, input)
                }
                activeEditor = null
            },
        )
        is HomeEditor.Expense -> ExpenseEditorDialog(
            initial = editor.initial,
            categories = editor.categories,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) {
                    viewModel.createExpense(input)
                } else {
                    viewModel.updateExpense(editor.initial.id, input)
                }
                activeEditor = null
            },
        )
        is HomeEditor.Income -> IncomeEditorDialog(
            initial = editor.initial,
            categories = editor.categories,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) {
                    viewModel.createIncome(input)
                } else {
                    viewModel.updateIncome(editor.initial.id, input)
                }
                activeEditor = null
            },
        )
        is HomeEditor.Investment -> InvestmentEditorDialog(
            initial = editor.initial,
            categories = editor.categories,
            submitting = state.submitting,
            onDismiss = { if (!state.submitting) activeEditor = null },
            onSave = { input ->
                if (editor.initial == null) {
                    viewModel.createInvestment(input)
                } else {
                    viewModel.updateInvestment(editor.initial.id, input)
                }
                activeEditor = null
            },
        )
        null -> Unit
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
                description = "Resumo do seu caixa e das movimentações recentes.",
                selectedFilter = selectedFilter,
                selectedMonthKey = selectedMonthKey,
                availableMonthOptions = availableMonthOptions,
                onFilterSelected = onFilterSelected,
                onMonthSelected = onMonthSelected,
            )
        }
        item {
            SummaryCard("Em caixa", summary.cashOnHand)
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Recebido", summary.receivedIncome, Modifier.weight(1f))
                CompactSummaryCard("A receber", summary.expectedIncome, Modifier.weight(1f))
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Pago", summary.paidExpenses, Modifier.weight(1f))
                CompactSummaryCard("Pendente", summary.pendingExpenses, Modifier.weight(1f))
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Investido", summary.totalInvested, Modifier.weight(1f))
                CompactSummaryCard("Saldo", summary.balance, Modifier.weight(1f))
            }
        }
        item {
            CountCard("Taxa de poupança", summary.savingsRate)
        }
        item {
            TrendChartCard(trendPoints)
        }
        item {
            DonutBreakdownCard(
                title = "Receitas x despesas",
                description = "Compare o volume total de entradas e saídas no período selecionado.",
                emptyMessage = "Sem dados suficientes para o gráfico.",
                percentageLabel = "movimentações",
                items = incomeVsExpenseTotals,
            )
        }
        item {
            DonutBreakdownCard(
                title = "Despesas por categoria",
                description = "Entenda rapidamente onde seu dinheiro está concentrado.",
                emptyMessage = "Sem despesas para visualizar por categoria.",
                percentageLabel = "despesas",
                items = categoryTotals,
            )
        }
        item {
            DonutBreakdownCard(
                title = "Receitas por origem",
                description = "Veja com clareza quais fontes estão trazendo mais dinheiro para o seu caixa.",
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
            item {
                EmptyMessage("Nenhuma movimentação recente encontrada para este período.")
            }
        } else {
            items(recentActivities, key = { it.id }) { activity ->
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
) {
    val paidAmount = expenses.filter { it.status == "paid" }.sumOf { it.amount }
    val pendingAmount = expenses.filter { it.status != "paid" }.sumOf { it.amount }
    val overdueCount = expenses.count { it.status == "overdue" }

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
                description = "Controle vencimentos, pagamentos e status das contas.",
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Pago", paidAmount, Modifier.weight(1f))
                CompactSummaryCard("Pendente", pendingAmount, Modifier.weight(1f))
            }
        }
        item {
            CountCard("Contas vencidas", overdueCount)
        }
        if (categories.isEmpty()) {
            item {
                EmptyMessage("Crie uma categoria de despesa para cadastrar contas.")
            }
        }
        if (expenses.isEmpty()) {
            item {
                EmptyMessage("Nenhuma despesa cadastrada para este período.")
            }
        } else {
            items(expenses, key = { it.id }) { expense ->
                ExpenseCard(expense, onEdit, onDelete, onToggleStatus)
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                CompactSummaryCard("Recebido", receivedAmount, Modifier.weight(1f))
                CompactSummaryCard("A receber", expectedAmount, Modifier.weight(1f))
            }
        }
        if (incomeTotals.isNotEmpty()) {
            item {
                DonutBreakdownCard(
                    title = "Receitas por origem",
                    description = "Acompanhe quais fontes geram mais entradas no período selecionado.",
                    emptyMessage = "Sem receitas para visualizar por origem.",
                    percentageLabel = "receitas",
                    items = incomeTotals,
                )
            }
        }
        if (categories.isEmpty()) {
            item {
                EmptyMessage("Crie uma categoria de receita para cadastrar entradas.")
            }
        }
        if (incomes.isEmpty()) {
            item {
                EmptyMessage("Nenhuma receita cadastrada para este período.")
            }
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
        item {
            SummaryCard("Aportes do período", investedAmount)
        }
        if (categories.isEmpty()) {
            item {
                EmptyMessage("Crie uma categoria de investimento para cadastrar aportes.")
            }
        }
        if (investments.isEmpty()) {
            item {
                EmptyMessage("Nenhum investimento cadastrado para este período.")
            }
        } else {
            items(investments, key = { it.id }) { investment ->
                InvestmentCard(investment, onEdit, onDelete)
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
            item {
                EmptyMessage("Nenhuma categoria cadastrada.")
            }
        } else {
            items(categories, key = { it.id }) { category ->
                CategoryCard(category, onEdit, onDelete)
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
    val selectedMonthLabel = availableMonthOptions
        .firstOrNull { it.key == selectedMonthKey }
        ?.label
        ?: selectedMonthKey

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
                    Button(onClick = { monthMenuExpanded = true }) {
                        Text(selectedMonthLabel)
                    }
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
            ActionButtons(
                onEdit = { onEdit(category) },
                onDelete = { onDelete(category) },
            )
        }
    }
}

@Composable
private fun ExpenseCard(
    expense: ExpenseRecord,
    onEdit: (ExpenseRecord) -> Unit,
    onDelete: (ExpenseRecord) -> Unit,
    onToggleStatus: (ExpenseRecord) -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(expense.title, fontWeight = FontWeight.SemiBold)
            Text(
                "${expense.categoryName} - ${expense.paymentMethod}",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            CurrencyText(
                amount = expense.amount,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                "Vence em ${expense.dueDate} - ${expense.status}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(
                    onClick = { onToggleStatus(expense) },
                    label = {
                        Text(if (expense.status == "paid") "Marcar pendente" else "Marcar pago")
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = if (expense.status == "paid") Icons.Outlined.Sync else Icons.Outlined.Done,
                            contentDescription = null,
                        )
                    },
                )
            }
            ActionButtons(
                onEdit = { onEdit(expense) },
                onDelete = { onDelete(expense) },
            )
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
            CurrencyText(
                amount = income.amount,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                "Previsto para ${income.expectedDate} - ${income.status}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            ActionButtons(
                onEdit = { onEdit(income) },
                onDelete = { onDelete(income) },
            )
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
            Text(
                "${investment.type} - ${investment.broker}",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            CurrencyText(
                amount = investment.amount,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                "Meta: ${investment.goal}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            ActionButtons(
                onEdit = { onEdit(investment) },
                onDelete = { onDelete(investment) },
            )
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
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant)
            CurrencyText(
                amount = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
private fun CompactSummaryCard(label: String, value: Double, modifier: Modifier = Modifier) {
    Card(modifier = modifier) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            CurrencyText(
                amount = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun CountCard(label: String, count: Int) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            Text(
                if (label == "Taxa de poupança") "$count%" else count.toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
private fun ActivityCard(activity: RecentActivity) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(activity.title, fontWeight = FontWeight.SemiBold)
            Text(
                "${activity.category} - ${activity.type}",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            CurrencyText(
                amount = activity.amount,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                "${activity.date} - ${activity.status}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun EmptyMessage(message: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = message,
            modifier = Modifier.padding(16.dp),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
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
        CircularProgressIndicator(
            modifier = Modifier.padding(start = 24.dp),
        )
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
        Text(
            text = message,
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodyLarge,
        )
    }
}

