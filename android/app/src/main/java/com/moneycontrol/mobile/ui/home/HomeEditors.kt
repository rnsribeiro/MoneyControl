package com.moneycontrol.mobile.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.moneycontrol.mobile.data.model.CategoryMutation
import com.moneycontrol.mobile.data.model.CategoryRecord
import com.moneycontrol.mobile.data.model.ExpenseMutation
import com.moneycontrol.mobile.data.model.ExpenseRecord
import com.moneycontrol.mobile.data.model.GoalMutation
import com.moneycontrol.mobile.data.model.GoalRecord
import com.moneycontrol.mobile.data.model.IncomeMutation
import com.moneycontrol.mobile.data.model.IncomeRecord
import com.moneycontrol.mobile.data.model.InvestmentMutation
import com.moneycontrol.mobile.data.model.InvestmentRecord

sealed interface HomeEditor {
    data class Category(val initial: CategoryRecord? = null) : HomeEditor
    data class Expense(
        val initial: ExpenseRecord? = null,
        val categories: List<CategoryRecord>,
    ) : HomeEditor
    data class Income(
        val initial: IncomeRecord? = null,
        val categories: List<CategoryRecord>,
    ) : HomeEditor
    data class Investment(
        val initial: InvestmentRecord? = null,
        val categories: List<CategoryRecord>,
    ) : HomeEditor
    data class Goal(val initial: GoalRecord? = null) : HomeEditor
}

sealed interface DeleteRequest {
    data class Category(val item: CategoryRecord) : DeleteRequest
    data class Expense(val item: ExpenseRecord) : DeleteRequest
    data class Income(val item: IncomeRecord) : DeleteRequest
    data class Investment(val item: InvestmentRecord) : DeleteRequest
    data class Goal(val item: GoalRecord) : DeleteRequest
}

data class ExpensePaymentRequest(
    val expense: ExpenseRecord,
)

@Composable
fun DeleteConfirmationDialog(
    request: DeleteRequest,
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
    submitting: Boolean,
) {
    val title = when (request) {
        is DeleteRequest.Category -> "Excluir categoria"
        is DeleteRequest.Expense -> "Excluir despesa"
        is DeleteRequest.Income -> "Excluir receita"
        is DeleteRequest.Investment -> "Excluir investimento"
        is DeleteRequest.Goal -> "Excluir meta"
    }
    val message = when (request) {
        is DeleteRequest.Category -> "Deseja remover a categoria ${request.item.name}?"
        is DeleteRequest.Expense -> "Deseja remover a despesa ${request.item.title}?"
        is DeleteRequest.Income -> "Deseja remover a receita ${request.item.title}?"
        is DeleteRequest.Investment -> "Deseja remover o investimento ${request.item.name}?"
        is DeleteRequest.Goal -> "Deseja remover a meta ${request.item.title}?"
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = {
            Button(onClick = onConfirm, enabled = !submitting) {
                Text(if (submitting) "Excluindo..." else "Excluir")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !submitting) {
                Text("Cancelar")
            }
        },
    )
}

@Composable
fun ExpensePaymentDialog(
    request: ExpensePaymentRequest,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: (amount: Double, paymentDate: String) -> Unit,
) {
    var amount by remember(request.expense.id) { mutableStateOf(request.expense.remainingAmount.toString()) }
    var paymentDate by remember(request.expense.id) { mutableStateOf(today()) }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = "Registrar pagamento",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val parsedAmount = amount.toDoubleOrNull()
            when {
                parsedAmount == null || parsedAmount <= 0.0 -> error = "Informe um valor valido."
                parsedAmount > request.expense.remainingAmount -> {
                    error = "O pagamento nao pode passar do valor restante."
                }
                paymentDate.isBlank() -> error = "Informe a data do pagamento."
                else -> onSave(parsedAmount, paymentDate)
            }
        },
    ) {
        Text(
            text = "Restam ${request.expense.remainingAmount.formatMoney()} para quitar ${request.expense.title}.",
            style = MaterialTheme.typography.bodyMedium,
        )
        EditorTextField(
            value = amount,
            onValueChange = { amount = it; error = null },
            label = "Valor pago agora",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
        )
        EditorTextField(
            value = paymentDate,
            onValueChange = { paymentDate = it; error = null },
            label = "Data do pagamento",
            placeholder = "2026-05-07",
        )
        error?.let { ErrorText(it) }
    }
}

