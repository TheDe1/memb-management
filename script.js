// script.js
let students = [];
let deletedControlNumbers = [];
let currentFilter = {
    search: '',
    year: '',
    dateFrom: '',
    dateTo: ''
};
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadStudents();
    initializeEventListeners();
});

function initializeEventListeners() {
    const registrationForm = document.getElementById('registrationForm');
    const editForm = document.getElementById('editForm');
    

    registrationForm.removeEventListener('submit', registerStudent);
    registrationForm.addEventListener('submit', registerStudent);
    
    editForm.removeEventListener('submit', updateStudent);
    editForm.addEventListener('submit', updateStudent);
    
  
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStudents();
        }
    });
}


function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    window.currentTheme = newTheme;
    
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = newTheme === 'dark' ? '☀️' : '🌙 ';
}

function loadTheme() {
    const savedTheme = window.currentTheme || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = savedTheme === 'dark' ? '☀️ ' : '🌙 ';
}


function loadStudents() {
    
    updateDisplay();
}


function generateControlNumber() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    if (deletedControlNumbers.length > 0) {
        return deletedControlNumbers.shift();
    }
    
    let number = 1;
    let controlNumber;
    
    do {
        const numberStr = String(number).padStart(3, '0');
        controlNumber = `ICSO-${month}-${day}-${numberStr}`;
        number++;
    } while (students.some(student => student.controlNumber === controlNumber));
    
    return controlNumber;
}


async function registerStudent(e) {
    e.preventDefault();
    

    if (isSubmitting) {
        return;
    }
    
    isSubmitting = true;
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';
    
    try {
        const studentNumber = document.getElementById('studentNumber').value.trim();
        
 
        if (!studentNumber) {
            showAlert('Student number is required!', 'error');
            return;
        }
        
      
        if (students.some(student => student.studentNumber === studentNumber)) {
            showAlert('Student number already exists!', 'error');
            return;
        }
        
        const studentData = {
            id: Date.now() + Math.random(), 
            name: document.getElementById('studentName').value.trim(),
            studentNumber: studentNumber,
            schoolYear: document.getElementById('schoolYear').value,
            membershipFee: parseFloat(document.getElementById('membershipFee').value),
            controlNumber: generateControlNumber(),
            registrationDate: new Date().toISOString().split('T')[0]
        };
        
        if (!studentData.name || !studentData.schoolYear || !studentData.membershipFee) {
            showAlert('Please fill in all required fields!', 'error');
            return;
        }
        
        
        students.push(studentData);
        
       
        updateDisplay();
        

        document.getElementById('registrationForm').reset();
        document.getElementById('membershipFee').value = '20'; // Reset to default
        
        showAlert(`Student registered successfully! Control Number: ${studentData.controlNumber}`, 'success');
        
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Registration failed. Please try again.', 'error');
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Register Student';
    }
}

function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    currentFilter.search = searchTerm;
    updateDisplay();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentFilter.search = '';
    updateDisplay();
}


function applyFilters() {
    currentFilter.year = document.getElementById('yearFilter').value;
    currentFilter.dateFrom = document.getElementById('dateFrom').value;
    currentFilter.dateTo = document.getElementById('dateTo').value;
    updateDisplay();
}

