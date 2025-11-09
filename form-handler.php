<?php
// form-handler.php
// Handles AJAX JSON POSTs and non-JS POSTs from the quick lead and booking forms.
// Writes to data/submissions.csv and attempts to send an email via mail().
// Set $TO_EMAIL to a real address for production.

$TO_EMAIL = 'hello@soulfulkitchen.example'; // <<-- CHANGE THIS to your real email
$FROM_EMAIL = 'no-reply@yourdomain.com';

// Utility: sanitize input and prevent header injection
function clean($v) {
  $v = trim($v);
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "%0a", "%0d"), ' ', $v);
  return $v;
}

// Get input either JSON or $_POST
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  $data = $_POST;
}

// Map values
$name = isset($data['name']) ? clean($data['name']) : '';
$email = isset($data['email']) ? clean($data['email']) : '';
$phone = isset($data['phone']) ? clean($data['phone']) : '';
$date = isset($data['date']) ? clean($data['date']) : '';
$guests = isset($data['guests']) ? clean($data['guests']) : '';
$location = isset($data['location']) ? clean($data['location']) : '';
$referral = isset($data['referral']) ? clean($data['referral']) : '';
$notes = isset($data['notes']) ? clean($data['notes']) : '';
$source = isset($data['source']) ? clean($data['source']) : 'Website Booking Form';

// Basic validation
if (!$name || !$email || !$phone) {
  $err = ['ok' => false, 'error' => 'Please include name, email and phone.'];
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode($err);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $err = ['ok' => false, 'error' => 'Invalid email address.'];
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode($err);
  exit;
}

// Ensure data dir exists
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
  mkdir($dataDir, 0755, true);
}
$csvFile = $dataDir . '/submissions.csv';
$header = ['submittedAt','name','email','phone','date','guests','location','referral','source','notes'];

// Append to CSV
$exists = file_exists($csvFile);
$fp = fopen($csvFile, 'a');
if ($fp) {
  if (!$exists) {
    fputcsv($fp, $header);
  }
  $row = [date('c'), $name, $email, $phone, $date, $guests, $location, $referral, $source, $notes];
  fputcsv($fp, $row);
  fclose($fp);
}

// Send email via mail()
$subject = "New booking: " . $name;
$message = "New booking received:\n\n";
$message .= "Name: $name\nEmail: $email\nPhone: $phone\nDate: $date\nGuests: $guests\nLocation: $location\nReferral: $referral\nSource: $source\n\nNotes:\n$notes\n";

$headers = "From: $FROM_EMAIL\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$mailOk = @mail($TO_EMAIL, $subject, $message, $headers);

// Determine if request expects JSON (AJAX)
$accept = isset($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : '';
$isJson = (strpos($accept, 'application/json') !== false) || (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) || (!empty($raw));

if ($isJson) {
  header('Content-Type: application/json');
  echo json_encode(['ok' => true, 'email_sent' => (bool)$mailOk]);
  exit;
} else {
  // Non-AJAX: redirect to success page
  if ($mailOk) {
    header('Location: success.html');
    exit;
  } else {
    // Still redirect but inform that email may have failed.
    header('Location: success.html');
    exit;
  }
}
?>
