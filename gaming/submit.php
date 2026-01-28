<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "your-email@example.com"; // <-- Replace with your real email
    $subject = "New Contact Form Submission";

    $name = strip_tags($_POST["name"]);
    $email = strip_tags($_POST["email"]);
    $message = strip_tags($_POST["message"]);

    $body = "Name: $name\nEmail: $email\nMessage:\n$message";

    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        // Redirect to a thank you page (optional)
        header("Location: thank-you.html");
        exit;
    } else {
        echo "Sorry, something went wrong. Please try again later.";
    }
}
?>
