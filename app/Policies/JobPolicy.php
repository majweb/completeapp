<?php

namespace App\Policies;

use App\Models\Job;
use App\Models\User;

class JobPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        return $job->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['owner', 'manager']);
    }

    public function update(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        // Zablokuj edycję dla WSZYSTKICH jeśli status to completed lub approved
        if (in_array($job->status->value, ['completed', 'approved'])) {
            // Wyjątek: Manager/Owner może chcieć zmienić status z completed na in_progress
            // Ta logika zostanie obsłużona w kontrolerze, ale tutaj musimy pozwolić na samo wywołanie update
            // jeśli intencją jest zmiana statusu. Jednak Policy 'update' jest ogólne.
            // Zmienimy to tak: jeśli status jest 'approved', nikt nie może nic zrobić.
            // Jeśli 'completed', tylko owner/manager może wejść, ale kontroler ograniczy co może zmienić.

            if ($job->status->value === 'approved') {
                return false;
            }

            // Jeśli completed, pozwalamy tylko owner/manager (aby mogli przywrócić status)
            return in_array($user->role, ['owner', 'manager']);
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        return $job->assigned_to === $user->id;
    }

    public function generateSummary(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if ($job->status->value === 'approved') {
            return false;
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        return $job->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        return $user->role === 'technician' && $job->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (! in_array($user->role, ['owner', 'manager'])) {
            return false;
        }

        return $job->status->value === 'completed';
    }
}
