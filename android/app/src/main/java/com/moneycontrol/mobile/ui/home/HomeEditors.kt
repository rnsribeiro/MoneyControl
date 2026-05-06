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
}

sealed interface DeleteRequest {
    data class Category(val item: CategoryRecord) : DeleteRequest
    data class Expense(val item: ExpenseRecord) : DeleteRequest
    data class Income(val item: IncomeRecord) : DeleteRequest
    data class Investment(val item: InvestmentRecord) : DeleteRequest
}

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
    }
    val message = when (request) {
        is DeleteRequest.Category -> "Deseja remover a categoria ${request.item.name}?"
        is DeleteRequest.Expense -> "Deseja remover a despesa ${request.item.title}?"
        is DeleteRequest.Income -> "Deseja remover a receita ${request.item.title}?"
        is DeleteRequest.Investment -> "Deseja remover o investimento ${request.item.name}?"
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
    var category by remember(initial, categories) {
        mutableStateOf(initial?.categoryName ?: categories.firstOrNull()?.name.orEmpty())
    }
    var paymentMethod by remember(initial) { mutableStateOf(initial?.paymentMethod.orEmpty()) }
    var dueDate by remember(initial) { mutableStateOf(initial?.dueDate ?: today()) }
    var status by remember(initial) { mutableStateOf(initial?.status ?: "pending") }
    var notes by remember(initial) { mutableStateOf(initial?.notes.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }

    EditorDialog(
        title = if (initial == null) "Nova despesa" else "Editar despesa",
        submitting = submitting,
        onDismiss = onDismiss,
        onSave = {
            val parsedAmount = amount.toDoubleOrNull()
            when {
                title.trim().length < 3 -> error = "Informe uma descricao com pelo menos 3 caracteres."
                parsedAmount == null || parsedAmount <= 0.0 -> error = "Informe um valor maior que zero."
                category.isBlank() -> error = "Selecione uma categoria."
                paymentMethod.trim().isBlank() -> error = "Informe a forma de pagamento."
                dueDate.isBlank() -> error = "Informe a data de vencimento."
                else -> onSave(
                    ExpenseMutation(
                        title = title.trim(),
                        amount = parsedAmount,
                        categoryName = category,
                        paymentMethod = paymentMethod.trim(),
                        status = status,
                        expenseDate = dueDate,
                        dueDate = dueDate,
                        paidAt = if (status == "paid") dueDate else null,
                        notes = notes.trim().ifBlank { null },
                    ),
                )
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
            onValueChange = { amount = it; error = null },
            label = "Valor",
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
        EditorTextField(
            value = dueDate,
            onValueChange = { dueDate = it; error = null },
            label = "Data de vencimento",
            placeholder = "2026-05-06",
        )
        OptionSelector(
            label = "Status",
            selectedValue = status,
            options = listOf("pending" to "Pendente", "paid" to "Pago"),
            onSelected = { status = it; error = null },
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
            placeholder = "2026-05-06",
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
            placeholder = "2026-05-06",
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
