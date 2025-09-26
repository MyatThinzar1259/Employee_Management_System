document.addEventListener("DOMContentLoaded", () => {
  // Initialize dashboard
  initializeDashboard()
  setupNavigation()
  setupEmployeeManagement()
  setupModal()
  setupRoleModal()
  setupEmployeeDetailModal()
  updateDateTime()

  // Update date every minute
  setInterval(updateDateTime, 60000)
})

let currentPage = 1
const employeesPerPage = 6
let filteredEmployees = []

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
  const mobileMenuToggle = document.getElementById("mobileMenuToggle")
  const sidebar = document.querySelector(".sidebar")

  // Create mobile overlay
  const overlay = document.createElement("div")
  overlay.className = "sidebar-overlay"
  document.body.appendChild(overlay)

  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
      mobileMenuToggle.classList.toggle("active")
      overlay.classList.toggle("active")

      // Prevent body scroll when sidebar is open
      if (sidebar.classList.contains("active")) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
    })

    // Close sidebar when clicking overlay
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active")
      mobileMenuToggle.classList.remove("active")
      overlay.classList.remove("active")
      document.body.style.overflow = ""
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !mobileMenuToggle.contains(e.target) &&
        sidebar.classList.contains("active")
      ) {
        sidebar.classList.remove("active")
        mobileMenuToggle.classList.remove("active")
        overlay.classList.remove("active")
        document.body.style.overflow = ""
      }
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("active")
        mobileMenuToggle.classList.remove("active")
        overlay.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  }

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

      // Close mobile menu after selection
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active")
        overlay.classList.remove("active")
        document.body.style.overflow = ""
        if (mobileMenuToggle) {
          mobileMenuToggle.classList.remove("active")
        }
      }
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
    roles: {
      title: "Role Management",
      subtitle: "Define and manage user roles and permissions.",
    },
    departments: {
      title: "Department Management",
      subtitle: "Organize and manage company departments.",
    },
    assets: {
      title: "Asset Management",
      subtitle: "Track and manage company assets and equipment.",
    },
    holidays: {
      title: "Holiday Management",
      subtitle: "Manage company holidays and special events.",
    },
    leaves: {
      title: "Leave Management",
      subtitle: "Handle employee leave requests and approvals.",
    },
    certification: {
      title: "Certification Management",
      subtitle: "Track employee certifications and qualifications.",
    },
    skills: {
      title: "Skills Management",
      subtitle: "Manage employee skills and competencies.",
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
  //loadEmployees()
  setupEmployeeFilters()
  setupPagination()
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
  const profilePhotoInput = document.getElementById("empProfilePhoto")
  const filePreview = document.getElementById("empFilePreview")

  profilePhotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.innerHTML = `
          <div class="preview-image">
            <img src="${e.target.result}" alt="Profile preview" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
            <span class="file-name">${file.name}</span>
          </div>
        `
      }
      reader.readAsDataURL(file)
    } else {
      filePreview.innerHTML = ""
    }
  })

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault()

    // Get selected gender value
    const selectedGender = document.querySelector('input[name="empGender"]:checked')

    const employeeData = {
      id: Date.now(),
      name: document.getElementById("empName").value,
      email: document.getElementById("empEmail").value,
      phone: document.getElementById("empPhone").value,
      address: document.getElementById("empAddress").value,
      gender: selectedGender ? selectedGender.value : "",
      dateOfBirth: document.getElementById("empDateOfBirth").value,
      department: document.getElementById("empDepartment").value,
      role: document.getElementById("empRole").value,
      position: document.getElementById("empPosition").value,
      basicSalary: Number.parseInt(document.getElementById("empBasicSalary").value),
      startDate: document.getElementById("empStartDate").value,
      profilePhoto: null, // Will be handled separately if needed
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

    // Refresh employee list with pagination
    loadEmployees()

    // Close modal and reset form
    modal.classList.remove("active")
    this.reset()

    showNotification("Employee added successfully!", "success")
  })
}

