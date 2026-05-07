package com.moneycontrol.mobile.data.repository

import com.moneycontrol.mobile.core.config.SupabaseProvider
import com.moneycontrol.mobile.data.model.CategoryInsert
import com.moneycontrol.mobile.data.model.CategoryMutation
import com.moneycontrol.mobile.data.model.CategoryRecord
import com.moneycontrol.mobile.data.model.DashboardSummary
import com.moneycontrol.mobile.data.model.ExpenseInsert
import com.moneycontrol.mobile.data.model.ExpenseMutation
import com.moneycontrol.mobile.data.model.ExpenseRecord
import com.moneycontrol.mobile.data.model.FinanceSnapshot
import com.moneycontrol.mobile.data.model.GoalInsert
import com.moneycontrol.mobile.data.model.GoalMutation
import com.moneycontrol.mobile.data.model.GoalRecord
import com.moneycontrol.mobile.data.model.IncomeInsert
import com.moneycontrol.mobile.data.model.IncomeMutation
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentInsert
import com.moneycontrol.mobile.data.model.InvestmentMutation
import com.moneycontrol.mobile.data.model.InvestmentRecord
import com.moneycontrol.mobile.data.model.RecentActivity
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from
import java.time.LocalDate

class FinanceRepository {
    private val supabase = SupabaseProvider.client

    suspend fun loadSnapshot(): FinanceSnapshot {
        val expenses = supabase.from("mc_expenses").select().decodeList<ExpenseRecord>()
            .sortedByDescending { it.dueDate }
        val incomes = supabase.from("mc_incomes").select().decodeList<IncomeRecord>()
            .sortedByDescending { incomeDate(it) }
        val investments = supabase.from("mc_investments").select().decodeList<InvestmentRecord>()
            .sortedByDescending { it.investmentDate }
        val goals = supabase.from("mc_goals").select().decodeList<GoalRecord>()
            .sortedWith(
                compareBy<GoalRecord> { it.targetDate ?: "9999-12-31" }
                    .thenByDescending { it.currentAmount },
            )
        val categories = supabase.from("mc_categories").select().decodeList<CategoryRecord>()
            .sortedWith(compareBy<CategoryRecord> { it.kind }.thenBy { it.name })

        return FinanceSnapshot(
            summary = buildSummary(expenses, incomes, investments, goals),
            expenses = expenses,
            incomes = incomes,
            investments = investments,
            goals = goals,
            categories = categories,
            recentActivities = buildRecentActivities(expenses, incomes, investments),
        )
    }

    suspend fun createCategory(input: CategoryMutation) {
        val userId = requireUserId()
        val payload = CategoryInsert(
            userId = userId,
            name = input.name,
            slug = input.slug,
            kind = input.kind,
            color = input.color,
        )
        supabase.from("mc_categories").insert(payload)
    }

    suspend fun updateCategory(id: String, input: CategoryMutation) {
        supabase.from("mc_categories").update(input) {
            filter { eq("id", id) }
        }
    }

    suspend fun deleteCategory(id: String) {
        supabase.from("mc_categories").delete {
            filter { eq("id", id) }
        }
    }

    suspend fun createExpense(input: ExpenseMutation) {
        val userId = requireUserId()
        val payload = ExpenseInsert(
            userId = userId,
            title = input.title,
            amount = input.amount,
            paidAmount = normalizePaidAmount(input.amount, input.paidAmount, input.status),
            categoryName = input.categoryName,
            paymentMethod = input.paymentMethod,
            status = resolveExpenseStatus(input.amount, input.paidAmount, input.status),
            expenseDate = input.expenseDate,
            dueDate = input.dueDate,
            paidAt = normalizePaidAt(input.dueDate, input.paidAmount, input.status, input.paidAt),
            notes = input.notes,
        )
        supabase.from("mc_expenses").insert(payload)
    }

    suspend fun updateExpense(id: String, input: ExpenseMutation) {
        val normalizedPaidAmount = normalizePaidAmount(input.amount, input.paidAmount, input.status)
        val payload = input.copy(
            paidAmount = normalizedPaidAmount,
            status = resolveExpenseStatus(input.amount, normalizedPaidAmount, input.status),
            paidAt = normalizePaidAt(input.dueDate, normalizedPaidAmount, input.status, input.paidAt),
        )
        supabase.from("mc_expenses").update(payload) {
            filter { eq("id", id) }
        }
    }

