param(
    [string]$rootPath = "C:\taly\ecommerce-bags",
    [string[]]$excludeDirs = @("node_modules", ".bin", "dist", ".cache", ".git", "coverage", "logs", "tmp", "out", ".vscode", ".husky", ".next",".turbo"),
    [string[]]$excludeFiles = @("pnpm-lock.yaml"),  # Arquivos a serem ignorados
    [string]$outputFile = "C:\taly\projectContentBags.txt"
)

# Remove arquivo de saída se já existir
Remove-Item -Path $outputFile -ErrorAction SilentlyContinue
New-Item -ItemType File -Path $outputFile | Out-Null

# Extensões de arquivos de texto suportadas
$extensoesTexto = @(".md", ".txt", ".json", ".yaml", ".yml", ".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".scss", ".sh", ".ps1", ".sql", ".graphql", ".toml", ".ini")

# Função para verificar se um arquivo está em diretórios ou na lista de exclusão
function IsExcluded($filePath, $excludedDirs, $excludedFiles) {
    foreach ($dir in $excludedDirs) {
        if ($filePath -match "\\$dir\\") {
            return $true
        }
    }
    foreach ($file in $excludedFiles) {
        if ($filePath -match "\\$file$") {
            return $true
        }
    }
    return $false
}

# Abrindo stream de escrita para evitar conflitos
$streamWriter = [System.IO.StreamWriter]::new($outputFile, $true, [System.Text.Encoding]::UTF8)

# Contador de arquivos processados
$contadorArquivos = 0

# Percorrer todos os arquivos no diretório
Get-ChildItem -Path $rootPath -Recurse -File | Where-Object {
    -not (IsExcluded $_.FullName $excludeDirs $excludeFiles) -and
    ($extensoesTexto -contains $_.Extension.ToLower())
} | ForEach-Object {
    $caminhoArquivo = $_.FullName
    $nomeArquivo = $_.Name

    # Incrementar contador de arquivos processados
    $contadorArquivos++

    # Escrever detalhes do arquivo no documento
    $streamWriter.WriteLine("==========================================")
    $streamWriter.WriteLine("File: $nomeArquivo")
    $streamWriter.WriteLine("Path: $caminhoArquivo")
    $streamWriter.WriteLine("==========================================")

    # Se for um arquivo de texto, lê e escreve o conteúdo
    try {
        $conteudo = Get-Content -Path $caminhoArquivo -Raw -Encoding utf8
        if ($conteudo.Length -gt 0) {
            $streamWriter.WriteLine($conteudo)
        } else {
            $streamWriter.WriteLine(">>> [Empty file]")
        }
    } catch {
        $streamWriter.WriteLine(">>> [Error reading file]")
    }

    # Adicionar separação entre arquivos
    $streamWriter.WriteLine("`n`n")
}

# Fechar stream de escrita
$streamWriter.Close()

Write-Host "Processo concluído! Total de arquivos processados: $contadorArquivos"
Write-Host "Conteúdo do projeto salvo em: $outputFile"
