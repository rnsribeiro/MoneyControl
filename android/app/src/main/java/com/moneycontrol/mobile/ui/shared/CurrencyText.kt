package com.moneycontrol.mobile.ui.shared

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import java.text.NumberFormat
import java.util.Locale

@Composable
fun CurrencyText(
    amount: Double,
    style: TextStyle,
    fontWeight: FontWeight,
) {
    Text(
        text = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR")).format(amount),
        style = style,
        fontWeight = fontWeight,
    )
}
