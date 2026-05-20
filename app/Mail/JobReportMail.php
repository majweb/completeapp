<?php

namespace App\Mail;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JobReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Job $job,
        public string $pdfPath
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Raport zlecenia #' . $this->job->id . ' - ' . ($this->job->template->name ?? 'Zlecenie'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.jobs.report',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->pdfPath)
                ->as('raport-' . $this->job->id . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