@Composable
fun CategoryEditorDialog(
    initial: CategoryRecord?,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: (CategoryMutation) -> Unit,
) {
    var name by remember(initial) { mutableStateOf(initial?.name.orEmpty()) }
    var kind by remember(initial) { mutableStateOf(initial?.kind ?: "expense") }
    var color by remember(initial) { mutableStateOf(initial?.color ?: "#0f766e") }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = if (initial == null) "Nova categoria" else "Editar categoria",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val trimmedName = name.trim()
            if (trimmedName.length < 2) {
                error = "Informe o nome da categoria."
                return@EditorDialog
            }

            onSave(
                CategoryMutation(
                    name = trimmedName,
                    slug = slugify(trimmedName),
                    kind = kind,
                    color = color.ifBlank { null },
                ),
            )
        },
    ) {
        EditorTextField(
            value = name,
            onValueChange = {
                name = it
                error = null
            },
            label = "Nome",
            placeholder = "Ex.: Assinaturas",
        )
        OptionSelector(
            label = "Tipo",
            selectedValue = kind,
            options = listOf(
                "expense" to "Despesa",
                "income" to "Receita",
                "investment" to "Investimento",
            ),
            onSelected = {
                kind = it
                error = null
            },
        )
        EditorTextField(
            value = color,
            onValueChange = { color = it },
            label = "Cor",
            placeholder = "#0f766e",
        )
        error?.let { ErrorText(it) }
    }
}

@Composable
fun ExpenseEditorDialog(
    initial: ExpenseRecord?,
    categories: List<CategoryRecord>,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: (ExpenseMutation) -> Unit,
) {
    var title by remember(initial) { mutableStateOf(initial?.title.orEmpty()) }
    var amount by remember(initial) { mutableStateOf(initial?.amount?.toString().orEmpty()) }
    var paidAmount by remember(initial) { mutableStateOf(initial?.normalizedPaidAmount?.toString().orEmpty()) }
    var category by remember(initial, categories) {
        mutableStateOf(initial?.categoryName ?: categories.firstOrNull()?.name.orEmpty())
    }
    var paymentMethod by remember(initial) { mutableStateOf(initial?.paymentMethod.orEmpty()) }
    var hasDueDate by remember(initial) { mutableStateOf(initial?.dueDate != null) }
    var dueDate by remember(initial) { mutableStateOf(initial?.dueDate ?: today()) }
    var status by remember(initial) {
        mutableStateOf(
            when {
                initial == null -> "paid"
                initial.remainingAmount <= 0 -> "paid"
                initial.normalizedPaidAmount > 0 -> "partial"
                else -> "pending"
            },
        )
    }
    var notes by remember(initial) { mutableStateOf(initial?.notes.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = if (initial == null) "Nova despesa" else "Editar despesa",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val parsedAmount = amount.toDoubleOrNull()
            val parsedPaidAmount = paidAmount.toDoubleOrNull() ?: 0.0
            when {
                title.trim().length < 3 -> error = "Informe uma descricao com pelo menos 3 caracteres."
                parsedAmount == null || parsedAmount <= 0.0 -> error = "Informe um valor maior que zero."
                category.isBlank() -> error = "Selecione uma categoria."
                paymentMethod.trim().isBlank() -> error = "Informe a forma de pagamento."
                hasDueDate && dueDate.isBlank() -> error = "Informe a data de vencimento."
                status == "partial" && (parsedPaidAmount <= 0.0 || parsedPaidAmount >= parsedAmount) -> {
                    error = "No status parcial, use um valor pago maior que zero e menor que o total."
                }
                status != "partial" && parsedPaidAmount < 0 -> error = "O valor pago nao pode ser negativo."
                else -> {
                    val normalizedPaidAmount = when (status) {
                        "paid" -> parsedAmount
                        "pending" -> 0.0
                        else -> parsedPaidAmount.coerceIn(0.0, parsedAmount)
                    }
                    onSave(
                        ExpenseMutation(
                            title = title.trim(),
                            amount = parsedAmount,
                            paidAmount = normalizedPaidAmount,
                            categoryName = category,
                            paymentMethod = paymentMethod.trim(),
                            status = status,
                            expenseDate = initial?.expenseDate ?: dueDate.takeIf { hasDueDate } ?: today(),
                            dueDate = dueDate.takeIf { hasDueDate },
                            paidAt = if (normalizedPaidAmount > 0) (dueDate.takeIf { hasDueDate } ?: initial?.expenseDate ?: today()) else null,
                            notes = notes.trim().ifBlank { null },
                        ),
                    )
                }
            }
        },
    ) {
        if (categories.isEmpty()) {
            ErrorText("Crie uma categoria de despesa antes de cadastrar despesas.")
            return@EditorDialog
        }

        EditorTextField(title, { title = it; error = null }, "Descricao", "Ex.: Mercado da semana")
        EditorTextField(
            value = amount,
            onValueChange = {
                amount = it
                if (status == "paid") {
                    paidAmount = it
                }
                if (status == "pending") {
                    paidAmount = "0"
                }
                error = null
            },
            label = "Valor total",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
        )
        OptionSelector(
            label = "Categoria",
            selectedValue = category,
            options = categories.map { it.name to it.name },
            onSelected = { category = it; error = null },
        )
        EditorTextField(
            value = paymentMethod,
            onValueChange = { paymentMethod = it; error = null },
            label = "Pagamento",
            placeholder = "Pix, debito, boleto...",
        )
        OptionSelector(
            label = "Controle de vencimento",
            selectedValue = if (hasDueDate) "with-date" else "without-date",
            options = listOf(
                "with-date" to "Definir data de vencimento",
                "without-date" to "Despesa sem vencimento",
            ),
            onSelected = {
                hasDueDate = it == "with-date"
                if (!hasDueDate) {
                    dueDate = ""
                } else if (dueDate.isBlank()) {
                    dueDate = today()
                }
                error = null
            },
        )
        EditorTextField(
            value = dueDate,
            onValueChange = { dueDate = it; error = null },
            label = "Data de vencimento",
            placeholder = "2026-05-07",
            enabled = hasDueDate,
        )
        OptionSelector(
            label = "Status",
            selectedValue = status,
            options = listOf("paid" to "Pago", "partial" to "Parcial", "pending" to "Pendente"),
            onSelected = {
                status = it
                when (it) {
                    "paid" -> paidAmount = amount
                    "pending" -> paidAmount = "0"
                }
                error = null
            },
        )
        EditorTextField(
            value = paidAmount,
            onValueChange = { paidAmount = it; error = null },
            label = "Valor ja pago",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
            enabled = status == "partial",
        )
        EditorTextField(
            value = notes,
            onValueChange = { notes = it },
            label = "Observacoes",
            placeholder = "Contexto adicional, recorrencia ou lembrete.",
            singleLine = false,
        )
        error?.let { ErrorText(it) }
    }
}

