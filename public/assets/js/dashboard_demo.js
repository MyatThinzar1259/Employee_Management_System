document.addEventListener("DOMContentLoaded", () => {
  // Initialize dashboard
  initializeDashboard()
  setupNavigation()
  setupEmployeeManagement()
  setupModal()
  setupRoleModal()
  setupEmployeeDetailModal()
  setupAttendanceSection()
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

      if (this.dataset.section === "payroll") {
        setTimeout(() => {
          setupPayrollSection()
        }, 100)
      }

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
  loadEmployees()
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
  const startIndex = (currentPage - 1) * employeesPerPage
  const endIndex = startIndex + employeesPerPage
  const employeesToShow = filteredEmployees.slice(startIndex, endIndex)

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
  document.getElementById("paginationContainer").style.display =
    filteredEmployees.length > employeesPerPage ? "flex" : "none"
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

function setupAttendanceSection() {
  setupAttendanceTabs()
  setupAttendanceCharts()
  setupAttendanceFilters()
  setupAttendanceActions()
  initializeAttendanceData()
}

function setupAttendanceTabs() {
  console.log("[v0] Setting up attendance tabs")
  const tabButtons = document.querySelectorAll(".attendance-tabs .tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  console.log("[v0] Found tab buttons:", tabButtons.length)
  console.log("[v0] Found tab contents:", tabContents.length)

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab
      console.log("[v0] Tab clicked:", targetTab)

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      const targetContent = document.getElementById(`${targetTab}-tab`)
      console.log("[v0] Target content element:", targetContent)

      if (targetContent) {
        targetContent.classList.add("active")
        console.log("[v0] Activated tab:", targetTab)
      } else {
        console.log("[v0] Tab content not found for:", targetTab)
      }

      // Initialize specific tab content
      switch (targetTab) {
        case "analytics":
          console.log("[v0] Initializing analytics charts")
          initializeAnalyticsCharts()
          break
        case "trends":
          console.log("[v0] Initializing trends charts")
          initializeTrendsCharts()
          break
        case "departments":
          console.log("[v0] Initializing department charts")
          initializeDepartmentCharts()
          break
        default:
          console.log("[v0] No special initialization for tab:", targetTab)
      }
    })
  })

  const firstTabButton = document.querySelector(".attendance-tabs .tab-btn[data-tab='overview']")
  const firstTabContent = document.getElementById("overview-tab")

  if (firstTabButton && firstTabContent) {
    firstTabButton.classList.add("active")
    firstTabContent.classList.add("active")
    console.log("[v0] Set overview tab as default active")
  }
}

function setupAttendanceCharts() {
  console.log("[v0] Setting up attendance charts")
  // Initialize charts when attendance section becomes active
  const attendanceNavItem = document.querySelector('[data-section="attendance"]')
  if (attendanceNavItem) {
    attendanceNavItem.addEventListener("click", () => {
      console.log("[v0] Attendance section clicked")
      setTimeout(() => {
        console.log("[v0] Initializing all charts after delay")
        initializeAnalyticsCharts()
        initializeTrendsCharts()
        initializeDepartmentCharts()
      }, 100)
    })
  }
}

