package com.moneycontrol.mobile.ui.home

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.moneycontrol.mobile.core.theme.MoneyBlue
import com.moneycontrol.mobile.core.theme.MoneyGreen
import com.moneycontrol.mobile.core.theme.MoneyOrange
import com.moneycontrol.mobile.core.theme.MoneyRose
import com.moneycontrol.mobile.core.theme.MoneyTeal
import com.moneycontrol.mobile.core.theme.TextMuted
import com.moneycontrol.mobile.data.model.DashboardSummary
import com.moneycontrol.mobile.data.model.ExpenseRecord
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentRecord
import com.moneycontrol.mobile.ui.shared.CurrencyText
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale
import kotlin.math.max

data class TrendPoint(
    val label: String,
    val income: Double,
    val expense: Double,
    val investment: Double,
)

data class DonutSlice(
    val label: String,
    val total: Double,
    val color: Color,
)

@Composable
fun TrendChartCard(points: List<TrendPoint>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "Tendência financeira",
                style = MaterialTheme.typography.titleMedium,
            )
            if (points.isEmpty()) {
                Text(
                    text = "Sem dados suficientes para montar a tendência.",
                    color = TextMuted,
                    style = MaterialTheme.typography.bodyMedium,
                )
            } else {
                LegendRow()
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                ) {
                    val maxValue = points.maxOf { max(it.income, max(it.expense, it.investment)) }
                        .coerceAtLeast(1.0)
                    val groupWidth = size.width / points.size
                    val barWidth = groupWidth / 5f
                    val chartHeight = size.height - 28.dp.toPx()

                    points.forEachIndexed { index, point ->
                        val startX = groupWidth * index + groupWidth * 0.2f
                        val values = listOf(
                            point.income to MoneyGreen,
                            point.expense to MoneyRose,
                            point.investment to MoneyBlue,
                        )

                        values.forEachIndexed { innerIndex, pair ->
                            val barHeight = ((pair.first / maxValue) * chartHeight).toFloat()
                            drawRoundRect(
                                color = pair.second,
                                topLeft = Offset(
                                    x = startX + innerIndex * (barWidth + 6.dp.toPx()),
                                    y = chartHeight - barHeight,
                                ),
                                size = Size(barWidth, barHeight),
                                cornerRadius = CornerRadius(12.dp.toPx(), 12.dp.toPx()),
                            )
                        }
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    points.forEach { point ->
                        Text(
                            text = point.label,
                            style = MaterialTheme.typography.bodySmall,
                            color = TextMuted,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DonutBreakdownCard(
    title: String,
    description: String,
    emptyMessage: String,
    percentageLabel: String,
    items: List<DonutSlice>,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = description,
                color = TextMuted,
                style = MaterialTheme.typography.bodyMedium,
            )
            if (items.isEmpty()) {
                Text(
                    text = emptyMessage,
                    color = TextMuted,
                    style = MaterialTheme.typography.bodyMedium,
                )
            } else {
                val total = items.sumOf { it.total }.coerceAtLeast(1.0)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val stroke = 28.dp.toPx()
                        val diameter = size.minDimension - stroke
                        val topLeft = Offset(
                            x = (size.width - diameter) / 2,
                            y = (size.height - diameter) / 2,
                        )

                        var startAngle = -90f
                        items.forEach { item ->
                            val sweep = ((item.total / total) * 360f).toFloat()
                            drawArc(
                                color = item.color,
                                startAngle = startAngle,
                                sweepAngle = sweep,
                                useCenter = false,
                                topLeft = topLeft,
                                size = Size(diameter, diameter),
                                style = androidx.compose.ui.graphics.drawscope.Stroke(
                                    width = stroke,
                                    cap = StrokeCap.Butt,
                                ),
                            )
                            startAngle += sweep
                        }
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Total",
                            color = TextMuted,
                            style = MaterialTheme.typography.bodySmall,
                        )
                        CurrencyText(
                            amount = items.sumOf { it.total },
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items.forEach { item ->
                        val percentage = if (total > 0) ((item.total / total) * 100).toInt() else 0
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                Canvas(modifier = Modifier.height(12.dp).fillMaxWidth(0.04f)) {
                                    drawCircle(color = item.color, radius = size.minDimension / 2)
                                }
                                Column {
                                    Text(
                                        text = item.label,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold,
                                    )
                                    Text(
                                        text = "$percentage% do total de $percentageLabel",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextMuted,
                                    )
                                }
                            }
                            CurrencyText(
                                amount = item.total,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LegendRow() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        LegendChip("Receitas", MoneyGreen)
        LegendChip("Despesas", MoneyRose)
        LegendChip("Investimentos", MoneyBlue)
    }
}

@Composable
private fun LegendChip(label: String, color: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Canvas(modifier = Modifier.height(10.dp).fillMaxWidth(0.05f)) {
            drawCircle(color = color, radius = size.minDimension / 2)
        }
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = TextMuted,
        )
    }
}

fun buildTrendPoints(
    incomes: List<IncomeRecord>,
    expenses: List<ExpenseRecord>,
    investments: List<InvestmentRecord>,
): List<TrendPoint> {
    val monthMap = linkedMapOf<String, TrendPoint>()

    fun monthLabel(date: LocalDate): String {
        val locale = Locale.forLanguageTag("pt-BR")
        return date.month.getDisplayName(TextStyle.SHORT, locale)
            .replaceFirstChar { if (it.isLowerCase()) it.titlecase(locale) else it.toString() }
    }

    val allDates = buildList {
        incomes.mapNotNullTo(this) { parseDate(incomeChartDate(it)) }
        expenses.mapNotNullTo(this) { parseDate(it.dueDate) }
        investments.mapNotNullTo(this) { parseDate(it.investmentDate) }
    }.sorted()

    if (allDates.isEmpty()) return emptyList()

    val baseMonths = allDates.takeLast(6)
        .map { it.withDayOfMonth(1) }
        .distinct()
        .takeLast(6)

    baseMonths.forEach { month ->
        val key = month.toString()
        monthMap[key] = TrendPoint(
            label = monthLabel(month),
            income = 0.0,
            expense = 0.0,
            investment = 0.0,
        )
    }

    incomes.forEach { income ->
        val parsed = parseDate(incomeChartDate(income))?.withDayOfMonth(1) ?: return@forEach
        val key = parsed.toString()
        val point = monthMap[key] ?: return@forEach
        monthMap[key] = point.copy(income = point.income + income.amount)
    }
    expenses.forEach { expense ->
        val parsed = parseDate(expense.dueDate)?.withDayOfMonth(1) ?: return@forEach
        val key = parsed.toString()
        val point = monthMap[key] ?: return@forEach
        monthMap[key] = point.copy(expense = point.expense + expense.amount)
    }
    investments.forEach { investment ->
        val parsed = parseDate(investment.investmentDate)?.withDayOfMonth(1) ?: return@forEach
        val key = parsed.toString()
        val point = monthMap[key] ?: return@forEach
        monthMap[key] = point.copy(investment = point.investment + investment.amount)
    }

    return monthMap.values.toList()
}

fun buildExpenseCategoryTotals(expenses: List<ExpenseRecord>): List<DonutSlice> {
    val colorPalette = listOf(MoneyRose, MoneyOrange, MoneyBlue, MoneyGreen, MoneyTeal)
    val grouped = expenses.groupBy { it.categoryName }
        .map { entry -> entry.key to entry.value.sumOf { it.amount } }
        .sortedByDescending { it.second }

    return grouped.mapIndexed { index, entry ->
        DonutSlice(
            label = entry.first,
            total = entry.second,
            color = colorPalette[index % colorPalette.size],
        )
    }
}

fun buildIncomeSourceTotals(incomes: List<IncomeRecord>): List<DonutSlice> {
    val colorPalette = listOf(MoneyGreen, MoneyTeal, MoneyBlue, MoneyOrange, MoneyRose)
    val grouped = incomes.groupBy { it.source }
        .map { entry -> entry.key to entry.value.sumOf { it.amount } }
        .sortedByDescending { it.second }

    return grouped.mapIndexed { index, entry ->
        DonutSlice(
            label = entry.first,
            total = entry.second,
            color = colorPalette[index % colorPalette.size],
        )
    }
}

fun buildIncomeVsExpenseTotals(summary: DashboardSummary): List<DonutSlice> {
    return listOf(
        DonutSlice("Receitas", summary.totalIncome, MoneyGreen),
        DonutSlice("Despesas", summary.totalExpenses, MoneyRose),
    ).filter { it.total > 0 }
}

private fun incomeChartDate(income: IncomeRecord): String {
    return if (income.status == "received") {
        income.actualReceivedAt ?: income.receivedAt
    } else {
        income.expectedDate
    }
}

private fun parseDate(value: String): LocalDate? = runCatching { LocalDate.parse(value) }.getOrNull()