@Composable
fun IncomeEditorDialog(
    initial: IncomeRecord?,
    categories: List<CategoryRecord>,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: (IncomeMutation) -> Unit,
) {
    var title by remember(initial) { mutableStateOf(initial?.title.orEmpty()) }
    var amount by remember(initial) { mutableStateOf(initial?.amount?.toString().orEmpty()) }
    var source by remember(initial, categories) {
        mutableStateOf(initial?.source ?: categories.firstOrNull()?.name.orEmpty())
    }
    var date by remember(initial) { mutableStateOf(initial?.expectedDate ?: today()) }
    var status by remember(initial) { mutableStateOf(initial?.status ?: "received") }
    var notes by remember(initial) { mutableStateOf(initial?.notes.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = if (initial == null) "Nova receita" else "Editar receita",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val parsedAmount = amount.toDoubleOrNull()
            when {
                title.trim().length < 3 -> error = "Informe uma descricao com pelo menos 3 caracteres."
                parsedAmount == null || parsedAmount <= 0.0 -> error = "Informe um valor maior que zero."
                source.isBlank() -> error = "Selecione a origem da receita."
                date.isBlank() -> error = "Informe a data da receita."
                else -> onSave(
                    IncomeMutation(
                        title = title.trim(),
                        amount = parsedAmount,
                        source = source,
                        receivedAt = date,
                        expectedDate = date,
                        actualReceivedAt = if (status == "received") date else null,
                        status = status,
                        notes = notes.trim().ifBlank { null },
                    ),
                )
            }
        },
    ) {
        if (categories.isEmpty()) {
            ErrorText("Crie uma categoria de receita antes de cadastrar receitas.")
            return@EditorDialog
        }

        EditorTextField(title, { title = it; error = null }, "Descricao", "Ex.: Salario mensal")
        EditorTextField(
            value = amount,
            onValueChange = { amount = it; error = null },
            label = "Valor",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
        )
        OptionSelector(
            label = "Origem",
            selectedValue = source,
            options = categories.map { it.name to it.name },
            onSelected = { source = it; error = null },
        )
        EditorTextField(
            value = date,
            onValueChange = { date = it; error = null },
            label = "Data",
            placeholder = "2026-05-07",
        )
        OptionSelector(
            label = "Status",
            selectedValue = status,
            options = listOf("received" to "Recebido", "expected" to "A receber"),
            onSelected = { status = it; error = null },
        )
        EditorTextField(
            value = notes,
            onValueChange = { notes = it },
            label = "Observacoes",
            placeholder = "Detalhes sobre a origem ou recorrencia.",
            singleLine = false,
        )
        error?.let { ErrorText(it) }
    }
}

