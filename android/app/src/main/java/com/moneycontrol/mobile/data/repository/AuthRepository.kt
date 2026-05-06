package com.moneycontrol.mobile.data.repository

import com.moneycontrol.mobile.core.config.SupabaseProvider
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.user.UserSession
import io.github.jan.supabase.exceptions.RestException
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.util.Locale

data class AuthResult(
    val signedIn: Boolean,
    val error: String? = null,
    val message: String? = null,
)

class AuthRepository {
    private val supabase = SupabaseProvider.client

    fun isConfigured(): Boolean = SupabaseProvider.isConfigured

    suspend fun currentSession(): UserSession? = runCatching {
        supabase.auth.currentSessionOrNull()
    }.getOrNull()

    suspend fun signIn(email: String, password: String): AuthResult {
        val normalizedEmail = email.trim().lowercase(Locale.ROOT)

        return try {
            supabase.auth.signInWith(Email) {
                this.email = normalizedEmail
                this.password = password
            }

            AuthResult(
                signedIn = supabase.auth.currentSessionOrNull() != null,
            )
        } catch (exception: RestException) {
            AuthResult(
                signedIn = false,
                error = mapAuthError(exception.error),
            )
        } catch (_: Exception) {
            AuthResult(
                signedIn = false,
                error = "Nao foi possivel entrar.",
            )
        }
    }

    suspend fun signUp(name: String, email: String, password: String): AuthResult {
        val normalizedEmail = email.trim().lowercase(Locale.ROOT)

        return try {
            supabase.auth.signUpWith(Email) {
                this.email = normalizedEmail
                this.password = password
                data = buildJsonObject {
                    put("full_name", name.trim())
                }
            }

            val hasSession = supabase.auth.currentSessionOrNull() != null

            AuthResult(
                signedIn = hasSession,
                message = if (hasSession) null else "Conta criada. Verifique seu e-mail para confirmar o acesso.",
            )
        } catch (exception: RestException) {
            AuthResult(
                signedIn = false,
                error = mapAuthError(exception.error),
            )
        } catch (_: Exception) {
            AuthResult(
                signedIn = false,
                error = "Nao foi possivel criar a conta.",
            )
        }
    }

    suspend fun signOut() {
        runCatching {
            supabase.auth.signOut()
        }
    }

    private fun mapAuthError(message: String): String {
        val normalized = message.lowercase(Locale.ROOT)

        return when {
            "invalid_credentials" in normalized -> {
                "E-mail ou senha invalidos. Se esta conta ja existe no sistema web, confirme se ela tambem existe no Supabase Auth e se a senha esta correta."
            }
            "email not confirmed" in normalized -> {
                "Seu e-mail ainda nao foi confirmado."
            }
            "user already registered" in normalized -> {
                "Este e-mail ja esta cadastrado. Tente entrar com sua senha."
            }
            else -> message
        }
    }
}
