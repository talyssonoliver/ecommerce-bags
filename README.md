# Artesanato E-commerce

E-commerce platform for Brazilian Handmade Bags built with Next.js 14, Supabase, and Stripe.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Image Storage**: Cloudinary
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- Git
- Supabase account
- Stripe account
- Cloudinary account

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/artesanato-ecommerce.git
   cd artesanato-ecommerce
   ```

## Supabase Setup

To link your project to Supabase, you need to install and configure the Supabase CLI:

### 1. Installing Supabase CLI

#### Using Scoop on Windows (Recommended)

Scoop is already installed and Supabase CLI is installed, but you need to make sure it's properly added to your PATH:

```powershell
# Fix PATH issues with scoop installations
$env:PATH += ";$env:USERPROFILE\scoop\shims"

# Verify installation
scoop list
# Should show supabase in the list

# Check supabase version
supabase --version
```

If the command is still not found after adding to PATH, try using the full path:

```powershell
# Find where supabase is installed
ls "$env:USERPROFILE\scoop\apps\supabase\current"

# Run supabase using the full path
& "$env:USERPROFILE\scoop\apps\supabase\current\supabase.exe" --version
```

#### To make the PATH changes permanent

```powershell
# Add to PowerShell profile to make it permanent
$profileContent = 'if (Test-Path "$env:USERPROFILE\scoop\shims") { $env:PATH += ";$env:USERPROFILE\scoop\shims" }'
Add-Content -Path $PROFILE -Value $profileContent -Force
```

#### Alternative Installation Methods

If you need to reinstall or prefer other installation methods:

1. **Direct download:**
   - Visit https://github.com/supabase/cli/releases
   - Download the latest Windows .exe file
   - Place it in a directory that's in your PATH

2. **Using pnpm (make sure to use the correct package name):**
   ```bash
   pnpm install -g supabase
   ```

### 2. Login to Supabase

Once supabase is properly in your PATH, you can login:

```bash
# Using the command if found in PATH
supabase login

# OR using the full path if needed
& "$env:USERPROFILE\scoop\apps\supabase\current\supabase.exe" login
```

You'll be prompted to visit a URL to generate an access token.

### 3. Link Your Project

After logging in successfully:

```bash
# Using the command in PATH
supabase link --project-ref rsgrwnbvoxibrqzcwpaf

# OR using the full path
& "$env:USERPROFILE\scoop\apps\supabase\current\supabase.exe" link --project-ref rsgrwnbvoxibrqzcwpaf
```

You may be prompted to enter your database password (leave blank if not required).

### 4. Handling Configuration Differences

After linking, you might see a warning about configuration differences between your local setup and the remote project:

```
WARNING: Local config differs from linked project. Try updating supabase\config.toml
```

Key differences typically include:
- **API schemas**: Local may use `public, graphql_public` while remote uses `api`
- **Site URL configuration**: Local might use `127.0.0.1:3000` vs remote's `localhost:3000`
- **Email confirmations**: May be disabled locally but enabled on the remote project
- **Frequency limits**: Different rate limiting settings

To resolve these differences, you can either:

1. **Update local config to match remote**:
   ```bash
   # Edit your supabase\config.toml file manually to match the remote settings
   notepad supabase\config.toml
   ```

2. **Pull the remote configuration**:
   ```bash
   supabase db remote commit
   ```

3. **Push your local configuration** (use with caution):
   ```bash
   supabase db push
   ```

The safest approach is usually to update your local configuration to match the remote project settings.

### 5. Pull Database Schema

After resolving configuration differences:

```bash
supabase db pull
```

## Troubleshooting Supabase CLI

### If "supabase is not recognized" after installation

1. **Check if it's installed:**
   ```powershell
   scoop list
   ```
   
2. **Verify the binary exists:**
   ```powershell
   ls "$env:USERPROFILE\scoop\apps\supabase\current"
   ```
   
3. **Use the full path for commands:**
   ```powershell
   & "$env:USERPROFILE\scoop\apps\supabase\current\supabase.exe" login
   ```
   
4. **Update Supabase CLI:**
   ```powershell
   scoop update supabase
   ```

5. **Restart PowerShell** to refresh environment variables

For more details, see the [Supabase CLI documentation](https://supabase.com/docs/reference/cli/usage).
