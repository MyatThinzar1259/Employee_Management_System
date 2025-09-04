document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const inputs = document.querySelectorAll("input")

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

  // Form validation and submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const remember = document.getElementById("remember").checked

    // Basic validation
    if (!email || !password) {
      showNotification("Please fill in all fields", "error")
      return
    }

    if (!isValidEmail(email)) {
      showNotification("Please enter a valid email address", "error")
      return
    }

    // Simulate login process
    const submitBtn = document.querySelector(".btn-primary")
    const originalText = submitBtn.textContent

    submitBtn.textContent = "Signing in..."
    submitBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Store user data (in real app, this would come from server)
      const userData = {
        email: email,
        name: email.split("@")[0],
        loginTime: new Date().toISOString(),
        remember: remember,
      }

      localStorage.setItem("currentUser", JSON.stringify(userData))

      showNotification("Login successful! Redirecting...", "success")

      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    }, 2000)
  })

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Notification system
  function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector(".notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    // Add styles
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
            ${type === "success" ? "background: #a8e6cf; color: #374151;" : "background: #ff6f61;"}
        `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  // Add ripple effect to button
  const submitBtn = document.querySelector(".btn-primary")
  submitBtn.addEventListener("click", function (e) {
    const ripple = document.createElement("span")
    const rect = this.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `

    this.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  })
})

// Add ripple animation
const style = document.createElement("style")
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)