function setupRoleModal() {
  const modal = document.getElementById("addRoleModal")
  const addBtn = document.getElementById("addRoleBtn")
  const closeBtn = document.getElementById("closeRoleModal")
  const cancelBtn = document.getElementById("cancelRoleBtn")
  const form = document.getElementById("addRoleForm")

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

    // Get selected permissions
    const selectedPermissions = Array.from(document.querySelectorAll('input[name="rolePermissions"]:checked')).map(
      (checkbox) => checkbox.value,
    )

    // Get selected status
    const selectedStatus = document.querySelector('input[name="roleStatus"]:checked')

    // Validate salary range
    const minSalary = Number.parseInt(document.getElementById("roleMinSalary").value)
    const maxSalary = Number.parseInt(document.getElementById("roleMaxSalary").value)

    if (minSalary >= maxSalary) {
      showNotification("Maximum salary must be greater than minimum salary", "error")
      return
    }

    const roleData = {
      id: Date.now(),
      name: document.getElementById("roleName").value,
      description: document.getElementById("roleDescription").value,
      level: document.getElementById("roleLevel").value,
      department: document.getElementById("roleDepartment").value,
      minSalary: minSalary,
      maxSalary: maxSalary,
      permissions: selectedPermissions,
      status: selectedStatus ? selectedStatus.value : "active",
      createdAt: new Date().toISOString(),
    }

    // Validate role name uniqueness
    const roles = getRoles()
    if (roles.some((role) => role.name.toLowerCase() === roleData.name.toLowerCase())) {
      showNotification("A role with this name already exists", "error")
      return
    }

    // Add role
    roles.push(roleData)
    localStorage.setItem("roles", JSON.stringify(roles))

    // Refresh roles display (you can implement this later)
    loadRoles()

    // Close modal and reset form
    modal.classList.remove("active")
    this.reset()

    showNotification("Role added successfully!", "success")
  })
}

function getRoles() {
  return JSON.parse(localStorage.getItem("roles") || "[]")
}

function loadRoles() {
  // This function can be expanded later to display roles in the UI
  const roles = getRoles()
  console.log("Roles loaded:", roles)
}

function loadEmployees() {
  const employees = getEmployees()
  filteredEmployees = employees
  currentPage = 1
  displayEmployees()
  updatePaginationInfo()
  generatePaginationNumbers()
}

function setupEmployeeDetailModal() {
  const modal = document.getElementById("employeeDetailModal")
  const closeBtn = document.getElementById("closeEmployeeDetailModal")

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active")
  })

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
    }
  })

  // Setup action buttons
  const editBtn = document.getElementById("editEmployeeBtn")
  const deactivateBtn = document.getElementById("deactivateEmployeeBtn")
  const deleteBtn = document.getElementById("deleteEmployeeBtn")

  editBtn.addEventListener("click", () => {
    // TODO: Implement edit functionality
    showNotification("Edit functionality coming soon!", "info")
  })

  deactivateBtn.addEventListener("click", () => {
    // TODO: Implement deactivate functionality
    showNotification("Deactivate functionality coming soon!", "info")
  })

  deleteBtn.addEventListener("click", () => {
    // TODO: Implement delete functionality
    if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      showNotification("Delete functionality coming soon!", "info")
    }
  })
}

function showEmployeeDetail(employeeId) {
  const employees = getEmployees()
  const employee = employees.find((emp) => emp.id == employeeId)

  if (!employee) {
    showNotification("Employee not found", "error")
    return
  }

  // Populate modal with employee data
  document.getElementById("detailEmployeeAvatar").textContent = getInitials(
    employee.name || `${employee.firstName} ${employee.lastName}`,
  )
  document.getElementById("detailEmployeeName").textContent =
    employee.name || `${employee.firstName} ${employee.lastName}`
  document.getElementById("detailEmployeePosition").textContent = employee.position || "Employee"
  document.getElementById("detailEmployeeStatus").textContent = employee.isActive !== false ? "Active" : "Inactive"
  document.getElementById("detailEmployeeStatus").className =
    `employee-status ${employee.isActive !== false ? "active" : "inactive"}`

  // Personal Information
  document.getElementById("detailFullName").textContent = employee.name || `${employee.firstName} ${employee.lastName}`
  document.getElementById("detailEmail").textContent = employee.email || "-"
  document.getElementById("detailPhone").textContent = employee.phone || "-"
  document.getElementById("detailAddress").textContent = employee.address || "-"
  document.getElementById("detailGender").textContent = employee.gender
    ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)
    : "-"
  document.getElementById("detailDateOfBirth").textContent = employee.dateOfBirth
    ? formatDate(employee.dateOfBirth)
    : "-"

  // Work Information
  document.getElementById("detailDepartment").textContent = formatDepartment(employee.department)
  document.getElementById("detailRole").textContent = formatRole(employee.role)
  document.getElementById("detailPosition").textContent = employee.position || "-"
  document.getElementById("detailSalary").textContent =
    employee.basicSalary || employee.salary ? `$${(employee.basicSalary || employee.salary).toLocaleString()}` : "-"
  document.getElementById("detailStartDate").textContent = employee.startDate ? formatDate(employee.startDate) : "-"
  document.getElementById("detailEmployeeId").textContent = employee.id || "-"

  // Show modal
  document.getElementById("employeeDetailModal").classList.add("active")
}