    suspend fun updateExpenseStatus(id: String, status: String) {
        val expense = requireExpense(id)
        val payload = when (status) {
            "paid" -> mapOf(
                "status" to "paid",
                "paid_amount" to expense.amount,
                "paid_at" to today(),
            )
            else -> mapOf(
                "status" to "pending",
                "paid_amount" to 0.0,
                "paid_at" to null,
            )
        }

        supabase.from("mc_expenses").update(payload) {
            filter { eq("id", id) }
        }
    }

    suspend fun registerExpensePayment(id: String, amount: Double, paymentDate: String) {
        if (amount <= 0) {
            throw IllegalArgumentException("Informe um valor de pagamento valido.")
        }

        val expense = requireExpense(id)
        val nextPaidAmount = (expense.normalizedPaidAmount + amount).coerceAtMost(expense.amount)
        val nextStatus = when {
            nextPaidAmount >= expense.amount -> "paid"
            nextPaidAmount > 0 -> "partial"
            else -> "pending"
        }

        supabase.from("mc_expenses").update(
            mapOf(
                "paid_amount" to nextPaidAmount,
                "status" to nextStatus,
                "paid_at" to paymentDate,
            ),
        ) {
            filter { eq("id", id) }
        }
    }

    suspend fun deleteExpense(id: String) {
        supabase.from("mc_expenses").delete {
            filter { eq("id", id) }
        }
    }

    suspend fun createIncome(input: IncomeMutation) {
        val userId = requireUserId()
        val payload = IncomeInsert(
            userId = userId,
            title = input.title,
            amount = input.amount,
            source = input.source,
            receivedAt = input.receivedAt,
            expectedDate = input.expectedDate,
            actualReceivedAt = input.actualReceivedAt,
            status = input.status,
            notes = input.notes,
        )
        supabase.from("mc_incomes").insert(payload)
    }

    suspend fun updateIncome(id: String, input: IncomeMutation) {
        supabase.from("mc_incomes").update(input) {
            filter { eq("id", id) }
        }
    }

    suspend fun deleteIncome(id: String) {
        supabase.from("mc_incomes").delete {
            filter { eq("id", id) }
        }
    }

    suspend fun createInvestment(input: InvestmentMutation) {
        val userId = requireUserId()
        val payload = InvestmentInsert(
            userId = userId,
            name = input.name,
            type = input.type,
            amount = input.amount,
            broker = input.broker,
            goal = input.goal,
            investmentDate = input.investmentDate,
            notes = input.notes,
        )
        supabase.from("mc_investments").insert(payload)
    }

    suspend fun updateInvestment(id: String, input: InvestmentMutation) {
        supabase.from("mc_investments").update(input) {
            filter { eq("id", id) }
        }
    }

    suspend fun deleteInvestment(id: String) {
        supabase.from("mc_investments").delete {
            filter { eq("id", id) }
        }
    }

    suspend fun createGoal(input: GoalMutation) {
        val userId = requireUserId()
        val payload = GoalInsert(
            userId = userId,
            title = input.title,
            targetAmount = input.targetAmount,
            currentAmount = input.currentAmount.coerceIn(0.0, input.targetAmount),
            targetDate = input.targetDate,
            notes = input.notes,
        )
        supabase.from("mc_goals").insert(payload)
    }

    suspend fun updateGoal(id: String, input: GoalMutation) {
        val payload = input.copy(
            currentAmount = input.currentAmount.coerceIn(0.0, input.targetAmount),
        )
        supabase.from("mc_goals").update(payload) {
            filter { eq("id", id) }
        }
    }

    suspend fun deleteGoal(id: String) {
        supabase.from("mc_goals").delete {
            filter { eq("id", id) }
        }
    }

    private suspend fun requireUserId(): String {
        val session = supabase.auth.currentSessionOrNull()
        val userId = session?.user?.id
        if (userId.isNullOrBlank()) {
            throw IllegalStateException("Sessao nao encontrada.")
        }
        return userId
    }

    private suspend fun requireExpense(id: String): ExpenseRecord {
        val expense = supabase.from("mc_expenses").select().decodeList<ExpenseRecord>()
            .firstOrNull { it.id == id }
        return expense ?: throw IllegalStateException("Despesa nao encontrada.")
    }

