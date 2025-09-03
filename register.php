<?php
require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$secretKey = $_ENV['RECAPTCHA_SECRET_KEY'];
$siteKey = $_ENV['RECAPTCHA_SITE_KEY'];
die(var_dump($_POST));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $dateOfBirth = $_POST['dateOfBirth'] ?? '';
    $basicSalary = $_POST['basicSalary'] ?? '';
    $role = $_POST['role'] ?? '';
    $department = $_POST['department'] ?? '';
    $password = $_POST['password'] ?? '';
    $token = $_POST['recaptcha_token'] ?? '';

    

    // Verify reCAPTCHA
    if (empty($token)) {
        die("reCAPTCHA token is missing.");
    }

    $verifyURL = "https://www.google.com/recaptcha/api/siteverify";
    $data = [
        'secret' => $secretKey,
        'response' => $token,
    ];

    $ch = curl_init($verifyURL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($data),
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    $response_json = json_decode($response, true);

    if (
        !$response_json["success"] ||
        ($response_json["score"] ?? 0) < 0.5 ||
        ($response_json["action"] ?? '') !== "submit"
    ) {
        die("reCAPTCHA failed. Score: " . ($response_json["score"] ?? 'N/A'));
    }

    // ✅ Passed reCAPTCHA: You can now save to DB
    echo "<h3>✅ Registration Successful</h3>";
    echo "<p>Name: " . htmlspecialchars($name) . "</p>";
    echo "<p>Email: " . htmlspecialchars($email) . "</p>";
    echo "<p>Phone: " . htmlspecialchars($phone) . "</p>";
    echo "<p>Role: " . htmlspecialchars($role) . "</p>";
    echo "<p>Department: " . htmlspecialchars($department) . "</p>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - DreamHR</title>
    <link rel="stylesheet" href="styles/register.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="register-card fade-in">
            <div class="header">
                <div class="logo">
                    <span class="logo-icon">✨</span>
                    <h1>Join DreamHR</h1>
                </div>
                <p class="subtitle">Create your dreamy workspace account</p>
            </div>
            
            <form id="registerForm" class="register-form" method="POST" action="register.php">
                <!-- Combined first name and last name into single name field -->
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                    <span class="input-focus"></span>
                </div>
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>
                    <span class="input-focus"></span>
                </div>

                <!-- Added phone number field -->
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" required>
                    <span class="input-focus"></span>
                </div>

                <!-- Added address field -->
                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" name="address" rows="3" required></textarea>
                    <span class="input-focus"></span>
                </div>

                <!-- Added gender selection with radio buttons -->
                <div class="form-group">
                    <label class="field-label">Gender</label>
                    <div class="radio-group">
                        <label class="radio-container">
                            <input type="radio" name="gender" value="male" required>
                            <span class="radio-mark"></span>
                            Male
                        </label>
                        <label class="radio-container">
                            <input type="radio" name="gender" value="female" required>
                            <span class="radio-mark"></span>
                            Female
                        </label>
                        <label class="radio-container">
                            <input type="radio" name="gender" value="other" required>
                            <span class="radio-mark"></span>
                            Other
                        </label>
                    </div>
                </div>

                <!-- Added date of birth field (optional) -->
                <div class="form-group">
                    <label for="dateOfBirth">Date of Birth <span class="optional">(Optional)</span></label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth">
                    <span class="input-focus"></span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="department">Department</label>
                        <select id="department" name="department" required>
                            <option value="">Select Department</option>
                            <option value="hr">Human Resources</option>
                            <option value="it">Information Technology</option>
                            <option value="finance">Finance</option>
                            <option value="marketing">Marketing</option>
                            <option value="sales">Sales</option>
                            <option value="operations">Operations</option>
                        </select>
                        <span class="input-focus"></span>
                    </div>

                    <!-- Added role dropdown -->
                    <div class="form-group">
                        <label for="role">Role</label>
                        <select id="role" name="role" required>
                            <option value="">Select Role</option>
                            <option value="manager">Manager</option>
                            <option value="senior">Senior Employee</option>
                            <option value="junior">Junior Employee</option>
                            <option value="intern">Intern</option>
                            <option value="contractor">Contractor</option>
                        </select>
                        <span class="input-focus"></span>
                    </div>
                </div>

                <!-- Added basic salary field -->
                <div class="form-group">
                    <label for="basicSalary">Basic Salary</label>
                    <input type="number" id="basicSalary" name="basicSalary" min="0" step="100" required>
                    <span class="input-focus"></span>
                </div>

                <!-- Added profile photo upload (optional) -->
                <div class="form-group">
                    <label for="profilePhoto">Profile Photo <span class="optional">(Optional)</span></label>
                    <div class="file-upload-container">
                        <input type="file" id="profilePhoto" name="profilePhoto" accept="image/*" class="file-input">
                        <label for="profilePhoto" class="file-upload-label">
                            <span class="upload-icon">📷</span>
                            <span class="upload-text">Choose photo or drag & drop</span>
                        </label>
                        <div class="file-preview" id="filePreview"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                    <span class="input-focus"></span>
                    <div class="password-strength">
                        <div class="strength-bar">
                            <div class="strength-fill"></div>
                        </div>
                        <span class="strength-text">Password strength</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                    <span class="input-focus"></span>
                </div>
                
                <div class="form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" id="terms" required>
                        <span class="checkmark"></span>
                        I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </label>
                </div>

                <input type="hidden" name="recaptcha_token" id="recaptcha_token">
                
                <button type="submit" class="btn btn-primary">Create Account</button>
                
                <div class="divider">
                    <span>or</span>
                </div>
                
                <div class="auth-links">
                    <p>Already have an account? <a href="login.html">Sign in</a></p>
                    <a href="index.html" class="back-home">← Back to Home</a>
                </div>
            </form>
        </div>
    </div>

   <!-- Load reCAPTCHA with site key from .env -->
<script src="https://www.google.com/recaptcha/api.js?render=<?php echo htmlspecialchars($siteKey); ?>"></script>

<!-- Make SITE_KEY available in JS -->
<script>
  const SITE_KEY = "<?php echo htmlspecialchars($siteKey); ?>";
</script>
<script src="scripts/register.js"></script>
</body>
</html>
