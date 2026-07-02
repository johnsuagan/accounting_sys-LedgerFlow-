<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentOnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_registration_auto_provisions_practice_set_and_redirects_to_dashboard(): void
    {
        $response = $this->post('/register', [
            'name' => 'Alex Student',
            'email' => 'alex@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms' => true,
        ]);

        $response->assertRedirect(route('dashboard'));

        $user = User::query()->where('email', 'alex@example.com')->firstOrFail();

        $this->assertTrue($user->companyUsers()->exists());

        $company = $user->defaultCompany();
        $this->assertNotNull($company);
        $this->assertTrue((bool) ($company->settings['is_practice_set'] ?? false));

        $this->assertDatabaseHas('fiscal_years', [
            'company_id' => $company->id,
        ]);

        $this->assertDatabaseHas('accounts', [
            'company_id' => $company->id,
            'account_code' => '1110',
        ]);
    }

    public function test_login_auto_provisions_workspace_for_user_without_company(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));

        $user->refresh();
        $this->assertTrue($user->companyUsers()->exists());
    }

    public function test_authenticated_student_can_access_dashboard_without_company_select(): void
    {
        $this->post('/register', [
            'name' => 'Jamie Student',
            'email' => 'jamie@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms' => true,
        ]);

        $user = User::query()->where('email', 'jamie@example.com')->firstOrFail();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk();
    }
}
