<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Select Company — {{ config('app.name') }}</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; background: #f8fafc; color: #0f172a; }
        .card { max-width: 32rem; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: .5rem; padding: 1.5rem; }
        h1 { font-size: 1.25rem; margin: 0 0 .5rem; }
        p { color: #64748b; margin: 0 0 1.5rem; }
        ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .75rem; }
        button { width: 100%; text-align: left; padding: .875rem 1rem; border: 1px solid #cbd5e1; border-radius: .375rem; background: #fff; cursor: pointer; }
        button:hover { border-color: #2563eb; background: #eff6ff; }
        .name { font-weight: 600; display: block; }
        .meta { font-size: .875rem; color: #64748b; }
        .logout { margin-top: 1.5rem; text-align: center; }
        .logout a { color: #64748b; }
        .error { color: #b91c1c; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Select company</h1>
        <p>Choose the company you want to work in. All accounting data is scoped to this selection.</p>

        @if ($errors->any())
            <div class="error">{{ $errors->first() }}</div>
        @endif

        <ul>
            @foreach ($companies as $company)
                <li>
                    <form method="POST" action="{{ route('company.switch') }}">
                        @csrf
                        <input type="hidden" name="company_id" value="{{ $company['id'] }}">
                        <button type="submit">
                            <span class="name">{{ $company['name'] }}</span>
                            <span class="meta">
                                {{ strtoupper($company['currency_code']) }}
                                @if ($company['role'])
                                    · {{ ucfirst(str_replace('_', ' ', $company['role'])) }}
                                @endif
                            </span>
                        </button>
                    </form>
                </li>
            @endforeach
        </ul>

        <div class="logout">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" style="width: auto; border: none; background: none; color: #64748b;">Sign out</button>
            </form>
        </div>
    </div>
</body>
</html>
