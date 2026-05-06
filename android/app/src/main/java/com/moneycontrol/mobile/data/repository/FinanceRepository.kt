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
import com.moneycontrol.mobile.data.model.IncomeInsert
import com.moneycontrol.mobile.data.model.IncomeMutation
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentInsert
import com.moneycontrol.mobile.data.model.InvestmentMutation
import com.moneycontrol.mobile.data.model.InvestmentRecord
import com.moneycontrol.mobile.data.model.RecentActivity
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.from

class FinanceRepository {
    private val supabase = SupabaseProvider.client

    suspend fun loadSnapshot(): FinanceSnapshot {
        val expenses = supabase.from("mc_expenses").select().decodeList<ExpenseRecord>()
            .sortedByDescending { it.dueDate }
        val incomes = supabase.from("mc_incomes").select().decodeList<IncomeRecord>()
            .sortedByDescending { it.expectedDate }
        val investments = supabase.from("mc_investments").select().decodeList<InvestmentRecord>()
            .sortedByDescending { it.investmentDate }
        val categories = supabase.from("mc_categories").select().decodeList<CategoryRecord>()
            .sortedWith(compareBy<CategoryRecord> { it.kind }.thenBy { it.name })

        return FinanceSnapshot(
            summary = buildSummary(expenses, incomes, investments),
            expenses = expenses,
            incomes = incomes,
            investments = investments,
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
            filter {
                eq("id", id)
            }
        }
    }

    suspend fun deleteCategory(id: String) {
        supabase.from("mc_categories").delete {
            filter {
                eq("id", id)
            }
        }
    }

    suspend fun createExpense(input: ExpenseMutation) {
        val userId = requireUserId()
        val payload = ExpenseInsert(
            userId = userId,
            title = input.title,
            amount = input.amount,
            categoryName = input.categoryName,
            paymentMethod = input.paymentMethod,
            status = input.status,
            expenseDate = input.expenseDate,
            dueDate = input.dueDate,
            paidAt = input.paidAt,
            notes = input.notes,
        )
        supabase.from("mc_expenses").insert(payload)
    }

    suspend fun updateExpense(id: String, input: ExpenseMutation) {
        supabase.from("mc_expenses").update(input) {
            filter {
                eq("id", id)
            }
        }
    }

    suspend fun updateExpenseStatus(id: String, status: String) {
        val currentDate = today()
        val payload = mapOf(
            "status" to status,
            "paid_at" to if (status == "paid") currentDate else null,
        )
        supabase.from("mc_expenses").update(payload) {
            filter {
                eq("id", id)
            }
        }
    }

    suspend fun deleteExpense(id: String) {
        supabase.from("mc_expenses").delete {
            filter {
                eq("id", id)
            }
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
            filter {
                eq("id", id)
            }
        }
    }

    suspend fun deleteIncome(id: String) {
        supabase.from("mc_incomes").delete {
            filter {
                eq("id", id)
            }
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
            filter {
                eq("id", id)
            }
        }
    }

    suspend fun deleteInvestment(id: String) {
        supabase.from("mc_investments").delete {
            filter {
                eq("id", id)
            }
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

    private fun buildSummary(
        expenses: List<ExpenseRecord>,
        incomes: List<IncomeRecord>,
        investments: List<InvestmentRecord>,
    ): DashboardSummary {
        val receivedIncome = incomes
            .filter { it.status == "received" }
            .sumOf { it.amount }
        val expectedIncome = incomes
            .filter { it.status == "expected" }
            .sumOf { it.amount }
        val totalExpenses = expenses.sumOf { it.amount }
        val paidExpenses = expenses
            .filter { it.status == "paid" }
            .sumOf { it.amount }
        val pendingExpenses = expenses
            .filter { it.status != "paid" }
            .sumOf { it.amount }
        val totalInvested = investments.sumOf { it.amount }

        return DashboardSummary(
            totalIncome = receivedIncome + expectedIncome,
            receivedIncome = receivedIncome,
            expectedIncome = expectedIncome,
            totalExpenses = totalExpenses,
            paidExpenses = paidExpenses,
            pendingExpenses = pendingExpenses,
            totalInvested = totalInvested,
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
                        date = if (it.status == "received") it.actualReceivedAt ?: it.receivedAt else it.expectedDate,
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
                        status = it.status,
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

    private fun today(): String = java.time.LocalDate.now().toString()
}