function initializeAnalyticsCharts() {
  console.log("[v0] Initializing analytics charts")
  // Attendance Rate Chart
  const attendanceRateCtx = document.getElementById("attendanceRateChart")
  if (attendanceRateCtx && !attendanceRateCtx.chartInstance) {
    console.log("[v0] Creating attendance rate chart")
    const chart = createSimpleChart(attendanceRateCtx, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent", "Late"],
        datasets: [
          {
            data: [85, 10, 5],
            backgroundColor: ["#a8e6cf", "#ffb3ba", "#ffd93d"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
    attendanceRateCtx.chartInstance = chart
  } else {
    console.log("[v0] Attendance rate chart already exists or element not found")
  }

  // Monthly Attendance Chart
  const monthlyAttendanceCtx = document.getElementById("monthlyAttendanceChart")
  if (monthlyAttendanceCtx && !monthlyAttendanceCtx.chartInstance) {
    console.log("[v0] Creating monthly attendance chart")
    const chart = createSimpleChart(monthlyAttendanceCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Attendance Rate (%)",
            data: [88, 92, 85, 90, 87, 93],
            borderColor: "#a8e6cf",
            backgroundColor: "rgba(168, 230, 207, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    })
    monthlyAttendanceCtx.chartInstance = chart
  } else {
    console.log("[v0] Monthly attendance chart already exists or element not found")
  }
}

function initializeTrendsCharts() {
  // Weekly Trend Chart
  const weeklyTrendCtx = document.getElementById("weeklyTrendChart")
  if (weeklyTrendCtx && !weeklyTrendCtx.chartInstance) {
    const chart = createSimpleChart(weeklyTrendCtx, {
      type: "bar",
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        datasets: [
          {
            label: "Average Attendance",
            data: [45, 48, 42, 46, 40],
            backgroundColor: "#a8e6cf",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
    weeklyTrendCtx.chartInstance = chart
  }

  // Peak Hours Chart
  const peakHoursCtx = document.getElementById("peakHoursChart")
  if (peakHoursCtx && !peakHoursCtx.chartInstance) {
    const chart = createSimpleChart(peakHoursCtx, {
      type: "line",
      data: {
        labels: ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"],
        datasets: [
          {
            label: "Active Employees",
            data: [15, 42, 45, 47, 35, 38, 46, 48, 45, 20],
            borderColor: "#ffb3ba",
            backgroundColor: "rgba(255, 179, 186, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
    peakHoursCtx.chartInstance = chart
  }
}

function initializeDepartmentCharts() {
  // Department Comparison Chart
  const deptComparisonCtx = document.getElementById("deptComparisonChart")
  if (deptComparisonCtx && !deptComparisonCtx.chartInstance) {
    const chart = createSimpleChart(deptComparisonCtx, {
      type: "bar",
      data: {
        labels: ["HR", "IT", "Marketing", "Sales", "Finance"],
        datasets: [
          {
            label: "Attendance Rate (%)",
            data: [92, 88, 85, 90, 87],
            backgroundColor: ["#a8e6cf", "#ffb3ba", "#ffd93d", "#bae1ff", "#e6ccff"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    })
    deptComparisonCtx.chartInstance = chart
  }

  // Department Performance Chart
  const deptPerformanceCtx = document.getElementById("deptPerformanceChart")
  if (deptPerformanceCtx && !deptPerformanceCtx.chartInstance) {
    const chart = createSimpleChart(deptPerformanceCtx, {
      type: "radar",
      data: {
        labels: ["Punctuality", "Consistency", "Overtime", "Leave Usage", "Overall"],
        datasets: [
          {
            label: "IT Department",
            data: [85, 90, 75, 80, 88],
            borderColor: "#a8e6cf",
            backgroundColor: "rgba(168, 230, 207, 0.2)",
            pointBackgroundColor: "#a8e6cf",
          },
          {
            label: "Marketing Department",
            data: [80, 85, 70, 85, 85],
            borderColor: "#ffb3ba",
            backgroundColor: "rgba(255, 179, 186, 0.2)",
            pointBackgroundColor: "#ffb3ba",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    })
    deptPerformanceCtx.chartInstance = chart
  }
}

function setupAttendanceFilters() {
  // Date range filter
  const dateFromInput = document.getElementById("dateFrom")
  const dateToInput = document.getElementById("dateTo")
  const departmentSelect = document.getElementById("attendanceDepartmentFilter")
  const applyFiltersBtn = document.getElementById("applyFilters")

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      const dateFrom = dateFromInput?.value
      const dateTo = dateToInput?.value
      const department = departmentSelect?.value

      // Apply filters and refresh data
      filterAttendanceData(dateFrom, dateTo, department)
      showNotification("Filters applied successfully!", "success")
    })
  }

  // Quick filter buttons
  const quickFilterBtns = document.querySelectorAll(".quick-filter-btn")
  quickFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      quickFilterBtns.forEach((b) => b.classList.remove("active"))
      // Add active class to clicked button
      btn.classList.add("active")

      const period = btn.dataset.period
      applyQuickFilter(period)
    })
  })
}

function setupAttendanceActions() {
  // Export buttons
  const exportPdfBtn = document.getElementById("exportPdf")
  const exportExcelBtn = document.getElementById("exportExcel")
  const generateReportBtn = document.getElementById("generateReport")

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      showNotification("PDF export functionality coming soon!", "info")
    })
  }

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
      showNotification("Excel export functionality coming soon!", "info")
    })
  }

  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", () => {
      showNotification("Report generated successfully!", "success")
    })
  }

  // Report type buttons
  const reportTypeBtns = document.querySelectorAll(".report-type-btn")
  reportTypeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportType = btn.dataset.type
      generateSpecificReport(reportType)
    })
  })
}

function filterAttendanceData(dateFrom, dateTo, department) {
  // Simulate filtering logic
  console.log("[v0] Filtering attendance data:", { dateFrom, dateTo, department })

  // Refresh charts with filtered data
  refreshAttendanceCharts()
}

function applyQuickFilter(period) {
  console.log("[v0] Applying quick filter:", period)

  // Simulate quick filter logic
  const filterData = {
    today: { days: 1 },
    week: { days: 7 },
    month: { days: 30 },
    quarter: { days: 90 },
  }

  if (filterData[period]) {
    showNotification(`Showing data for last ${filterData[period].days} days`, "info")
    refreshAttendanceCharts()
  }
}

function generateSpecificReport(reportType) {
  const reportTypes = {
    daily: "Daily Attendance Report",
    weekly: "Weekly Summary Report",
    monthly: "Monthly Analysis Report",
    custom: "Custom Date Range Report",
  }

  const reportName = reportTypes[reportType] || "Attendance Report"
  showNotification(`${reportName} generated successfully!`, "success")
}

function refreshAttendanceCharts() {
  // Destroy existing charts and recreate with new data
  const chartElements = [
    "attendanceRateChart",
    "monthlyAttendanceChart",
    "weeklyTrendChart",
    "peakHoursChart",
    "deptComparisonChart",
    "deptPerformanceChart",
  ]

  chartElements.forEach((chartId) => {
    const element = document.getElementById(chartId)
    if (element && element.chartInstance) {
      element.chartInstance.destroy()
      element.chartInstance = null
    }
  })

  // Reinitialize charts
  setTimeout(() => {
    initializeAnalyticsCharts()
    initializeTrendsCharts()
    initializeDepartmentCharts()
  }, 100)
}

function initializeAttendanceData() {
  // Initialize sample attendance data if none exists
  const attendanceData = getAttendanceData()
  if (attendanceData.length === 0) {
    const sampleData = generateSampleAttendanceData()
    localStorage.setItem("attendanceData", JSON.stringify(sampleData))
  }
}

function getAttendanceData() {
  return JSON.parse(localStorage.getItem("attendanceData") || "[]")
}

function generateSampleAttendanceData() {
  const employees = getEmployees()
  const attendanceData = []

  // Generate sample data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    employees.forEach((employee) => {
      // Simulate attendance with 90% probability of being present
      const isPresent = Math.random() > 0.1
      const isLate = isPresent && Math.random() > 0.8

      attendanceData.push({
        id: Date.now() + Math.random(),
        employeeId: employee.id,
        employeeName: employee.name || `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        date: date.toISOString().split("T")[0],
        status: isPresent ? (isLate ? "late" : "present") : "absent",
        checkIn: isPresent
          ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}`
          : null,
        checkOut: isPresent
          ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}`
          : null,
        hoursWorked: isPresent ? (8 + Math.random() * 2).toFixed(1) : 0,
      })
    })
  }

  return attendanceData
}

// Simple chart creation function (since we don't have Chart.js)
function createSimpleChart(canvas, config) {
  const ctx = canvas.getContext("2d")

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Set canvas size
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  // Simple chart rendering based on type
  if (config.type === "doughnut") {
    drawDoughnutChart(ctx, config, canvas.width, canvas.height)
  } else if (config.type === "line") {
    drawLineChart(ctx, config, canvas.width, canvas.height)
  } else if (config.type === "bar") {
    drawBarChart(ctx, config, canvas.width, canvas.height)
  } else {
    // Fallback: draw a placeholder
    drawPlaceholderChart(ctx, config.type, canvas.width, canvas.height)
  }

  return {
    destroy: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}

function drawDoughnutChart(ctx, config, width, height) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 3
  const innerRadius = radius * 0.6

  const data = config.data.datasets[0].data
  const colors = config.data.datasets[0].backgroundColor
  const total = data.reduce((sum, value) => sum + value, 0)

  let currentAngle = -Math.PI / 2

  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
    ctx.closePath()
    ctx.fillStyle = colors[index]
    ctx.fill()

    currentAngle += sliceAngle
  })

  // Draw center text
  ctx.fillStyle = "#374151"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(`${total}%`, centerX, centerY)
}

function drawLineChart(ctx, config, width, height) {
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const data = config.data.datasets[0].data
  const labels = config.data.labels
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  // Draw axes
  ctx.strokeStyle = "#e5e7eb"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Draw line
  ctx.strokeStyle = config.data.datasets[0].borderColor
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = height - padding - ((value - minValue) / range) * chartHeight

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Draw points
  ctx.fillStyle = config.data.datasets[0].borderColor
  data.forEach((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = height - padding - ((value - minValue) / range) * chartHeight

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
}

function drawBarChart(ctx, config, width, height) {
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const data = config.data.datasets[0].data
  const labels = config.data.labels
  const maxValue = Math.max(...data)
  const barWidth = (chartWidth / data.length) * 0.6
  const barSpacing = chartWidth / data.length

  // Draw axes
  ctx.strokeStyle = "#e5e7eb"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Draw bars
  ctx.fillStyle = config.data.datasets[0].backgroundColor
  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * chartHeight
    const x = padding + index * barSpacing + (barSpacing - barWidth) / 2
    const y = height - padding - barHeight

    ctx.fillRect(x, y, barWidth, barHeight)
  })
}

function drawPlaceholderChart(ctx, type, width, height) {
  ctx.fillStyle = "#f3f4f6"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#9ca3af"
  ctx.font = "14px Arial"
  ctx.textAlign = "center"
  ctx.fillText(`${type.toUpperCase()} CHART`, width / 2, height / 2 - 10)
  ctx.fillText("Chart will render here", width / 2, height / 2 + 10)
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
    month: "long",
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

// Initialize some sample data on first load
initializeSampleData()
initializeSampleRoles()

function setupPayrollSection() {
  console.log("[v0] Setting up payroll section")
  setupPayrollTabs()
  setupPayrollCharts()
  setupPayrollFilters()
  setupPayrollActions()
  initializePayrollData()
}

function setupPayrollTabs() {
  console.log("[v0] Setting up payroll tabs")
  const tabButtons = document.querySelectorAll(".payroll-tabs .tab-btn")
  const tabContents = document.querySelectorAll(".payroll-section .tab-content")

  console.log("[v0] Found payroll tab buttons:", tabButtons.length)
  console.log("[v0] Found payroll tab contents:", tabContents.length)

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab
      console.log("[v0] Payroll tab clicked:", targetTab)

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      const targetContent = document.getElementById(`${targetTab}-tab`)
      console.log("[v0] Target payroll content element:", targetContent)

      if (targetContent) {
        targetContent.classList.add("active")
        console.log("[v0] Activated payroll tab:", targetTab)
      } else {
        console.log("[v0] Payroll tab content not found for:", targetTab)
      }

      // Initialize specific tab content
      switch (targetTab) {
        case "employee-payroll":
          console.log("[v0] Initializing employee payroll")
          initializeEmployeePayroll()
          break
        case "department-payroll":
          console.log("[v0] Initializing department payroll")
          initializeDepartmentPayroll()
          break
        case "building-reports":
          console.log("[v0] Initializing building reports")
          initializeBuildingReports()
          break
        default:
          console.log("[v0] No special initialization for payroll tab:", targetTab)
      }
    })
  })

  // Set first tab as active
  const firstTabButton = document.querySelector(".payroll-tabs .tab-btn[data-tab='overview']")
  const firstTabContent = document.getElementById("overview-tab")

  if (firstTabButton && firstTabContent) {
    firstTabButton.classList.add("active")
    firstTabContent.classList.add("active")
    console.log("[v0] Set payroll overview tab as default active")
  }
}

function setupPayrollCharts() {
  console.log("[v0] Setting up payroll charts")
  // Initialize charts when payroll section becomes active
  const payrollNavItem = document.querySelector('[data-section="payroll"]')
  if (payrollNavItem) {
    payrollNavItem.addEventListener("click", () => {
      console.log("[v0] Payroll section clicked")
      setTimeout(() => {
        console.log("[v0] Initializing all payroll charts after delay")
        initializeEmployeePayrollCharts()
        initializeDepartmentPayrollCharts()
        initializeBuildingReportsCharts()
      }, 100)
    })
  }
}

function initializeEmployeePayroll() {
  console.log("[v0] Initializing employee payroll")
  loadEmployeePayrollData()
  initializeEmployeePayrollCharts()
}

function initializeDepartmentPayroll() {
  console.log("[v0] Initializing department payroll")
  initializeDepartmentPayrollCharts()
}

function initializeBuildingReports() {
  console.log("[v0] Initializing building reports")
  initializeBuildingReportsCharts()
}

function loadEmployeePayrollData() {
  const employees = getEmployees()
  const employeePayrollGrid = document.getElementById("employeePayrollGrid")

  if (!employeePayrollGrid) {
    console.log("[v0] Employee payroll grid not found")
    return
  }

  const payrollCards = employees
    .map((employee) => {
      const basicSalary = employee.basicSalary || employee.salary || 0
      const allowances = Math.round(basicSalary * 0.15) // 15% allowances
      const deductions = Math.round(basicSalary * 0.08) // 8% deductions
      const netSalary = basicSalary + allowances - deductions

      return `
      <div class="employee-payroll-card" data-employee-id="${employee.id}">
        <div class="employee-payroll-header-card">
          <div class="employee-avatar-payroll">
            ${getInitials(employee.name || `${employee.firstName} ${employee.lastName}`)}
          </div>
          <div class="employee-payroll-info">
            <h4>${employee.name || `${employee.firstName} ${employee.lastName}`}</h4>
            <p>${employee.position || "Employee"} • ${formatDepartment(employee.department)}</p>
          </div>
        </div>
        <div class="payroll-details">
          <div class="payroll-detail-item">
            <span class="label">Basic Salary:</span>
            <span class="value">$${basicSalary.toLocaleString()}</span>
          </div>
          <div class="payroll-detail-item">
            <span class="label">Allowances:</span>
            <span class="value positive">+$${allowances.toLocaleString()}</span>
          </div>
          <div class="payroll-detail-item">
            <span class="label">Deductions:</span>
            <span class="value negative">-$${deductions.toLocaleString()}</span>
          </div>
          <div class="payroll-detail-item">
            <span class="label">Net Salary:</span>
            <span class="value">$${netSalary.toLocaleString()}</span>
          </div>
          <div class="payroll-detail-item">
            <span class="label">Status:</span>
            <span class="value positive">Processed</span>
          </div>
        </div>
      </div>
    `
    })
    .join("")

  employeePayrollGrid.innerHTML = payrollCards
}

function initializeEmployeePayrollCharts() {
  // Salary Distribution Chart
  const salaryDistributionCtx = document.getElementById("salaryDistributionChart")
  if (salaryDistributionCtx && !salaryDistributionCtx.chartInstance) {
    console.log("[v0] Creating salary distribution chart")
    const chart = createSimpleChart(salaryDistributionCtx, {
      type: "doughnut",
      data: {
        labels: ["$30k-50k", "$50k-70k", "$70k-90k", "$90k+"],
        datasets: [
          {
            data: [25, 35, 30, 10],
            backgroundColor: ["#a8e6cf", "#ffb3ba", "#ffd93d", "#bae1ff"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
    salaryDistributionCtx.chartInstance = chart
  }

  // Payroll Trends Chart
  const payrollTrendsCtx = document.getElementById("payrollTrendsChart")
  if (payrollTrendsCtx && !payrollTrendsCtx.chartInstance) {
    console.log("[v0] Creating payroll trends chart")
    const chart = createSimpleChart(payrollTrendsCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Total Payroll ($k)",
            data: [420, 435, 450, 465, 470, 485],
            borderColor: "#a8e6cf",
            backgroundColor: "rgba(168, 230, 207, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
    payrollTrendsCtx.chartInstance = chart
  }
}

function initializeDepartmentPayrollCharts() {
  // Individual department charts
  const departments = ["hr", "it", "marketing", "sales", "finance", "operations"]
  const departmentData = {
    hr: [65, 70, 68, 72, 75, 78],
    it: [110, 115, 120, 122, 125, 125],
    marketing: [80, 82, 85, 87, 89, 89],
    sales: [85, 88, 92, 95, 98, 99],
    finance: [60, 62, 63, 64, 65, 65],
    operations: [75, 78, 80, 82, 85, 88],
  }

  departments.forEach((dept) => {
    const chartCtx = document.getElementById(`${dept}PayrollChart`)
    if (chartCtx && !chartCtx.chartInstance) {
      console.log(`[v0] Creating ${dept} payroll chart`)
      const chart = createSimpleChart(chartCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Monthly Payroll ($k)",
              data: departmentData[dept],
              borderColor: "#a8e6cf",
              backgroundColor: "rgba(168, 230, 207, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
      chartCtx.chartInstance = chart
    }
  })

  // Department Comparison Chart
  const deptComparisonCtx = document.getElementById("departmentComparisonChart")
  if (deptComparisonCtx && !deptComparisonCtx.chartInstance) {
    console.log("[v0] Creating department comparison chart")
    const chart = createSimpleChart(deptComparisonCtx, {
      type: "bar",
      data: {
        labels: ["HR", "IT", "Marketing", "Sales", "Finance", "Operations"],
        datasets: [
          {
            label: "Total Payroll ($k)",
            data: [78, 125, 89, 99, 65, 88],
            backgroundColor: ["#a8e6cf", "#ffb3ba", "#ffd93d", "#bae1ff", "#e6ccff", "#d1d5db"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
    deptComparisonCtx.chartInstance = chart
  }
}

function initializeBuildingReportsCharts() {
  // Building Payroll Breakdown Chart
  const buildingBreakdownCtx = document.getElementById("buildingPayrollBreakdownChart")
  if (buildingBreakdownCtx && !buildingBreakdownCtx.chartInstance) {
    console.log("[v0] Creating building payroll breakdown chart")
    const chart = createSimpleChart(buildingBreakdownCtx, {
      type: "doughnut",
      data: {
        labels: ["Base Salaries", "Benefits", "Bonuses", "Overtime"],
        datasets: [
          {
            data: [86.5, 9.4, 3.1, 1.0],
            backgroundColor: ["#a8e6cf", "#ffb3ba", "#ffd93d", "#bae1ff"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
    buildingBreakdownCtx.chartInstance = chart
  }

  // Historical Trends Chart
  const historicalTrendsCtx = document.getElementById("historicalTrendsChart")
  if (historicalTrendsCtx && !historicalTrendsCtx.chartInstance) {
    console.log("[v0] Creating historical trends chart")
    const chart = createSimpleChart(historicalTrendsCtx, {
      type: "line",
      data: {
        labels: ["2020", "2021", "2022", "2023", "2024"],
        datasets: [
          {
            label: "Annual Payroll ($M)",
            data: [4.2, 4.8, 5.1, 5.4, 5.8],
            borderColor: "#a8e6cf",
            backgroundColor: "rgba(168, 230, 207, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Employee Count",
            data: [95, 108, 125, 135, 142],
            borderColor: "#ffb3ba",
            backgroundColor: "rgba(255, 179, 186, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
    historicalTrendsCtx.chartInstance = chart
  }
}

function setupPayrollFilters() {
  // Employee payroll filters
  const employeePayrollSearch = document.getElementById("employeePayrollSearch")
  const employeePayrollDept = document.getElementById("employeePayrollDept")
  const employeePayrollPeriod = document.getElementById("employeePayrollPeriod")

  if (employeePayrollSearch) {
    employeePayrollSearch.addEventListener("input", filterEmployeePayroll)
  }
  if (employeePayrollDept) {
    employeePayrollDept.addEventListener("change", filterEmployeePayroll)
  }
  if (employeePayrollPeriod) {
    employeePayrollPeriod.addEventListener("change", filterEmployeePayroll)
  }

  // Department comparison metric selector
  const comparisonMetric = document.getElementById("comparisonMetric")
  if (comparisonMetric) {
    comparisonMetric.addEventListener("change", updateDepartmentComparison)
  }
}

function setupPayrollActions() {
  // Employee payroll actions
  const bulkPayrollBtn = document.getElementById("bulkPayrollBtn")
  const generatePayslipBtn = document.getElementById("generatePayslipBtn")

  if (bulkPayrollBtn) {
    bulkPayrollBtn.addEventListener("click", () => {
      showNotification("Bulk payroll processing initiated!", "success")
    })
  }

  if (generatePayslipBtn) {
    generatePayslipBtn.addEventListener("click", () => {
      showNotification("Payslip generation started!", "success")
    })
  }

  // Department payroll actions
  const compareDeptBtn = document.getElementById("compareDeptBtn")
  const exportDeptPayrollBtn = document.getElementById("exportDeptPayrollBtn")

  if (compareDeptBtn) {
    compareDeptBtn.addEventListener("click", () => {
      showNotification("Department comparison report generated!", "success")
    })
  }

  if (exportDeptPayrollBtn) {
    exportDeptPayrollBtn.addEventListener("click", () => {
      showNotification("Department payroll report exported!", "success")
    })
  }

  // Building reports actions
  const scheduleReportBtn = document.getElementById("scheduleReportBtn")
  const generateBuildingReportBtn = document.getElementById("generateBuildingReportBtn")

  if (scheduleReportBtn) {
    scheduleReportBtn.addEventListener("click", () => {
      showNotification("Report scheduling functionality coming soon!", "info")
    })
  }

  if (generateBuildingReportBtn) {
    generateBuildingReportBtn.addEventListener("click", () => {
      showNotification("Organization-wide report generated successfully!", "success")
    })
  }
}

function filterEmployeePayroll() {
  const searchTerm = document.getElementById("employeePayrollSearch")?.value.toLowerCase() || ""
  const selectedDept = document.getElementById("employeePayrollDept")?.value || ""
  const selectedPeriod = document.getElementById("employeePayrollPeriod")?.value || ""

  console.log("[v0] Filtering employee payroll:", { searchTerm, selectedDept, selectedPeriod })

  // Apply filters and refresh data
  loadEmployeePayrollData()
  showNotification("Employee payroll filters applied!", "success")
}

function updateDepartmentComparison() {
  const metric = document.getElementById("comparisonMetric")?.value || "total"
  console.log("[v0] Updating department comparison metric:", metric)

  // Update comparison chart based on selected metric
  const deptComparisonCtx = document.getElementById("departmentComparisonChart")
  if (deptComparisonCtx && deptComparisonCtx.chartInstance) {
    deptComparisonCtx.chartInstance.destroy()
    deptComparisonCtx.chartInstance = null
  }

  setTimeout(() => {
    initializeDepartmentPayrollCharts()
  }, 100)

  showNotification(`Department comparison updated for ${metric}!`, "success")
}

function initializePayrollData() {
  // Initialize sample payroll data if none exists
  const payrollData = getPayrollData()
  if (payrollData.length === 0) {
    const sampleData = generateSamplePayrollData()
    localStorage.setItem("payrollData", JSON.stringify(sampleData))
  }
}

function getPayrollData() {
  return JSON.parse(localStorage.getItem("payrollData") || "[]")
}

function generateSamplePayrollData() {
  const employees = getEmployees()
  const payrollData = []

  employees.forEach((employee) => {
    const basicSalary = employee.basicSalary || employee.salary || 0
    const allowances = Math.round(basicSalary * 0.15)
    const deductions = Math.round(basicSalary * 0.08)
    const netSalary = basicSalary + allowances - deductions

    payrollData.push({
      id: Date.now() + Math.random(),
      employeeId: employee.id,
      employeeName: employee.name || `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      basicSalary: basicSalary,
      allowances: allowances,
      deductions: deductions,
      netSalary: netSalary,
      status: "processed",
      payPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
      processedDate: new Date().toISOString(),
    })
  })

  return payrollData
}