@Composable
fun InvestmentEditorDialog(
    initial: InvestmentRecord?,
    categories: List<CategoryRecord>,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: (InvestmentMutation) -> Unit,
) {
    var name by remember(initial) { mutableStateOf(initial?.name.orEmpty()) }
    var amount by remember(initial) { mutableStateOf(initial?.amount?.toString().orEmpty()) }
    var type by remember(initial, categories) {
        mutableStateOf(initial?.type ?: categories.firstOrNull()?.name.orEmpty())
    }
    var broker by remember(initial) { mutableStateOf(initial?.broker.orEmpty()) }
    var goal by remember(initial) { mutableStateOf(initial?.goal.orEmpty()) }
    var date by remember(initial) { mutableStateOf(initial?.investmentDate ?: today()) }
    var notes by remember(initial) { mutableStateOf(initial?.notes.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = if (initial == null) "Novo investimento" else "Editar investimento",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val parsedAmount = amount.toDoubleOrNull()
            when {
                name.trim().length < 3 -> error = "Informe o nome do investimento."
                parsedAmount == null || parsedAmount <= 0.0 -> error = "Informe um valor maior que zero."
                type.isBlank() -> error = "Selecione o tipo de investimento."
                broker.trim().length < 2 -> error = "Informe a corretora."
                goal.trim().length < 2 -> error = "Informe o objetivo do aporte."
                date.isBlank() -> error = "Informe a data do aporte."
                else -> onSave(
                    InvestmentMutation(
                        name = name.trim(),
                        type = type,
                        amount = parsedAmount,
                        broker = broker.trim(),
                        goal = goal.trim(),
                        investmentDate = date,
                        notes = notes.trim().ifBlank { null },
                    ),
                )
            }
        },
    ) {
        if (categories.isEmpty()) {
            ErrorText("Crie uma categoria de investimento antes de cadastrar investimentos.")
            return@EditorDialog
        }

        EditorTextField(name, { name = it; error = null }, "Ativo / aporte", "Ex.: Tesouro Selic 2029")
        EditorTextField(
            value = amount,
            onValueChange = { amount = it; error = null },
            label = "Valor",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
        )
        OptionSelector(
            label = "Tipo",
            selectedValue = type,
            options = categories.map { it.name to it.name },
            onSelected = { type = it; error = null },
        )
        EditorTextField(
            value = broker,
            onValueChange = { broker = it; error = null },
            label = "Corretora",
            placeholder = "Ex.: XP, NuInvest...",
        )
        EditorTextField(
            value = goal,
            onValueChange = { goal = it; error = null },
            label = "Objetivo",
            placeholder = "Ex.: reserva, aposentadoria...",
        )
        EditorTextField(
            value = date,
            onValueChange = { date = it; error = null },
            label = "Data",
            placeholder = "2026-05-07",
        )
        EditorTextField(
            value = notes,
            onValueChange = { notes = it },
            label = "Observacoes",
            placeholder = "Observacoes sobre o aporte ou estrategia.",
            singleLine = false,
        )
        error?.let { ErrorText(it) }
    }
}