function displayEmployees() {
  const employeeGrid = document.getElementById("employeeGrid")

  if (filteredEmployees.length === 0) {
    employeeGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
        <div style="font-size: 3rem; margin-bottom: 20px;">👥</div>
        <h3>No employees found</h3>
        <p>Start by adding your first employee to the system.</p>
      </div>
    `
    document.getElementById("paginationContainer").style.display = "none"
    return
  }

  // Calculate pagination
  // const startIndex = (currentPage - 1) * employeesPerPage
  // const endIndex = startIndex + employeesPerPage
  // const employeesToShow = filteredEmployees.slice(startIndex, endIndex)

  employeeGrid.innerHTML = employeesToShow
    .map(
      (employee) => `
        <div class="employee-card" data-department="${employee.department}" data-employee-id="${employee.id}">
            <div class="employee-header">
                <div class="employee-avatar">
                    ${getInitials(employee.name || `${employee.firstName} ${employee.lastName}`)}
                </div>
                <div class="employee-info">
                    <h4>${employee.name || `${employee.firstName} ${employee.lastName}`}</h4>
                    <p>${employee.position || "Employee"}</p>
                </div>
            </div>
            <div class="employee-details">
                <div class="employee-detail">
                    <span>Department:</span>
                    <span>${formatDepartment(employee.department)}</span>
                </div>
                <div class="employee-detail">
                    <span>Role:</span>
                    <span>${formatRole(employee.role)}</span>
                </div>
                <div class="employee-detail">
                    <span>Email:</span>
                    <span>${employee.email}</span>
                </div>
                <div class="employee-detail">
                    <span>Phone:</span>
                    <span>${employee.phone || "N/A"}</span>
                </div>
                <div class="employee-detail">
                    <span>Salary:</span>
                    <span>$${(employee.basicSalary || employee.salary || 0).toLocaleString()}</span>
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

  const employeeCards = employeeGrid.querySelectorAll(".employee-card")
  employeeCards.forEach((card) => {
    card.addEventListener("click", () => {
      const employeeId = card.dataset.employeeId
      showEmployeeDetail(employeeId)
    })
  })

  // Show pagination if there are employees
  // document.getElementById("paginationContainer").style.display =
  //   filteredEmployees.length > employeesPerPage ? "flex" : "none"
}

function filterEmployees() {
  const searchTerm = document.getElementById("employeeSearch").value.toLowerCase()
  const selectedDepartment = document.getElementById("departmentFilter").value
  const allEmployees = getEmployees()

  filteredEmployees = allEmployees.filter((employee) => {
    const employeeText =
      `${employee.name || `${employee.firstName} ${employee.lastName}`} ${employee.email} ${employee.position || ""} ${formatDepartment(employee.department)}`.toLowerCase()
    const matchesSearch = employeeText.includes(searchTerm)
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment

    return matchesSearch && matchesDepartment
  })

  currentPage = 1
  displayEmployees()
  updatePaginationInfo()
  generatePaginationNumbers()
}

function setupPagination() {
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      displayEmployees()
      updatePaginationInfo()
      generatePaginationNumbers()
    }
  })

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage)
    if (currentPage < totalPages) {
      currentPage++
      displayEmployees()
      updatePaginationInfo()
      generatePaginationNumbers()
    }
  })
}

