package com.moneycontrol.mobile.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.moneycontrol.mobile.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val loading: Boolean = true,
    val authenticated: Boolean = false,
    val signUpMode: Boolean = false,
    val name: String = "",
    val email: String = "",
    val password: String = "",
    val error: String? = null,
    val message: String? = null,
    val configured: Boolean = true,
)

class AuthViewModel(
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val configured = authRepository.isConfigured()
            val hasSession = if (configured) authRepository.currentSession() != null else false
            _uiState.update {
                it.copy(
                    loading = false,
                    authenticated = hasSession,
                    configured = configured,
                    error = if (configured) null else "Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY para usar o app mobile.",
                )
            }
        }
    }

    fun updateName(value: String) {
        _uiState.update { it.copy(name = value, error = null, message = null) }
    }

    fun updateEmail(value: String) {
        _uiState.update { it.copy(email = value, error = null, message = null) }
    }

    fun updatePassword(value: String) {
        _uiState.update { it.copy(password = value, error = null, message = null) }
    }

    fun toggleMode() {
        _uiState.update { it.copy(signUpMode = !it.signUpMode, error = null, message = null) }
    }

    fun submit() {
        val state = _uiState.value
        if (!state.configured) return

        if (state.email.isBlank() || state.password.isBlank() || (state.signUpMode && state.name.isBlank())) {
            _uiState.update {
                it.copy(error = "Preencha os campos obrigatorios.")
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null, message = null) }
            val result = if (state.signUpMode) {
                authRepository.signUp(state.name.trim(), state.email.trim(), state.password)
            } else {
                authRepository.signIn(state.email.trim(), state.password)
            }

            _uiState.update {
                it.copy(
                    loading = false,
                    authenticated = result.signedIn,
                    error = result.error,
                    message = result.message,
                )
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            _uiState.value = AuthUiState(
                loading = false,
                configured = authRepository.isConfigured(),
            )
        }
    }
}

class AuthViewModelFactory(
    private val authRepository: AuthRepository,
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return AuthViewModel(authRepository) as T
    }
}
