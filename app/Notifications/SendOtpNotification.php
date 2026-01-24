<?php


// namespace App\Notifications;


// use Illuminate\Bus\Queueable;
// use Illuminate\Contracts\Queue\ShouldQueue;
// use Illuminate\Notifications\Messages\MailMessage;
// use Illuminate\Notifications\Notification;


// class SendOtpNotification extends Notification implements ShouldQueue
// {
// use Queueable;


// public function __construct(public string $code, public int $ttlMinutes)
// {
// // $code is plain (not stored), only sent to the user
// }


// public function via(object $notifiable): array
// {
// return ['mail'];
// }


// public function toMail(object $notifiable): MailMessage
// {
// return (new MailMessage)
// ->subject('Your One-Time Login Code')
// ->greeting('Hello!')
// ->line('Use the code below to sign in:')
// ->line("**{$this->code}**")
// ->line("This code expires in {$this->ttlMinutes} minutes.")
// ->line('If you didn\'t request this, you can ignore this email.');
// }
// }



namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // If you want queued notifications
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtpNotification extends Notification
{
    use Queueable;

    protected $otp;

    /**
     * Create a new notification instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your OTP Code')
            ->line('Your One-Time Password (OTP) is: ' . $this->otp)
            ->line('This OTP will expire in 10 minutes.')
            ->line('If you did not request this, please ignore this email.');
    }
}
