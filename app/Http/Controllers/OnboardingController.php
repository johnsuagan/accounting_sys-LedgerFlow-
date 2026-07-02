<?php

namespace App\Http\Controllers;

use App\Services\Onboarding\PracticeSetProvisioner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        protected PracticeSetProvisioner $practiceSetProvisioner,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        $this->practiceSetProvisioner->ensureWorkspace(
            $user,
            $request->session(),
            "{$user->name}'s Practice Set",
        );

        return redirect()
            ->route('dashboard')
            ->with('welcome', true);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $this->practiceSetProvisioner->ensureWorkspace(
            $request->user(),
            $request->session(),
            $request->string('name')->toString() ?: null,
        );

        return redirect()
            ->route('dashboard')
            ->with('welcome', true);
    }
}
