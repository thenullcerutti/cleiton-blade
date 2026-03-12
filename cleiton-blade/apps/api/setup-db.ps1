# ============================================================================
# CLEITON BLADE SYSTEM - PostgreSQL Setup Script (Windows)
# ============================================================================

Write-Host "🔧 Iniciando setup do PostgreSQL..." -ForegroundColor Cyan

# Check if psql is available
$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Path

if (!$psqlPath) {
    Write-Host "❌ PostgreSQL não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "Por favor instale PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL encontrado: $psqlPath" -ForegroundColor Green

# Create database using the init.sql script
Write-Host "📝 Criando banco de dados..." -ForegroundColor Cyan

$env:PGPASSWORD = "postgres"
psql -U postgres -f init.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Banco de dados criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "  1. npm install" -ForegroundColor White
    Write-Host "  2. npm run migrate" -ForegroundColor White
    Write-Host "  3. npm run seed" -ForegroundColor White
    Write-Host "  4. npm run dev" -ForegroundColor White
} else {
    Write-Host "❌ Erro ao criar banco de dados" -ForegroundColor Red
    Write-Host "Verifique se PostgreSQL está rodando e se tem permissão" -ForegroundColor Yellow
    exit 1
}

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