    private fun buildSummary(
        expenses: List<ExpenseRecord>,
        incomes: List<IncomeRecord>,
        investments: List<InvestmentRecord>,
        goals: List<GoalRecord>,
    ): DashboardSummary {
        val receivedIncome = incomes
            .filter { it.status == "received" }
            .sumOf { it.amount }
        val expectedIncome = incomes
            .filter { it.status == "expected" }
            .sumOf { it.amount }
        val totalExpenses = expenses.sumOf { it.amount }
        val paidExpenses = expenses.sumOf { it.normalizedPaidAmount }
        val pendingExpenses = expenses.sumOf { it.remainingAmount }
        val totalInvested = investments.sumOf { it.amount }
        val goalReserved = goals.sumOf { it.currentAmount }

        return DashboardSummary(
            totalIncome = receivedIncome + expectedIncome,
            receivedIncome = receivedIncome,
            expectedIncome = expectedIncome,
            totalExpenses = totalExpenses,
            paidExpenses = paidExpenses,
            pendingExpenses = pendingExpenses,
            totalInvested = totalInvested,
            goalReserved = goalReserved,
            balance = (receivedIncome + expectedIncome) - totalExpenses - totalInvested,
            cashOnHand = receivedIncome - paidExpenses - totalInvested,
            savingsRate = if (receivedIncome > 0) ((totalInvested / receivedIncome) * 100).toInt() else 0,
        )
    }

    private fun buildRecentActivities(
        expenses: List<ExpenseRecord>,
        incomes: List<IncomeRecord>,
        investments: List<InvestmentRecord>,
    ): List<RecentActivity> {
        val items = buildList {
            incomes.forEach {
                add(
                    RecentActivity(
                        id = it.id,
                        title = it.title,
                        amount = it.amount,
                        date = incomeDate(it),
                        category = it.source,
                        type = "income",
                        status = if (it.status == "received") "recebido" else "a receber",
                    ),
                )
            }
            expenses.forEach {
                add(
                    RecentActivity(
                        id = it.id,
                        title = it.title,
                        amount = it.amount,
                        date = it.expenseDate,
                        category = it.categoryName,
                        type = "expense",
                        status = when {
                            isOverdue(it) -> "vencida"
                            it.remainingAmount <= 0 -> "pago"
                            it.normalizedPaidAmount > 0 -> "parcial"
                            else -> "pendente"
                        },
                    ),
                )
            }
            investments.forEach {
                add(
                    RecentActivity(
                        id = it.id,
                        title = it.name,
                        amount = it.amount,
                        date = it.investmentDate,
                        category = it.type,
                        type = "investment",
                        status = "investido",
                    ),
                )
            }
        }

        return items.sortedByDescending { it.date }.take(6)
    }

    private fun incomeDate(income: IncomeRecord): String {
        return if (income.status == "received") {
            income.actualReceivedAt ?: income.receivedAt
        } else {
            income.expectedDate
        }
    }

    private fun normalizePaidAmount(amount: Double, paidAmount: Double, status: String): Double {
        return when (status) {
            "paid" -> amount
            "pending" -> 0.0
            else -> paidAmount.coerceIn(0.0, amount)
        }
    }

    private fun resolveExpenseStatus(amount: Double, paidAmount: Double, fallbackStatus: String): String {
        val normalizedPaidAmount = paidAmount.coerceIn(0.0, amount)
        return when {
            normalizedPaidAmount >= amount -> "paid"
            normalizedPaidAmount > 0 -> "partial"
            fallbackStatus == "paid" -> "paid"
            else -> "pending"
        }
    }

    private fun normalizePaidAt(
        dueDate: String,
        paidAmount: Double,
        status: String,
        paidAt: String?,
    ): String? {
        return if (status == "paid" || paidAmount > 0) {
            paidAt ?: dueDate
        } else {
            null
        }
    }

    private fun isOverdue(expense: ExpenseRecord): Boolean {
        if (expense.remainingAmount <= 0) {
            return false
        }

        val dueDate = runCatching { LocalDate.parse(expense.dueDate) }.getOrNull() ?: return false
        return dueDate.isBefore(LocalDate.now())
    }

    private fun today(): String = LocalDate.now().toString()
}
