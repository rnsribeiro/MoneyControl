# MoneyControl Mobile

Aplicativo Android em Kotlin para o projeto MoneyControl.

## Stack

- Kotlin
- Jetpack Compose
- Material 3
- Supabase Auth + PostgREST

## Estrutura

- `app/src/main/java/com/moneycontrol/mobile/core`: configuracao e tema
- `app/src/main/java/com/moneycontrol/mobile/data`: modelos e repositorios
- `app/src/main/java/com/moneycontrol/mobile/ui`: telas e viewmodels

## Configuracao

O app Android agora tenta ler as credenciais nesta ordem:

1. `android/local.properties`
2. variaveis de ambiente
3. arquivo `../.env` do projeto web

Voce pode usar qualquer um destes nomes:

```properties
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

ou os mesmos nomes ja usados no web:

```properties
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

O `android/local.properties` tambem precisa manter o `sdk.dir`.

## Importante

- Nao use `SUPABASE_SERVICE_ROLE_KEY` no app Android.
- Esta base consome as mesmas tabelas `mc_*` do projeto web.

## Build

Para gerar o APK de debug:

```powershell
cd android
.\gradlew.bat assembleDebug
```
