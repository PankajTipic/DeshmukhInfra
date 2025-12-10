<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
        }
        .reset-link {
            color: #007bff;
            text-decoration: none;
            font-size: 16px;
        }
        .reset-link:hover {
            text-decoration: underline;
            color: #0056b3;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password.</p>
        <p>
            Click the following link to reset your password:
            <a href="{{ $url }}" class="reset-link">Reset Your Password</a>
        </p>
        <p>If the above link doesn’t work, you can copy and paste this URL into your browser:</p>
        <p>{{ $url }}</p>
        <p class="footer">
            If you didn’t request a password reset, please ignore this email or contact support if you have questions.
        </p>
        <p class="footer">
            Thanks,<br>
            The SksWebAdmin Team
        </p>
    </div>
</body>
</html>
