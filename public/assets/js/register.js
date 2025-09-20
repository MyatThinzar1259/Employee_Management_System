document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirmPassword")
  const strengthFill = document.querySelector(".strength-fill")
  const strengthText = document.querySelector(".strength-text")
  const inputs = document.querySelectorAll("input, select, textarea")
  const profilePhotoInput = document.getElementById("profilePhoto")
  const filePreview = document.getElementById("filePreview")

  // Add floating label effect
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused")
    })

    input.addEventListener("blur", function () {
      if (this.value === "") {
        this.parentElement.classList.remove("focused")
      }
    })

    // Check if input has value on load
    if (input.value !== "") {
      input.parentElement.classList.add("focused")
    }
  })

  profilePhotoInput.addEventListener("change", function (e) {
    const file = e.target.files[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          filePreview.innerHTML = `
            <img src="${e.target.result}" alt="Profile preview">
            <span class="file-name">${file.name}</span>
          `
        }
        reader.readAsDataURL(file)
      } else {
        showNotification("Please select a valid image file", "error")
        this.value = ""
      }
    } else {
      filePreview.innerHTML = ""
    }
  })

  const phoneInput = document.getElementById("phone")
  phoneInput.addEventListener("input", function () {
    // Remove non-numeric characters except + and -
    this.value = this.value.replace(/[^\d+\-\s()]/g, "")
  })

  // Password strength checker
  passwordInput.addEventListener("input", function () {
    const password = this.value
    const strength = calculatePasswordStrength(password)

    strengthFill.style.width = strength.percentage + "%"
    strengthText.textContent = strength.text
    strengthText.style.color = strength.color
  })

  // Confirm password validation
  confirmPasswordInput.addEventListener("input", function () {
    const password = passwordInput.value
    const confirmPassword = this.value

    if (confirmPassword && password !== confirmPassword) {
      this.style.borderColor = "#ff6f61"
      this.setCustomValidity("Passwords do not match")
    } else {
      this.style.borderColor = "#e5e7eb"
      this.setCustomValidity("")
    }
  })

  // Form validation and submission
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const userData = Object.fromEntries(formData)

    // Validation
    if (!validateForm(userData)) {
      return
    }

    // Simulate registration process
    const submitBtn = document.querySelector(".btn-primary")
    const originalText = submitBtn.textContent

    submitBtn.textContent = "Creating Account..."
    submitBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Store user data (in real app, this would be handled by server)
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth || null,
        basicSalary: Number.parseFloat(userData.basicSalary),
        role: userData.role,
        department: userData.department,
        registrationDate: new Date().toISOString(),
        isActive: true,
      }

      // Store in localStorage (in real app, this would be in database)
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Set current user
      localStorage.setItem("currentUser", JSON.stringify(newUser))

      showNotification("Account created successfully! Redirecting...", "success")

      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    }, 2000)
  })

  // Password strength calculation
  function calculatePasswordStrength(password) {
    let score = 0
    const feedback = []

    if (password.length >= 8) score += 25
    else feedback.push("at least 8 characters")

    if (/[a-z]/.test(password)) score += 25
    else feedback.push("lowercase letters")

    if (/[A-Z]/.test(password)) score += 25
    else feedback.push("uppercase letters")

    if (/[0-9]/.test(password)) score += 25
    else feedback.push("numbers")

    if (/[^A-Za-z0-9]/.test(password)) score += 10

    const strength = {
      percentage: Math.min(score, 100),
      text: "Weak",
      color: "#ff6f61",
    }

    if (score >= 75) {
      strength.text = "Strong"
      strength.color = "#a8e6cf"
    } else if (score >= 50) {
      strength.text = "Medium"
      strength.color = "#ffabab"
    }

    if (feedback.length > 0 && password.length > 0) {
      strength.text += ` (needs: ${feedback.join(", ")})`
    }

    return strength
  }

  // Form validation
  function validateForm(data) {
    if (!data.name || data.name.trim().length < 2) {
      showNotification("Please enter your full name (at least 2 characters)", "error")
      return false
    }

    if (!isValidEmail(data.email)) {
      showNotification("Please enter a valid email address", "error")
      return false
    }

    if (!data.phone) {
      showNotification("Please enter your phone number", "error")
      return false
    }

    if (!isValidPhone(data.phone)) {
      showNotification("Please enter a valid phone number", "error")
      return false
    }

    if (!data.address) {
      showNotification("Please enter your address", "error")
      return false
    }

    if (!data.gender) {
      showNotification("Please select your gender", "error")
      return false
    }

    if (!data.basicSalary || Number.parseFloat(data.basicSalary) <= 0) {
      showNotification("Please enter a valid basic salary", "error")
      return false
    }

    if (!data.role) {
      showNotification("Please select your role", "error")
      return false
    }

    if (!data.department) {
      showNotification("Please select a department", "error")
      return false
    }

    if (data.password.length < 8) {
      showNotification("Password must be at least 8 characters long", "error")
      return false
    }

    if (data.password !== data.confirmPassword) {
      showNotification("Passwords do not match", "error")
      return false
    }

    if (!data.terms) {
      showNotification("Please accept the terms and conditions", "error")
      return false
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    if (users.some((user) => user.email === data.email)) {
      showNotification("An account with this email already exists", "error")
      return false
    }

    return true
  }

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function isValidPhone(phone) {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[+]?[\d\s\-$$$$]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  // Notification system
  function showNotification(message, type) {
    const existingNotification = document.querySelector(".notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            ${type === "success" ? "background: #a8e6cf; color: #374151;" : "background: #ff6f61;"}
        `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 4000)
  }
})