function updatePaginationInfo() {
  const totalEmployees = filteredEmployees.length
  const startIndex = (currentPage - 1) * employeesPerPage + 1
  const endIndex = Math.min(currentPage * employeesPerPage, totalEmployees)
  const totalPages = Math.ceil(totalEmployees / employeesPerPage)

  const paginationInfo = document.getElementById("paginationInfo")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  if (totalEmployees === 0) {
    paginationInfo.textContent = "No employees found"
  } else {
    paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalEmployees} employees`
  }

  // Update button states
  prevBtn.disabled = currentPage === 1
  nextBtn.disabled = currentPage === totalPages || totalPages === 0
}

function generatePaginationNumbers() {
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage)
  const paginationNumbers = document.getElementById("paginationNumbers")

  if (totalPages <= 1) {
    paginationNumbers.innerHTML = ""
    return
  }

  let numbersHTML = ""
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total pages is small
    for (let i = 1; i <= totalPages; i++) {
      numbersHTML += `
        <div class="pagination-number ${i === currentPage ? "active" : ""}" data-page="${i}">
          ${i}
        </div>
      `
    }
  } else {
    // Show pages with ellipsis for larger page counts
    if (currentPage <= 3) {
      // Show first few pages
      for (let i = 1; i <= 4; i++) {
        numbersHTML += `
          <div class="pagination-number ${i === currentPage ? "active" : ""}" data-page="${i}">
            ${i}
          </div>
        `
      }
      numbersHTML += `<span class="pagination-ellipsis">...</span>`
      numbersHTML += `
        <div class="pagination-number" data-page="${totalPages}">
          ${totalPages}
        </div>
      `
    } else if (currentPage >= totalPages - 2) {
      // Show last few pages
      numbersHTML += `
        <div class="pagination-number" data-page="1">
          1
        </div>
      `
      numbersHTML += `<span class="pagination-ellipsis">...</span>`
      for (let i = totalPages - 3; i <= totalPages; i++) {
        numbersHTML += `
          <div class="pagination-number ${i === currentPage ? "active" : ""}" data-page="${i}">
            ${i}
          </div>
        `
      }
    } else {
      // Show middle pages
      numbersHTML += `
        <div class="pagination-number" data-page="1">
          1
        </div>
      `
      numbersHTML += `<span class="pagination-ellipsis">...</span>`
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        numbersHTML += `
          <div class="pagination-number ${i === currentPage ? "active" : ""}" data-page="${i}">
            ${i}
          </div>
        `
      }
      numbersHTML += `<span class="pagination-ellipsis">...</span>`
      numbersHTML += `
        <div class="pagination-number" data-page="${totalPages}">
          ${totalPages}
        </div>
      `
    }
  }

  paginationNumbers.innerHTML = numbersHTML

  // Add click event listeners to page numbers
  const pageNumbers = paginationNumbers.querySelectorAll(".pagination-number")
  pageNumbers.forEach((pageNumber) => {
    pageNumber.addEventListener("click", () => {
      const page = Number.parseInt(pageNumber.dataset.page)
      if (page !== currentPage) {
        currentPage = page
        displayEmployees()
        updatePaginationInfo()
        generatePaginationNumbers()
      }
    })
  })
}

function setupEmployeeFilters() {
  const searchInput = document.getElementById("employeeSearch")
  const departmentFilter = document.getElementById("departmentFilter")

  searchInput.addEventListener("input", filterEmployees)
  departmentFilter.addEventListener("change", filterEmployees)
}

function getInitials(fullName) {
  if (!fullName) return "??"
  const names = fullName.trim().split(" ")
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase() + names[0].charAt(1).toUpperCase()
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
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

function formatRole(role) {
  const roles = {
    manager: "Manager",
    senior: "Senior Employee",
    junior: "Junior Employee",
    intern: "Intern",
    contractor: "Contractor",
  }
  return roles[role] || role || "Employee"
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
        ${
          type === "success"
            ? "background: #a8e6cf; color: #374151;"
            : type === "error"
              ? "background: #ff6f61;"
              : type === "info"
                ? "background: #60a5fa; color: #374151;"
                : "background: #ff6f61;"
        }
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

function getEmployees() {
  return JSON.parse(localStorage.getItem("employees") || "[]")
}

// Initialize some sample data if none exists
function initializeSampleData() {
  const employees = getEmployees()
  if (employees.length === 0) {
    const sampleEmployees = [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        department: "marketing",
        position: "Marketing Manager",
        basicSalary: 75000,
        startDate: "2023-01-15",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "michael.chen@company.com",
        department: "it",
        position: "Software Developer",
        basicSalary: 85000,
        startDate: "2022-08-20",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Emily Davis",
        email: "emily.davis@company.com",
        department: "hr",
        position: "HR Specialist",
        basicSalary: 65000,
        startDate: "2023-03-10",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem("employees", JSON.stringify(sampleEmployees))
  }
}

function initializeSampleRoles() {
  const roles = getRoles()
  if (roles.length === 0) {
    const sampleRoles = [
      {
        id: 1,
        name: "Administrator",
        description: "Full system access and management capabilities",
        level: "executive",
        department: "all",
        minSalary: 80000,
        maxSalary: 120000,
        permissions: ["read", "write", "delete", "admin"],
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Manager",
        description: "Team management and reporting access",
        level: "senior",
        department: "all",
        minSalary: 60000,
        maxSalary: 90000,
        permissions: ["read", "write"],
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Employee",
        description: "Basic access to personal information and tasks",
        level: "mid",
        department: "all",
        minSalary: 40000,
        maxSalary: 70000,
        permissions: ["read"],
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem("roles", JSON.stringify(sampleRoles))
  }
}

// Initialize sample data on first load
initializeSampleData()
initializeSampleRoles()
