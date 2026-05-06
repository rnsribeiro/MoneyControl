package com.moneycontrol.mobile.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.moneycontrol.mobile.core.theme.MoneyControlTheme
import com.moneycontrol.mobile.data.repository.AuthRepository
import com.moneycontrol.mobile.data.repository.FinanceRepository
import com.moneycontrol.mobile.ui.auth.AuthScreen
import com.moneycontrol.mobile.ui.auth.AuthViewModel
import com.moneycontrol.mobile.ui.auth.AuthViewModelFactory
import com.moneycontrol.mobile.ui.home.HomeScreen
import com.moneycontrol.mobile.ui.home.HomeViewModel
import com.moneycontrol.mobile.ui.home.HomeViewModelFactory

@Composable
fun MoneyControlMobileApp() {
    val authRepository = remember { AuthRepository() }
    val financeRepository = remember { FinanceRepository() }
    val authViewModel: AuthViewModel = viewModel(
        factory = AuthViewModelFactory(authRepository),
    )
    val homeViewModel: HomeViewModel = viewModel(
        factory = HomeViewModelFactory(financeRepository, authRepository),
    )
    val authState by authViewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(authState.message) {
        authState.message?.let { snackbarHostState.showSnackbar(it) }
    }

    LaunchedEffect(authState.authenticated) {
        if (authState.authenticated) {
            homeViewModel.refresh()
        }
    }

    MoneyControlTheme {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            ) {
                when {
                    authState.loading -> {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    }

                    authState.authenticated -> {
                        HomeScreen(
                            viewModel = homeViewModel,
                            onSignOut = {
                                authViewModel.signOut()
                                homeViewModel.reset()
                            },
                        )
                    }

                    else -> {
                        AuthScreen(
                            state = authState,
                            onEmailChange = authViewModel::updateEmail,
                            onPasswordChange = authViewModel::updatePassword,
                            onNameChange = authViewModel::updateName,
                            onToggleMode = authViewModel::toggleMode,
                            onSubmit = authViewModel::submit,
                        )
                    }
                }
            }
        }
    }
}