function getFilteredStudents() {
    return students.filter(student => {
   
        if (currentFilter.search) {
            const searchTerm = currentFilter.search;
            if (!student.name.toLowerCase().includes(searchTerm) && 
                !student.studentNumber.toLowerCase().includes(searchTerm) && 
                !student.controlNumber.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }
        
       
        if (currentFilter.year && student.schoolYear !== currentFilter.year) {
            return false;
        }
       
        if (currentFilter.dateFrom && student.registrationDate < currentFilter.dateFrom) {
            return false;
        }
        if (currentFilter.dateTo && student.registrationDate > currentFilter.dateTo) {
            return false;
        }
        
        return true;
    });
}


function updateDisplay() {
    const filteredStudents = getFilteredStudents();
    updateTable(filteredStudents);
    updateStatistics(filteredStudents);
}


function calculateStats(studentsData) {
    const totalMembers = studentsData.length;
    const totalRevenue = studentsData.reduce((sum, student) => sum + (student.membershipFee || 0), 0);
    
    const yearCounts = {
        '1st Year': 0,
        '2nd Year': 0,
        '3rd Year': 0,
        '4th Year': 0
    };
    
    studentsData.forEach(student => {
        if (yearCounts.hasOwnProperty(student.schoolYear)) {
            yearCounts[student.schoolYear]++;
        }
    });
    
    return {
        totalMembers,
        totalRevenue,
        yearCounts
    };
}


function updateStatistics(filteredStudents = students) {
    const stats = calculateStats(filteredStudents);
    
    document.getElementById('totalMembers').textContent = stats.totalMembers;
    document.getElementById('totalRevenue').textContent = `₱${stats.totalRevenue.toLocaleString()}`;
    document.getElementById('firstYearCount').textContent = stats.yearCounts['1st Year'];
    document.getElementById('secondYearCount').textContent = stats.yearCounts['2nd Year'];
    document.getElementById('thirdYearCount').textContent = stats.yearCounts['3rd Year'];
    document.getElementById('fourthYearCount').textContent = stats.yearCounts['4th Year'];
}


function updateTable(filteredStudents = students) {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="empty-state">
                <h3>No students found</h3>
                <p>No students match your current filters.</p>
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.controlNumber || 'N/A'}</td>
            <td>${student.name || 'N/A'}</td>
            <td>${student.studentNumber || 'N/A'}</td>
            <td>${student.schoolYear || 'N/A'}</td>
            <td>₱${(student.membershipFee || 0).toLocaleString()}</td>
            <td>${student.registrationDate || 'N/A'}</td>
            <td class="actions">
                <button class="btn btn-warning btn-small" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


function editStudent(id) {
    const student = students.find(s => s.id == id);
    if (!student) {
        showAlert('Student not found!', 'error');
        return;
    }
    
    document.getElementById('editId').value = student.id;
    document.getElementById('editName').value = student.name || '';
    document.getElementById('editNumber').value = student.studentNumber || '';
    document.getElementById('editYear').value = student.schoolYear || '';
    document.getElementById('editFee').value = student.membershipFee || 0;
    
    document.getElementById('editModal').style.display = 'block';
}

async function updateStudent(e) {
    e.preventDefault();
    
    
    if (isSubmitting) {
        return;
    }
    
    isSubmitting = true;
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Updating...';
    
    try {
        const id = document.getElementById('editId').value;
        const newStudentNumber = document.getElementById('editNumber').value.trim();
        

        if (!newStudentNumber) {
            showAlert('Student number is required!', 'error');
            return;
        }
        

        if (students.some(student => student.studentNumber === newStudentNumber && student.id != id)) {
            showAlert('Student number already exists!', 'error');
            return;
        }
        
        const updatedData = {
            name: document.getElementById('editName').value.trim(),
            studentNumber: newStudentNumber,
            schoolYear: document.getElementById('editYear').value,
            membershipFee: parseFloat(document.getElementById('editFee').value) || 0
        };
        
     
        if (!updatedData.name || !updatedData.schoolYear) {
            showAlert('Please fill in all required fields!', 'error');
            return;
        }
        
       
        const studentIndex = students.findIndex(s => s.id == id);
        if (studentIndex !== -1) {
            students[studentIndex] = { ...students[studentIndex], ...updatedData };
            
            updateDisplay();
            closeEditModal();
            showAlert('Student updated successfully!', 'success');
        } else {
            showAlert('Student not found!', 'error');
        }
        
    } catch (error) {
        console.error('Update error:', error);
        showAlert('Update failed. Please try again.', 'error');
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Update Student';
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}


function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        const studentIndex = students.findIndex(s => s.id == id);
        if (studentIndex !== -1) {
            const deletedStudent = students[studentIndex];
            
            
            if (deletedStudent.controlNumber) {
                deletedControlNumbers.push(deletedStudent.controlNumber);
                deletedControlNumbers.sort();
            }
            
            students.splice(studentIndex, 1);
            updateDisplay();
            showAlert('Student deleted successfully!', 'success');
        } else {
            showAlert('Student not found!', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showAlert('Delete failed. Please try again.', 'error');
    }
}


function deleteAllMembers() {
    if (!confirm('Are you sure you want to delete ALL students? This action cannot be undone!')) return;
    
    try {
        students = [];
        deletedControlNumbers = [];
        updateDisplay();
        showAlert('All students deleted successfully!', 'success');
    } catch (error) {
        console.error('Delete all error:', error);
        showAlert('Delete all failed. Please try again.', 'error');
    }
}


function exportData() {
    const filteredStudents = getFilteredStudents();
    
    if (filteredStudents.length === 0) {
        showAlert('No data to export!', 'error');
        return;
    }
    
    try {
        let csvContent = 'Control Number,Name,Student Number,School Year,Membership Fee,Registration Date\n';
        
        filteredStudents.forEach(student => {
            const controlNumber = student.controlNumber || 'N/A';
            const name = (student.name || 'N/A').replace(/"/g, '""'); 
            const studentNumber = student.studentNumber || 'N/A';
            const schoolYear = student.schoolYear || 'N/A';
            const membershipFee = student.membershipFee || 0;
            const registrationDate = student.registrationDate || 'N/A';
            
            csvContent += `"${controlNumber}","${name}","${studentNumber}","${schoolYear}","${membershipFee}","${registrationDate}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `student_members_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showAlert('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showAlert('Export failed. Please try again.', 'error');
    }
}


function showAlert(message, type) {
    const alertId = type === 'success' ? 'successAlert' : 'errorAlert';
    const alertElement = document.getElementById(alertId);
    
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
     
        if (alertElement.timeoutId) {
            clearTimeout(alertElement.timeoutId);
        }
        
    
        alertElement.timeoutId = setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}


window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}


document.addEventListener('keydown', function(e) {
   
    if (e.key === 'Escape') {
        closeEditModal();
    }
    

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportData();
    }
});


function validateStudentNumber(studentNumber) {
  
    return studentNumber && studentNumber.trim().length > 0;
}

function validateName(name) {
    return name && name.trim().length >= 2;
}

function validateFee(fee) {
    return !isNaN(fee) && fee >= 0;
}

function autoSave() {
    
}

console.log('Student Membership System loaded successfully!');