@Composable
fun GoalEditorDialog(
    initial: GoalRecord?,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: (GoalMutation) -> Unit,
) {
    var title by remember(initial) { mutableStateOf(initial?.title.orEmpty()) }
    var targetAmount by remember(initial) { mutableStateOf(initial?.targetAmount?.toString().orEmpty()) }
    var currentAmount by remember(initial) { mutableStateOf(initial?.currentAmount?.toString().orEmpty()) }
    var hasTargetDate by remember(initial) { mutableStateOf(initial?.targetDate != null) }
    var targetDate by remember(initial) { mutableStateOf(initial?.targetDate.orEmpty()) }
    var notes by remember(initial) { mutableStateOf(initial?.notes.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = if (initial == null) "Nova meta" else "Editar meta",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val parsedTargetAmount = targetAmount.toDoubleOrNull()
            val parsedCurrentAmount = currentAmount.toDoubleOrNull() ?: 0.0
            when {
                title.trim().length < 3 -> error = "Informe um nome com pelo menos 3 caracteres."
                parsedTargetAmount == null || parsedTargetAmount <= 0.0 -> error = "Informe um valor-alvo maior que zero."
                parsedCurrentAmount < 0.0 -> error = "O valor reservado nao pode ser negativo."
                parsedCurrentAmount > parsedTargetAmount -> error = "O valor reservado nao pode ser maior que o alvo."
                hasTargetDate && targetDate.isBlank() -> error = "Informe a data limite da meta."
                else -> onSave(
                    GoalMutation(
                        title = title.trim(),
                        targetAmount = parsedTargetAmount,
                        currentAmount = parsedCurrentAmount,
                        targetDate = if (hasTargetDate) targetDate.trim().ifBlank { null } else null,
                        notes = notes.trim().ifBlank { null },
                    ),
                )
            }
        },
    ) {
        EditorTextField(title, { title = it; error = null }, "Nome da meta", "Ex.: Comprar um carro")
        EditorTextField(
            value = targetAmount,
            onValueChange = { targetAmount = it; error = null },
            label = "Valor-alvo",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
        )
        EditorTextField(
            value = currentAmount,
            onValueChange = { currentAmount = it; error = null },
            label = "Valor ja reservado",
            placeholder = "0.00",
            keyboardType = KeyboardType.Decimal,
        )
        OptionSelector(
            label = "Prazo da meta",
            selectedValue = if (hasTargetDate) "with-date" else "without-date",
            options = listOf(
                "with-date" to "Definir data limite",
                "without-date" to "Meta sem data limite",
            ),
            onSelected = {
                hasTargetDate = it == "with-date"
                if (!hasTargetDate) {
                    targetDate = ""
                }
                error = null
            },
        )
        EditorTextField(
            value = targetDate,
            onValueChange = { targetDate = it; error = null },
            label = "Data limite",
            placeholder = "2026-12-31",
            enabled = hasTargetDate,
        )
        EditorTextField(
            value = notes,
            onValueChange = { notes = it },
            label = "Observacoes",
            placeholder = "Detalhes do objetivo, estrategia ou lembretes.",
            singleLine = false,
        )
        error?.let { ErrorText(it) }
    }
}

@Composable
private fun EditorDialog(
    title: String,
    submitting: Boolean,
    onDismiss: () -> Unit,
    onSave: () -> Unit,
    content: @Composable () -> Unit,
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.extraLarge,
            tonalElevation = 6.dp,
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                )
                content()
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Button(
                        onClick = onSave,
                        enabled = !submitting,
                        modifier = Modifier.weight(1f),
                    ) {
                        Text(if (submitting) "Salvando..." else "Salvar")
                    }
                    TextButton(
                        onClick = onDismiss,
                        enabled = !submitting,
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Cancelar")
                    }
                }
            }
        }
    }
}

@Composable
private fun EditorTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    keyboardType: KeyboardType = KeyboardType.Text,
    singleLine: Boolean = true,
    enabled: Boolean = true,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label) },
        placeholder = { Text(placeholder) },
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        singleLine = singleLine,
        minLines = if (singleLine) 1 else 3,
        enabled = enabled,
        colors = OutlinedTextFieldDefaults.colors(),
    )
}

@Composable
private fun OptionSelector(
    label: String,
    selectedValue: String,
    options: List<Pair<String, String>>,
    onSelected: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedLabel = options.firstOrNull { it.first == selectedValue }?.second ?: "Selecionar"

    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
        )
        Button(
            onClick = { expanded = true },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(selectedLabel)
        }
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option.second) },
                    onClick = {
                        onSelected(option.first)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
private fun ErrorText(message: String) {
    Text(
        text = message,
        color = MaterialTheme.colorScheme.error,
        style = MaterialTheme.typography.bodyMedium,
    )
}

private fun slugify(value: String): String {
    return value
        .trim()
        .lowercase()
        .replace(Regex("[^a-z0-9]+"), "-")
        .trim('-')
}

private fun today(): String = java.time.LocalDate.now().toString()

private fun Double.formatMoney(): String = "R$ %.2f".format(this)
