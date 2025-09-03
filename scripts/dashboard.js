document.addEventListener("DOMContentLoaded", () => {
  // Initialize dashboard
  initializeDashboard()
  setupNavigation()
  setupEmployeeManagement()
  setupModal()
  updateDateTime()

  // Update date every minute
  setInterval(updateDateTime, 60000)
})

function initializeDashboard() {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  // Update user info in sidebar
  document.getElementById("userName").textContent = currentUser.firstName || currentUser.name || "User"
  document.getElementById("userRole").textContent = currentUser.department || "Employee"

  // Setup logout functionality
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser")
      window.location.href = "login.html"
    }
  })
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item")
  const sections = document.querySelectorAll(".content-section")
  const pageTitle = document.getElementById("pageTitle")
  const pageSubtitle = document.getElementById("pageSubtitle")

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Hide all sections
      sections.forEach((section) => section.classList.remove("active"))

      // Show selected section
      const sectionId = this.dataset.section + "-section"
      const targetSection = document.getElementById(sectionId)
      if (targetSection) {
        targetSection.classList.add("active")
      }

      // Update page title and subtitle
      updatePageHeader(this.dataset.section)
    })
  })
}

function updatePageHeader(section) {
  const pageTitle = document.getElementById("pageTitle")
  const pageSubtitle = document.getElementById("pageSubtitle")

  const headers = {
    overview: {
      title: "Dashboard Overview",
      subtitle: "Welcome back! Here's what's happening today.",
    },
    employees: {
      title: "Employee Management",
      subtitle: "Manage your team members and their information.",
    },
    attendance: {
      title: "Attendance Tracking",
      subtitle: "Monitor employee attendance and working hours.",
    },
    payroll: {
      title: "Payroll Management",
      subtitle: "Handle salary calculations and payments.",
    },
    reports: {
      title: "Reports & Analytics",
      subtitle: "View detailed reports and business insights.",
    },
    settings: {
      title: "System Settings",
      subtitle: "Configure your system preferences and settings.",
    },
  }

  if (headers[section]) {
    pageTitle.textContent = headers[section].title
    pageSubtitle.textContent = headers[section].subtitle
  }
}

function setupEmployeeManagement() {
  loadEmployees()
  setupEmployeeFilters()
}

function loadEmployees() {
  const employees = getEmployees()
  const employeeGrid = document.getElementById("employeeGrid")

  if (employees.length === 0) {
    employeeGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 20px;">👥</div>
                <h3>No employees found</h3>
                <p>Start by adding your first employee to the system.</p>
            </div>
        `
    return
  }

  employeeGrid.innerHTML = employees
    .map(
      (employee) => `
        <div class="employee-card" data-department="${employee.department}">
            <div class="employee-header">
                <div class="employee-avatar">
                    ${getInitials(employee.firstName, employee.lastName)}
                </div>
                <div class="employee-info">
                    <h4>${employee.firstName} ${employee.lastName}</h4>
                    <p>${employee.position || "Employee"}</p>
                </div>
            </div>
            <div class="employee-details">
                <div class="employee-detail">
                    <span>Department:</span>
                    <span>${formatDepartment(employee.department)}</span>
                </div>
                <div class="employee-detail">
                    <span>Email:</span>
                    <span>${employee.email}</span>
                </div>
                <div class="employee-detail">
                    <span>Salary:</span>
                    <span>$${employee.salary ? employee.salary.toLocaleString() : "N/A"}</span>
                </div>
                <div class="employee-detail">
                    <span>Start Date:</span>
                    <span>${employee.startDate ? formatDate(employee.startDate) : "N/A"}</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function setupEmployeeFilters() {
  const searchInput = document.getElementById("employeeSearch")
  const departmentFilter = document.getElementById("departmentFilter")

  searchInput.addEventListener("input", filterEmployees)
  departmentFilter.addEventListener("change", filterEmployees)
}

function filterEmployees() {
  const searchTerm = document.getElementById("employeeSearch").value.toLowerCase()
  const selectedDepartment = document.getElementById("departmentFilter").value
  const employeeCards = document.querySelectorAll(".employee-card")

  employeeCards.forEach((card) => {
    const employeeText = card.textContent.toLowerCase()
    const employeeDepartment = card.dataset.department

    const matchesSearch = employeeText.includes(searchTerm)
    const matchesDepartment = !selectedDepartment || employeeDepartment === selectedDepartment

    if (matchesSearch && matchesDepartment) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

function setupModal() {
  const modal = document.getElementById("addEmployeeModal")
  const addBtn = document.getElementById("addEmployeeBtn")
  const closeBtn = document.getElementById("closeModal")
  const cancelBtn = document.getElementById("cancelBtn")
  const form = document.getElementById("addEmployeeForm")

  addBtn.addEventListener("click", () => {
    modal.classList.add("active")
  })

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active")
    form.reset()
  })

  cancelBtn.addEventListener("click", () => {
    modal.classList.remove("active")
    form.reset()
  })

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
      form.reset()
    }
  })

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const employeeData = {
      id: Date.now(),
      firstName: document.getElementById("empFirstName").value,
      lastName: document.getElementById("empLastName").value,
      email: document.getElementById("empEmail").value,
      department: document.getElementById("empDepartment").value,
      position: document.getElementById("empPosition").value,
      salary: Number.parseInt(document.getElementById("empSalary").value),
      startDate: document.getElementById("empStartDate").value,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    // Validate email uniqueness
    const employees = getEmployees()
    if (employees.some((emp) => emp.email === employeeData.email)) {
      showNotification("An employee with this email already exists", "error")
      return
    }

    // Add employee
    employees.push(employeeData)
    localStorage.setItem("employees", JSON.stringify(employees))

    // Refresh employee list
    loadEmployees()

    // Close modal and reset form
    modal.classList.remove("active")
    this.reset()

    showNotification("Employee added successfully!", "success")
  })
}

function getEmployees() {
  return JSON.parse(localStorage.getItem("employees") || "[]")
}

function getInitials(firstName, lastName) {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}

function formatDepartment(dept) {
  const departments = {
    hr: "Human Resources",
    it: "Information Technology",
    finance: "Finance",
    marketing: "Marketing",
    sales: "Sales",
    operations: "Operations",
  }
  return departments[dept] || dept
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function updateDateTime() {
  const now = new Date()
  const dateDisplay = document.getElementById("currentDate")

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  dateDisplay.textContent = now.toLocaleDateString("en-US", options)
}

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
        z-index: 1001;
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

// Initialize some sample data if none exists
function initializeSampleData() {
  const employees = getEmployees()
  if (employees.length === 0) {
    const sampleEmployees = [
      {
        id: 1,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@company.com",
        department: "marketing",
        position: "Marketing Manager",
        salary: 75000,
        startDate: "2023-01-15",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@company.com",
        department: "it",
        position: "Software Developer",
        salary: 85000,
        startDate: "2022-08-20",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@company.com",
        department: "hr",
        position: "HR Specialist",
        salary: 65000,
        startDate: "2023-03-10",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem("employees", JSON.stringify(sampleEmployees))
  }
}

// Initialize sample data on first load
initializeSampleData()
