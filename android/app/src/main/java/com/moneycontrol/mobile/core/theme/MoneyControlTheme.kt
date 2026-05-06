package com.moneycontrol.mobile.core.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = MoneyGreen,
    secondary = MoneyBlue,
    tertiary = MoneyOrange,
    background = Surface,
    surface = CardSurface,
)

private val DarkColors = darkColorScheme(
    primary = MoneyGreen,
    secondary = MoneyBlue,
    tertiary = MoneyOrange,
)

@Composable
fun MoneyControlTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = MoneyTypography,
        content = content,
    )
}

