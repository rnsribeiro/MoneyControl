package com.moneycontrol.mobile.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ExpenseRecord(
    val id: String,
    val title: String,
    val amount: Double,
    @SerialName("paid_amount")
    val paidAmount: Double = 0.0,
    @SerialName("category_name")
    val categoryName: String,
    @SerialName("expense_date")
    val expenseDate: String,
    @SerialName("due_date")
    val dueDate: String,
    @SerialName("paid_at")
    val paidAt: String? = null,
    @SerialName("payment_method")
    val paymentMethod: String,
    val status: String,
    val notes: String? = null,
) {
    val normalizedPaidAmount: Double
        get() = paidAmount.coerceIn(0.0, amount)

    val remainingAmount: Double
        get() = (amount - normalizedPaidAmount).coerceAtLeast(0.0)

    val progressPercentage: Int
        get() = if (amount > 0) ((normalizedPaidAmount / amount) * 100).toInt().coerceIn(0, 100) else 0
}

@Serializable
data class IncomeRecord(
    val id: String,
    val title: String,
    val amount: Double,
    val source: String,
    @SerialName("received_at")
    val receivedAt: String,
    @SerialName("expected_date")
    val expectedDate: String,
    @SerialName("actual_received_at")
    val actualReceivedAt: String? = null,
    val status: String,
    val notes: String? = null,
)

@Serializable
data class InvestmentRecord(
    val id: String,
    val name: String,
    val type: String,
    val amount: Double,
    val broker: String,
    val goal: String,
    @SerialName("investment_date")
    val investmentDate: String,
    val notes: String? = null,
)

@Serializable
data class GoalRecord(
    val id: String,
    val title: String,
    @SerialName("target_amount")
    val targetAmount: Double,
    @SerialName("current_amount")
    val currentAmount: Double = 0.0,
    @SerialName("target_date")
    val targetDate: String? = null,
    val notes: String? = null,
) {
    val remainingAmount: Double
        get() = (targetAmount - currentAmount).coerceAtLeast(0.0)

    val progressPercentage: Int
        get() = if (targetAmount > 0) ((currentAmount / targetAmount) * 100).toInt().coerceIn(0, 100) else 0

    val isCompleted: Boolean
        get() = currentAmount >= targetAmount
}

@Serializable
data class CategoryRecord(
    val id: String,
    val name: String,
    val slug: String,
    val kind: String,
    val color: String? = null,
)

data class DashboardSummary(
    val totalIncome: Double = 0.0,
    val receivedIncome: Double = 0.0,
    val expectedIncome: Double = 0.0,
    val totalExpenses: Double = 0.0,
    val paidExpenses: Double = 0.0,
    val pendingExpenses: Double = 0.0,
    val totalInvested: Double = 0.0,
    val goalReserved: Double = 0.0,
    val balance: Double = 0.0,
    val cashOnHand: Double = 0.0,
    val savingsRate: Int = 0,
)

data class RecentActivity(
    val id: String,
    val title: String,
    val amount: Double,
    val date: String,
    val category: String,
    val type: String,
    val status: String,
)

data class HistoryEntry(
    val id: String,
    val title: String,
    val amount: Double,
    val date: String,
    val category: String,
    val type: String,
    val status: String,
    val notes: String? = null,
    val secondaryLabel: String? = null,
)

data class FinanceSnapshot(
    val summary: DashboardSummary = DashboardSummary(),
    val expenses: List<ExpenseRecord> = emptyList(),
    val incomes: List<IncomeRecord> = emptyList(),
    val investments: List<InvestmentRecord> = emptyList(),
    val goals: List<GoalRecord> = emptyList(),
    val categories: List<CategoryRecord> = emptyList(),
    val recentActivities: List<RecentActivity> = emptyList(),
)

data class MonthOption(
    val key: String,
    val label: String,
)

enum class FinancePeriodFilter(
    val label: String,
) {
    ALL_TIME("Tudo"),
    CURRENT_YEAR("Ano atual"),
    CURRENT_MONTH("Mes atual"),
    SPECIFIC_MONTH("Mes especifico"),
}

enum class HistoryTypeFilter(
    val label: String,
) {
    ALL("Tudo"),
    INCOME("Entradas"),
    EXPENSE("Saidas"),
    INVESTMENT("Investimentos"),
}

@Serializable
data class CategoryMutation(
    val name: String,
    val slug: String,
    val kind: String,
    val color: String? = null,
)

@Serializable
data class CategoryInsert(
    @SerialName("user_id")
    val userId: String,
    val name: String,
    val slug: String,
    val kind: String,
    val color: String? = null,
)

@Serializable
data class ExpenseMutation(
    val title: String,
    val amount: Double,
    @SerialName("paid_amount")
    val paidAmount: Double = 0.0,
    @SerialName("category_name")
    val categoryName: String,
    @SerialName("payment_method")
    val paymentMethod: String,
    val status: String,
    @SerialName("expense_date")
    val expenseDate: String,
    @SerialName("due_date")
    val dueDate: String,
    @SerialName("paid_at")
    val paidAt: String? = null,
    val notes: String? = null,
)

@Serializable
data class ExpenseInsert(
    @SerialName("user_id")
    val userId: String,
    val title: String,
    val amount: Double,
    @SerialName("paid_amount")
    val paidAmount: Double = 0.0,
    @SerialName("category_name")
    val categoryName: String,
    @SerialName("payment_method")
    val paymentMethod: String,
    val status: String,
    @SerialName("expense_date")
    val expenseDate: String,
    @SerialName("due_date")
    val dueDate: String,
    @SerialName("paid_at")
    val paidAt: String? = null,
    val notes: String? = null,
)

@Serializable
data class IncomeMutation(
    val title: String,
    val amount: Double,
    val source: String,
    @SerialName("received_at")
    val receivedAt: String,
    @SerialName("expected_date")
    val expectedDate: String,
    @SerialName("actual_received_at")
    val actualReceivedAt: String? = null,
    val status: String,
    val notes: String? = null,
)

@Serializable
data class IncomeInsert(
    @SerialName("user_id")
    val userId: String,
    val title: String,
    val amount: Double,
    val source: String,
    @SerialName("received_at")
    val receivedAt: String,
    @SerialName("expected_date")
    val expectedDate: String,
    @SerialName("actual_received_at")
    val actualReceivedAt: String? = null,
    val status: String,
    val notes: String? = null,
)

@Serializable
data class InvestmentMutation(
    val name: String,
    val type: String,
    val amount: Double,
    val broker: String,
    val goal: String,
    @SerialName("investment_date")
    val investmentDate: String,
    val notes: String? = null,
)

@Serializable
data class InvestmentInsert(
    @SerialName("user_id")
    val userId: String,
    val name: String,
    val type: String,
    val amount: Double,
    val broker: String,
    val goal: String,
    @SerialName("investment_date")
    val investmentDate: String,
    val notes: String? = null,
)

@Serializable
data class GoalMutation(
    val title: String,
    @SerialName("target_amount")
    val targetAmount: Double,
    @SerialName("current_amount")
    val currentAmount: Double = 0.0,
    @SerialName("target_date")
    val targetDate: String? = null,
    val notes: String? = null,
)

@Serializable
data class GoalInsert(
    @SerialName("user_id")
    val userId: String,
    val title: String,
    @SerialName("target_amount")
    val targetAmount: Double,
    @SerialName("current_amount")
    val currentAmount: Double = 0.0,
    @SerialName("target_date")
    val targetDate: String? = null,
    val notes: String? = null,
)
